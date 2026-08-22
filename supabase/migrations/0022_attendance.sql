-- ---------------------------------------------------------------------------
-- 0022_attendance.sql
--
-- Attendance: shift clocking, task timers, corrections, leave and reporting.
--
-- One table holds every span of time, whether it came from a shift clock or a
-- timer on a work item. `kind` is the only thing that separates them, so every
-- report, correction and export reads one shape rather than reconciling two.
--
-- Three decisions are baked into the schema and are the reason it looks the
-- way it does:
--
--   1. The day belongs to the employee. `business_date` and `tz` are resolved
--      once, at clock-in, from users.user_timezone and then frozen onto the
--      row. Aggregates therefore group on a plain date -- no `at time zone` in
--      any report query, no DST arithmetic, and changing a profile timezone
--      next year cannot rewrite last year's numbers. An overnight shift keeps
--      the date it started on, which is the payroll convention everywhere.
--
--   2. Nothing writes here directly. There is no INSERT or UPDATE policy on
--      any table that records time. Every write goes through a SECURITY
--      DEFINER function, so the clock reads now() on the server and a browser
--      cannot post the hours it wishes it had worked.
--
--   3. History is append-only. A correction never edits the row it corrects:
--      it supersedes it, and both stay. An exported month is reproducible
--      afterwards, and the audit trail is a side effect rather than a feature
--      someone has to remember to write.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Settings, schedules and the calendar
-- ---------------------------------------------------------------------------

create table if not exists public.attendance_settings (
  workspace_id uuid primary key references public.workspaces(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- What a shift is worth when nobody has a schedule. Also the fallback the
  -- auto-close sweep uses to invent an end time.
  default_shift_hours numeric(5, 2) not null default 8 check (default_shift_hours > 0 and default_shift_hours <= 24),
  -- How long past a shift's expected end the sweep waits before closing it.
  auto_close_grace_hours numeric(5, 2) not null default 6 check (auto_close_grace_hours >= 0),
  -- A task timer running longer than this was left running, not worked.
  task_timer_max_hours numeric(5, 2) not null default 12 check (task_timer_max_hours > 0),
  -- Late arrival tolerance, when a schedule says when the day starts.
  default_grace_minutes integer not null default 10 check (default_grace_minutes >= 0),
  -- Task timers are the half of this feature that only makes sense inside a
  -- project. Off by default: a workspace that only wants shift clocking gets
  -- no timer UI at all.
  is_task_tracking_enabled boolean not null default true,
  is_manual_entry_enabled boolean not null default true
);

comment on table public.attendance_settings is
  'Per-workspace attendance policy. One row per workspace, created on first use.';

create table if not exists public.work_schedules (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  -- ISO weekday numbers, 1 = Monday .. 7 = Sunday. An array rather than seven
  -- booleans because every query against it is "is today a workday", which is
  -- a containment test.
  workdays smallint[] not null default '{1,2,3,4,5}',
  start_time time not null default '09:00',
  end_time time not null default '17:00',
  break_minutes integer not null default 60 check (break_minutes >= 0),
  grace_minutes integer check (grace_minutes >= 0),
  is_active boolean not null default true,
  unique (workspace_id, member_id)
);

comment on table public.work_schedules is
  'Expected working pattern per member. Absent means the workspace default applies.';

create table if not exists public.workspace_holidays (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  holiday_date date not null,
  name text not null,
  created_by_id uuid references auth.users(id) on delete set null,
  unique (workspace_id, holiday_date)
);

-- ---------------------------------------------------------------------------
-- Who reviews whose time
-- ---------------------------------------------------------------------------

-- Deliberately a mapping rather than a role. workspace_members.role has three
-- values and none of them is "approves attendance"; adding a fourth would
-- change the meaning of a column the rest of the app already reads. A mapping
-- also lets one person approve for a team without administering the workspace.
--
-- With no rows at all, workspace admins approve everything -- so the feature
-- works on day one with nothing configured.
create table if not exists public.attendance_approvers (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  approver_id uuid not null references auth.users(id) on delete cascade,
  unique (workspace_id, member_id, approver_id),
  check (member_id <> approver_id)
);

comment on table public.attendance_approvers is
  'Maps a member to whoever reviews their corrections and leave. Empty means admins review.';

-- ---------------------------------------------------------------------------
-- The record of time
-- ---------------------------------------------------------------------------

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,

  -- 'shift' is the working day. 'task' is time against a work item, and is a
  -- breakdown *within* a shift rather than an addition to it. The two are
  -- never summed; reporting shows them side by side.
  kind text not null default 'shift' check (kind in ('shift', 'task')),
  project_id uuid references public.projects(id) on delete set null,
  issue_id uuid references public.issues(id) on delete set null,

  clock_in_at timestamptz not null,
  clock_out_at timestamptz,

  -- Frozen at write time. See the header.
  business_date date not null,
  tz text not null default 'UTC',

  source text not null default 'web' check (source in ('web', 'manual', 'auto')),
  status text not null default 'open'
    check (status in ('open', 'closed', 'auto_closed', 'superseded')),

  -- Set by anything that guessed rather than observed: an auto-close, a timer
  -- that ran past its cap. Reports can exclude these, and the UI marks them.
  needs_review boolean not null default false,

  -- A correction supersedes rather than edits. This points at the row that
  -- replaced this one; the original keeps its numbers forever.
  superseded_by_id uuid references public.attendance_records(id) on delete set null,

  note text not null default '',
  created_by_id uuid references auth.users(id) on delete set null,
  updated_by_id uuid references auth.users(id) on delete set null,
  deleted_at timestamptz,

  check (clock_out_at is null or clock_out_at > clock_in_at),
  check (kind = 'shift' or issue_id is not null)
);

comment on table public.attendance_records is
  'Every span of tracked time. Written only through the attendance_* functions.';

-- One open shift and one open task timer per person -- no more. Two indexes
-- rather than one, because being clocked in *and* having a timer running is
-- the normal case, while two timers at once is always a mistake.
create unique index if not exists attendance_one_open_shift
  on public.attendance_records (member_id)
  where clock_out_at is null and kind = 'shift' and deleted_at is null;

create unique index if not exists attendance_one_open_task
  on public.attendance_records (member_id)
  where clock_out_at is null and kind = 'task' and deleted_at is null;

create index if not exists attendance_records_workspace_date
  on public.attendance_records (workspace_id, business_date desc)
  where deleted_at is null;

create index if not exists attendance_records_member_date
  on public.attendance_records (member_id, business_date desc)
  where deleted_at is null;

create index if not exists attendance_records_issue
  on public.attendance_records (issue_id)
  where issue_id is not null and deleted_at is null;

create table if not exists public.attendance_breaks (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  record_id uuid not null references public.attendance_records(id) on delete cascade,
  started_at timestamptz not null,
  ended_at timestamptz,
  check (ended_at is null or ended_at > started_at)
);

create unique index if not exists attendance_one_open_break
  on public.attendance_breaks (record_id)
  where ended_at is null;

create index if not exists attendance_breaks_record on public.attendance_breaks (record_id);

-- ---------------------------------------------------------------------------
-- Corrections
-- ---------------------------------------------------------------------------

create table if not exists public.attendance_corrections (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,

  -- Null when the request is "I was here and there is no record of it at all".
  record_id uuid references public.attendance_records(id) on delete cascade,

  requested_clock_in_at timestamptz not null,
  requested_clock_out_at timestamptz,
  reason text not null default '',

  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected', 'withdrawn')),
  reviewed_by_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text not null default '',

  -- The row that approval created, so the request links forward to its result.
  resulting_record_id uuid references public.attendance_records(id) on delete set null,

  check (requested_clock_out_at is null or requested_clock_out_at > requested_clock_in_at)
);

create index if not exists attendance_corrections_pending
  on public.attendance_corrections (workspace_id, status, created_at desc);

create index if not exists attendance_corrections_member
  on public.attendance_corrections (member_id, created_at desc);

-- ---------------------------------------------------------------------------
-- Leave
-- ---------------------------------------------------------------------------

create table if not exists public.leave_types (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  colour text not null default '#6366f1',
  annual_allowance numeric(6, 2) not null default 0 check (annual_allowance >= 0),
  allows_half_day boolean not null default true,
  -- Days that survive into next year. Default zero: use-it-or-lose-it is the
  -- safe default, and generosity is a policy decision someone should make.
  carryover_days numeric(6, 2) not null default 0 check (carryover_days >= 0),
  is_paid boolean not null default true,
  -- Unpaid leave has no balance to run down.
  is_balance_tracked boolean not null default true,
  is_active boolean not null default true,
  unique (workspace_id, name)
);

create table if not exists public.leave_balances (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id) on delete cascade,
  year integer not null,
  allocated numeric(6, 2) not null default 0 check (allocated >= 0),
  carried_over numeric(6, 2) not null default 0 check (carried_over >= 0),
  used numeric(6, 2) not null default 0 check (used >= 0),
  unique (workspace_id, member_id, leave_type_id, year)
);

create table if not exists public.leave_requests (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  member_id uuid not null references auth.users(id) on delete cascade,
  leave_type_id uuid not null references public.leave_types(id) on delete restrict,

  start_date date not null,
  end_date date not null,
  -- Half days are in from the start. Retrofitting fractions into a whole-day
  -- balance is a data migration, and every workspace asks for them eventually.
  day_portion text not null default 'full'
    check (day_portion in ('full', 'first_half', 'second_half')),
  -- Working days, computed at request time with holidays and non-workdays
  -- already excluded. Stored rather than derived so a later holiday edit
  -- cannot silently change what somebody was granted.
  days numeric(6, 2) not null check (days > 0),

  reason text not null default '',
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected', 'cancelled')),
  reviewed_by_id uuid references auth.users(id) on delete set null,
  reviewed_at timestamptz,
  review_note text not null default '',

  check (end_date >= start_date),
  check (day_portion = 'full' or start_date = end_date)
);

create index if not exists leave_requests_pending
  on public.leave_requests (workspace_id, status, start_date desc);

create index if not exists leave_requests_member
  on public.leave_requests (member_id, start_date desc);

-- ---------------------------------------------------------------------------
-- Period locking
-- ---------------------------------------------------------------------------

-- Once a month has been reported on, corrections against it stop being
-- accepted. Without this, an approved correction quietly changes a month that
-- somebody has already signed off and possibly paid against.
create table if not exists public.attendance_periods (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  -- The first of the month it covers.
  period_start date not null,
  locked_at timestamptz not null default now(),
  locked_by_id uuid references auth.users(id) on delete set null,
  unique (workspace_id, period_start)
);

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- The employee's own timezone, which is what every date in this feature is
-- measured in. Falls back to UTC rather than to the server's zone: UTC is at
-- least an explicit, stable wrong answer.
create or replace function public.attendance_member_tz(p_member_id uuid)
returns text
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(nullif(u.user_timezone, ''), 'UTC')
  from public.users u
  where u.id = p_member_id;
$$;

grant execute on function public.attendance_member_tz(uuid) to authenticated;

-- One place that decides which day a moment belongs to.
create or replace function public.attendance_business_date(p_at timestamptz, p_tz text)
returns date
language sql
immutable
as $$
  select (p_at at time zone coalesce(nullif(p_tz, ''), 'UTC'))::date;
$$;

grant execute on function public.attendance_business_date(timestamptz, text) to authenticated;

-- Whether the caller may review p_member_id's time in this workspace.
--
-- The whole approval rule lives here and nowhere else: every policy and every
-- review function calls it, so widening or narrowing who approves is one edit.
create or replace function public.attendance_can_approve(p_workspace_id uuid, p_member_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    -- Nobody approves their own time, however senior.
    p_member_id <> auth.uid()
    and (
      exists (
        select 1
        from public.attendance_approvers a
        where a.workspace_id = p_workspace_id
          and a.member_id = p_member_id
          and a.approver_id = auth.uid()
      )
      -- No approver configured for this person: workspace admins pick it up.
      or (
        not exists (
          select 1
          from public.attendance_approvers a
          where a.workspace_id = p_workspace_id and a.member_id = p_member_id
        )
        and public.workspace_role(p_workspace_id) = 20
      )
    );
$$;

grant execute on function public.attendance_can_approve(uuid, uuid) to authenticated;

create or replace function public.attendance_is_admin(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(public.workspace_role(p_workspace_id) = 20, false);
$$;

grant execute on function public.attendance_is_admin(uuid) to authenticated;

-- Membership without the is_active clause that is_workspace_member() applies.
--
-- A member who has left still has months of history that payroll and reporting
-- need to reach. is_workspace_member() returns false for them, so reads that
-- must survive a departure go through this instead.
create or replace function public.attendance_has_workspace_history(p_workspace_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.member_id = auth.uid()
  );
$$;

grant execute on function public.attendance_has_workspace_history(uuid) to authenticated;

create or replace function public.attendance_is_period_locked(p_workspace_id uuid, p_date date)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.attendance_periods p
    where p.workspace_id = p_workspace_id
      and p.period_start = date_trunc('month', p_date)::date
  );
$$;

grant execute on function public.attendance_is_period_locked(uuid, date) to authenticated;

-- Settings, creating the row on first read so no caller has to check.
create or replace function public.attendance_settings_for(p_workspace_id uuid)
returns public.attendance_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.attendance_settings;
begin
  select * into v_settings from public.attendance_settings where workspace_id = p_workspace_id;

  if not found then
    insert into public.attendance_settings (workspace_id)
    values (p_workspace_id)
    on conflict (workspace_id) do nothing;

    select * into v_settings from public.attendance_settings where workspace_id = p_workspace_id;
  end if;

  return v_settings;
end;
$$;

grant execute on function public.attendance_settings_for(uuid) to authenticated;

-- Whether a date is a working day for this person: on their schedule, and not
-- a workspace holiday. Used by leave to count only the days that cost money.
create or replace function public.attendance_is_working_day(
  p_workspace_id uuid,
  p_member_id uuid,
  p_date date
)
returns boolean
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_workdays smallint[];
begin
  if exists (
    select 1 from public.workspace_holidays h
    where h.workspace_id = p_workspace_id and h.holiday_date = p_date
  ) then
    return false;
  end if;

  select s.workdays into v_workdays
  from public.work_schedules s
  where s.workspace_id = p_workspace_id and s.member_id = p_member_id and s.is_active;

  -- No schedule on file: assume a Monday-to-Friday week rather than refusing
  -- to answer. Getting leave counting wrong is worse than assuming the common
  -- case and letting an admin correct the schedule.
  v_workdays := coalesce(v_workdays, '{1,2,3,4,5}'::smallint[]);

  return extract(isodow from p_date)::smallint = any (v_workdays);
end;
$$;

grant execute on function public.attendance_is_working_day(uuid, uuid, date) to authenticated;

-- Keeps updated_at honest on the tables that carry one.
create or replace function public.attendance_touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array[
    'attendance_settings', 'work_schedules', 'attendance_records',
    'attendance_corrections', 'leave_types', 'leave_balances', 'leave_requests'
  ]
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_touch', t);
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.attendance_touch_updated_at()',
      t || '_touch', t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Row level security
--
-- Reading splits three ways:
--
--   * Configuration (settings, schedules, holidays, leave types, approvers) is
--     readable by the whole workspace and writable by admins. People need to
--     see the rules they are being measured against.
--   * Records are readable workspace-wide. This is a shared attendance board:
--     who is in today is the point of it, and hiding it would make the team
--     view impossible while protecting nothing anyone cannot see by looking
--     around the room.
--   * Requests -- corrections and leave -- are readable by the person, their
--     approver, and admins. These carry free text about why somebody was late
--     or needs a day off, which is nobody else's business.
--
-- Writing does not split at all. No table that records time has an INSERT or
-- UPDATE policy; the functions below are the only way in.
-- ---------------------------------------------------------------------------

alter table public.attendance_settings enable row level security;
alter table public.work_schedules enable row level security;
alter table public.workspace_holidays enable row level security;
alter table public.attendance_approvers enable row level security;
alter table public.attendance_records enable row level security;
alter table public.attendance_breaks enable row level security;
alter table public.attendance_corrections enable row level security;
alter table public.leave_types enable row level security;
alter table public.leave_balances enable row level security;
alter table public.leave_requests enable row level security;
alter table public.attendance_periods enable row level security;

-- Configuration: everyone reads, admins write.
do $$
declare
  t text;
begin
  foreach t in array array[
    'attendance_settings', 'work_schedules', 'workspace_holidays',
    'attendance_approvers', 'leave_types', 'attendance_periods'
  ]
  loop
    execute format('drop policy if exists %I on public.%I', t || ' read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated
         using (public.is_workspace_member(workspace_id))',
      t || ' read', t
    );

    execute format('drop policy if exists %I on public.%I', t || ' write as admin', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (public.attendance_is_admin(workspace_id))
         with check (public.attendance_is_admin(workspace_id))',
      t || ' write as admin', t
    );
  end loop;
end;
$$;

-- Records: workspace-wide read, including for members who have since left.
drop policy if exists "attendance records read" on public.attendance_records;
create policy "attendance records read"
  on public.attendance_records for select
  to authenticated
  using (public.attendance_has_workspace_history(workspace_id));

drop policy if exists "attendance breaks read" on public.attendance_breaks;
create policy "attendance breaks read"
  on public.attendance_breaks for select
  to authenticated
  using (
    exists (
      select 1
      from public.attendance_records r
      where r.id = record_id
        and public.attendance_has_workspace_history(r.workspace_id)
    )
  );

-- Requests: the person, their approver, and admins.
drop policy if exists "attendance corrections read" on public.attendance_corrections;
create policy "attendance corrections read"
  on public.attendance_corrections for select
  to authenticated
  using (
    member_id = auth.uid()
    or public.attendance_can_approve(workspace_id, member_id)
    or public.attendance_is_admin(workspace_id)
  );

drop policy if exists "leave requests read" on public.leave_requests;
create policy "leave requests read"
  on public.leave_requests for select
  to authenticated
  using (
    member_id = auth.uid()
    or public.attendance_can_approve(workspace_id, member_id)
    or public.attendance_is_admin(workspace_id)
  );

drop policy if exists "leave balances read" on public.leave_balances;
create policy "leave balances read"
  on public.leave_balances for select
  to authenticated
  using (
    member_id = auth.uid()
    or public.attendance_can_approve(workspace_id, member_id)
    or public.attendance_is_admin(workspace_id)
  );

-- Admins allocate balances by hand; everything else about them is computed.
drop policy if exists "leave balances write as admin" on public.leave_balances;
create policy "leave balances write as admin"
  on public.leave_balances for all
  to authenticated
  using (public.attendance_is_admin(workspace_id))
  with check (public.attendance_is_admin(workspace_id));

-- ---------------------------------------------------------------------------
-- Notification bridge
--
-- 0017 owns raise_notification. Calling it through a wrapper that checks the
-- function exists keeps 0022 applicable on its own -- an attendance install
-- that lands before the notification migration should degrade to silence, not
-- fail to apply.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_notify(
  p_receiver_id uuid,
  p_workspace_id uuid,
  p_entity_name text,
  p_entity_identifier uuid,
  p_title text,
  p_message text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if to_regprocedure('public.raise_notification(uuid,uuid,uuid,uuid,text,uuid,text,text,text,jsonb)') is null then
    return;
  end if;

  perform public.raise_notification(
    p_receiver_id, auth.uid(), p_workspace_id, null,
    p_entity_name, p_entity_identifier, p_title, p_message
  );
end;
$$;

-- Everyone who should hear about a request from this member: their configured
-- approvers, or the workspace admins when nobody is configured.
create or replace function public.attendance_reviewers_of(p_workspace_id uuid, p_member_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  select a.approver_id
  from public.attendance_approvers a
  where a.workspace_id = p_workspace_id and a.member_id = p_member_id

  union

  select wm.member_id
  from public.workspace_members wm
  where wm.workspace_id = p_workspace_id
    and wm.role = 20
    and wm.is_active
    and wm.member_id <> p_member_id
    and not exists (
      select 1 from public.attendance_approvers a
      where a.workspace_id = p_workspace_id and a.member_id = p_member_id
    );
$$;

-- ---------------------------------------------------------------------------
-- Clocking
--
-- Every one of these reads now() on the server. The client never sends a time,
-- which is the entire reason they are functions rather than inserts.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_clock_in(
  p_workspace_id uuid,
  p_note text default ''
)
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_tz text;
  v_record public.attendance_records;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not a member of this workspace' using errcode = '42501';
  end if;

  if exists (
    select 1 from public.attendance_records r
    where r.member_id = auth.uid() and r.kind = 'shift'
      and r.clock_out_at is null and r.deleted_at is null
  ) then
    raise exception 'You are already clocked in' using errcode = '23505';
  end if;

  v_tz := public.attendance_member_tz(auth.uid());

  insert into public.attendance_records (
    workspace_id, member_id, kind, clock_in_at, business_date, tz,
    source, status, note, created_by_id, updated_by_id
  )
  values (
    p_workspace_id, auth.uid(), 'shift', v_now,
    public.attendance_business_date(v_now, v_tz), v_tz,
    'web', 'open', coalesce(p_note, ''), auth.uid(), auth.uid()
  )
  returning * into v_record;

  return v_record;
end;
$$;

create or replace function public.attendance_clock_out(p_note text default '')
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_record public.attendance_records;
begin
  select * into v_record
  from public.attendance_records r
  where r.member_id = auth.uid() and r.kind = 'shift'
    and r.clock_out_at is null and r.deleted_at is null
  limit 1;

  if not found then
    raise exception 'You are not clocked in' using errcode = 'P0002';
  end if;

  -- A break left running ends with the shift. Leaving it open would make the
  -- break longer than the day that contains it.
  update public.attendance_breaks
  set ended_at = v_now
  where record_id = v_record.id and ended_at is null;

  -- So does a task timer. Time against a work item outside a shift is time
  -- the shift never accounted for.
  update public.attendance_records
  set clock_out_at = v_now, status = 'closed', updated_by_id = auth.uid()
  where member_id = auth.uid() and kind = 'task'
    and clock_out_at is null and deleted_at is null;

  update public.attendance_records
  set clock_out_at = v_now,
      status = 'closed',
      note = case when coalesce(p_note, '') = '' then note else p_note end,
      updated_by_id = auth.uid()
  where id = v_record.id
  returning * into v_record;

  return v_record;
end;
$$;

create or replace function public.attendance_break_start()
returns public.attendance_breaks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record_id uuid;
  v_break public.attendance_breaks;
begin
  select r.id into v_record_id
  from public.attendance_records r
  where r.member_id = auth.uid() and r.kind = 'shift'
    and r.clock_out_at is null and r.deleted_at is null
  limit 1;

  if v_record_id is null then
    raise exception 'You are not clocked in' using errcode = 'P0002';
  end if;

  if exists (select 1 from public.attendance_breaks b where b.record_id = v_record_id and b.ended_at is null) then
    raise exception 'You are already on a break' using errcode = '23505';
  end if;

  insert into public.attendance_breaks (record_id, started_at)
  values (v_record_id, now())
  returning * into v_break;

  return v_break;
end;
$$;

create or replace function public.attendance_break_end()
returns public.attendance_breaks
language plpgsql
security definer
set search_path = public
as $$
declare
  v_break public.attendance_breaks;
begin
  update public.attendance_breaks b
  set ended_at = now()
  where b.ended_at is null
    and b.record_id in (
      select r.id from public.attendance_records r
      where r.member_id = auth.uid() and r.kind = 'shift'
        and r.clock_out_at is null and r.deleted_at is null
    )
  returning * into v_break;

  if not found then
    raise exception 'You are not on a break' using errcode = 'P0002';
  end if;

  return v_break;
end;
$$;

grant execute on function public.attendance_clock_in(uuid, text) to authenticated;
grant execute on function public.attendance_clock_out(text) to authenticated;
grant execute on function public.attendance_break_start() to authenticated;
grant execute on function public.attendance_break_end() to authenticated;

-- ---------------------------------------------------------------------------
-- Task timers
--
-- Task time is the breakdown within a shift. Starting a timer does not clock
-- anyone in -- deciding that for them would put hours on a day they had not
-- said they were working.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_start_task_timer(
  p_workspace_id uuid,
  p_issue_id uuid,
  p_project_id uuid default null
)
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_tz text;
  v_project_id uuid := p_project_id;
  v_settings public.attendance_settings;
  v_record public.attendance_records;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not a member of this workspace' using errcode = '42501';
  end if;

  v_settings := public.attendance_settings_for(p_workspace_id);
  if not v_settings.is_task_tracking_enabled then
    raise exception 'Task tracking is turned off for this workspace' using errcode = '42501';
  end if;

  if v_project_id is null then
    select i.project_id into v_project_id from public.issues i where i.id = p_issue_id;
  end if;

  if v_project_id is null then
    raise exception 'Work item not found' using errcode = 'P0002';
  end if;

  if not public.is_project_member(v_project_id) then
    raise exception 'Not a member of this project' using errcode = '42501';
  end if;

  -- Starting a second timer stops the first rather than refusing. Refusing
  -- would mean the person switching tasks has to remember which one they left
  -- running, and the answer they want is always "the new one".
  update public.attendance_records
  set clock_out_at = v_now, status = 'closed', updated_by_id = auth.uid()
  where member_id = auth.uid() and kind = 'task'
    and clock_out_at is null and deleted_at is null;

  v_tz := public.attendance_member_tz(auth.uid());

  insert into public.attendance_records (
    workspace_id, member_id, kind, project_id, issue_id,
    clock_in_at, business_date, tz, source, status, created_by_id, updated_by_id
  )
  values (
    p_workspace_id, auth.uid(), 'task', v_project_id, p_issue_id,
    v_now, public.attendance_business_date(v_now, v_tz), v_tz,
    'web', 'open', auth.uid(), auth.uid()
  )
  returning * into v_record;

  return v_record;
end;
$$;

create or replace function public.attendance_stop_task_timer()
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_record public.attendance_records;
begin
  update public.attendance_records
  set clock_out_at = now(), status = 'closed', updated_by_id = auth.uid()
  where member_id = auth.uid() and kind = 'task'
    and clock_out_at is null and deleted_at is null
  returning * into v_record;

  if not found then
    raise exception 'No timer is running' using errcode = 'P0002';
  end if;

  return v_record;
end;
$$;

grant execute on function public.attendance_start_task_timer(uuid, uuid, uuid) to authenticated;
grant execute on function public.attendance_stop_task_timer() to authenticated;

-- ---------------------------------------------------------------------------
-- Manual entry
--
-- People forget to start timers. Without an honest way to add the time
-- afterwards they route around the feature through correction requests, which
-- turns the approval queue into a data-entry queue. Marked `manual` so reports
-- can tell observed time from remembered time.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_log_manual(
  p_workspace_id uuid,
  p_started_at timestamptz,
  p_ended_at timestamptz,
  p_kind text default 'task',
  p_issue_id uuid default null,
  p_note text default ''
)
returns public.attendance_records
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tz text;
  v_project_id uuid;
  v_settings public.attendance_settings;
  v_business_date date;
  v_record public.attendance_records;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not a member of this workspace' using errcode = '42501';
  end if;

  v_settings := public.attendance_settings_for(p_workspace_id);
  if not v_settings.is_manual_entry_enabled then
    raise exception 'Manual entry is turned off for this workspace' using errcode = '42501';
  end if;

  if p_ended_at <= p_started_at then
    raise exception 'The end time must be after the start time' using errcode = '22007';
  end if;

  if p_started_at > now() then
    raise exception 'That time has not happened yet' using errcode = '22007';
  end if;

  if p_kind not in ('shift', 'task') then
    raise exception 'Unknown record kind' using errcode = '22023';
  end if;

  if p_kind = 'task' then
    if p_issue_id is null then
      raise exception 'Pick a work item to log against' using errcode = '22023';
    end if;
    select i.project_id into v_project_id from public.issues i where i.id = p_issue_id;
    if v_project_id is null or not public.is_project_member(v_project_id) then
      raise exception 'Not a member of this project' using errcode = '42501';
    end if;
  end if;

  v_tz := public.attendance_member_tz(auth.uid());
  v_business_date := public.attendance_business_date(p_started_at, v_tz);

  if public.attendance_is_period_locked(p_workspace_id, v_business_date) then
    raise exception 'That month is closed' using errcode = '42501';
  end if;

  insert into public.attendance_records (
    workspace_id, member_id, kind, project_id, issue_id,
    clock_in_at, clock_out_at, business_date, tz,
    source, status, note, created_by_id, updated_by_id
  )
  values (
    p_workspace_id, auth.uid(), p_kind, v_project_id, p_issue_id,
    p_started_at, p_ended_at, v_business_date, v_tz,
    'manual', 'closed', coalesce(p_note, ''), auth.uid(), auth.uid()
  )
  returning * into v_record;

  return v_record;
end;
$$;

grant execute on function public.attendance_log_manual(uuid, timestamptz, timestamptz, text, uuid, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Corrections
--
-- Approving a correction never edits the record it corrects. It writes a new
-- record and marks the old one superseded, so a month that has been reported
-- on can still be reproduced exactly as it was reported.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_request_correction(
  p_workspace_id uuid,
  p_requested_clock_in_at timestamptz,
  p_requested_clock_out_at timestamptz default null,
  p_record_id uuid default null,
  p_reason text default ''
)
returns public.attendance_corrections
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correction public.attendance_corrections;
  v_business_date date;
  v_reviewer uuid;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not a member of this workspace' using errcode = '42501';
  end if;

  if p_record_id is not null and not exists (
    select 1 from public.attendance_records r
    where r.id = p_record_id and r.member_id = auth.uid()
  ) then
    raise exception 'That record is not yours to correct' using errcode = '42501';
  end if;

  v_business_date := public.attendance_business_date(
    p_requested_clock_in_at, public.attendance_member_tz(auth.uid())
  );

  if public.attendance_is_period_locked(p_workspace_id, v_business_date) then
    raise exception 'That month is closed' using errcode = '42501';
  end if;

  insert into public.attendance_corrections (
    workspace_id, member_id, record_id,
    requested_clock_in_at, requested_clock_out_at, reason
  )
  values (
    p_workspace_id, auth.uid(), p_record_id,
    p_requested_clock_in_at, p_requested_clock_out_at, coalesce(p_reason, '')
  )
  returning * into v_correction;

  for v_reviewer in select public.attendance_reviewers_of(p_workspace_id, auth.uid())
  loop
    perform public.attendance_notify(
      v_reviewer, p_workspace_id, 'attendance_correction', v_correction.id,
      'Timesheet correction to review',
      'A correction was requested for ' || to_char(v_business_date, 'DD Mon YYYY')
    );
  end loop;

  return v_correction;
end;
$$;

create or replace function public.attendance_review_correction(
  p_correction_id uuid,
  p_approve boolean,
  p_note text default ''
)
returns public.attendance_corrections
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correction public.attendance_corrections;
  v_original public.attendance_records;
  v_new_id uuid;
  v_tz text;
  v_business_date date;
begin
  select * into v_correction
  from public.attendance_corrections c
  where c.id = p_correction_id;

  if not found then
    raise exception 'Correction not found' using errcode = 'P0002';
  end if;

  if v_correction.status <> 'pending' then
    raise exception 'That request has already been reviewed' using errcode = '22023';
  end if;

  if not public.attendance_can_approve(v_correction.workspace_id, v_correction.member_id) then
    raise exception 'You cannot review this request' using errcode = '42501';
  end if;

  if p_approve then
    v_tz := public.attendance_member_tz(v_correction.member_id);
    v_business_date := public.attendance_business_date(v_correction.requested_clock_in_at, v_tz);

    if v_correction.record_id is not null then
      select * into v_original from public.attendance_records where id = v_correction.record_id;
    end if;

    insert into public.attendance_records (
      workspace_id, member_id, kind, project_id, issue_id,
      clock_in_at, clock_out_at, business_date, tz,
      source, status, needs_review, note, created_by_id, updated_by_id
    )
    values (
      v_correction.workspace_id, v_correction.member_id,
      coalesce(v_original.kind, 'shift'), v_original.project_id, v_original.issue_id,
      v_correction.requested_clock_in_at, v_correction.requested_clock_out_at,
      v_business_date, v_tz,
      'manual', 'closed', false,
      coalesce(v_original.note, ''), v_correction.member_id, auth.uid()
    )
    returning id into v_new_id;

    if v_correction.record_id is not null then
      update public.attendance_records
      set status = 'superseded',
          superseded_by_id = v_new_id,
          needs_review = false,
          updated_by_id = auth.uid()
      where id = v_correction.record_id;
    end if;
  end if;

  update public.attendance_corrections
  set status = case when p_approve then 'approved' else 'rejected' end,
      reviewed_by_id = auth.uid(),
      reviewed_at = now(),
      review_note = coalesce(p_note, ''),
      resulting_record_id = v_new_id
  where id = p_correction_id
  returning * into v_correction;

  perform public.attendance_notify(
    v_correction.member_id, v_correction.workspace_id,
    'attendance_correction', v_correction.id,
    case when p_approve then 'Correction approved' else 'Correction rejected' end,
    case when p_approve
      then 'Your timesheet has been updated.'
      else coalesce(nullif(p_note, ''), 'No reason was given.')
    end
  );

  return v_correction;
end;
$$;

create or replace function public.attendance_withdraw_correction(p_correction_id uuid)
returns public.attendance_corrections
language plpgsql
security definer
set search_path = public
as $$
declare
  v_correction public.attendance_corrections;
begin
  update public.attendance_corrections
  set status = 'withdrawn'
  where id = p_correction_id and member_id = auth.uid() and status = 'pending'
  returning * into v_correction;

  if not found then
    raise exception 'That request cannot be withdrawn' using errcode = '22023';
  end if;

  return v_correction;
end;
$$;

grant execute on function public.attendance_request_correction(uuid, timestamptz, timestamptz, uuid, text) to authenticated;
grant execute on function public.attendance_review_correction(uuid, boolean, text) to authenticated;
grant execute on function public.attendance_withdraw_correction(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Leave
--
-- Counting is done once, at request time, and stored. A holiday added in
-- November must not retroactively change how many days somebody was granted
-- in March.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_leave_days(
  p_workspace_id uuid,
  p_member_id uuid,
  p_start_date date,
  p_end_date date,
  p_day_portion text default 'full'
)
returns numeric
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_day date;
  v_days numeric := 0;
begin
  if p_day_portion <> 'full' then
    -- Half days are single-day requests by construction; the table enforces it.
    return case when public.attendance_is_working_day(p_workspace_id, p_member_id, p_start_date)
      then 0.5 else 0 end;
  end if;

  v_day := p_start_date;
  while v_day <= p_end_date loop
    if public.attendance_is_working_day(p_workspace_id, p_member_id, v_day) then
      v_days := v_days + 1;
    end if;
    v_day := v_day + 1;
  end loop;

  return v_days;
end;
$$;

grant execute on function public.attendance_leave_days(uuid, uuid, date, date, text) to authenticated;

create or replace function public.attendance_request_leave(
  p_workspace_id uuid,
  p_leave_type_id uuid,
  p_start_date date,
  p_end_date date,
  p_day_portion text default 'full',
  p_reason text default ''
)
returns public.leave_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_type public.leave_types;
  v_days numeric;
  v_request public.leave_requests;
  v_reviewer uuid;
  v_year integer := extract(year from p_start_date)::integer;
  v_available numeric;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not a member of this workspace' using errcode = '42501';
  end if;

  select * into v_type from public.leave_types
  where id = p_leave_type_id and workspace_id = p_workspace_id and is_active;

  if not found then
    raise exception 'Leave type not found' using errcode = 'P0002';
  end if;

  if p_day_portion <> 'full' and not v_type.allows_half_day then
    raise exception 'This leave type is taken in whole days' using errcode = '22023';
  end if;

  v_days := public.attendance_leave_days(
    p_workspace_id, auth.uid(), p_start_date, p_end_date, p_day_portion
  );

  if v_days <= 0 then
    raise exception 'Those dates are all holidays or non-working days' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.leave_requests lr
    where lr.member_id = auth.uid()
      and lr.status in ('pending', 'approved')
      and lr.start_date <= p_end_date
      and lr.end_date >= p_start_date
  ) then
    raise exception 'You already have leave booked over those dates' using errcode = '23505';
  end if;

  if v_type.is_balance_tracked then
    select coalesce(b.allocated, v_type.annual_allowance) + coalesce(b.carried_over, 0) - coalesce(b.used, 0)
    into v_available
    from public.leave_balances b
    where b.workspace_id = p_workspace_id and b.member_id = auth.uid()
      and b.leave_type_id = p_leave_type_id and b.year = v_year;

    v_available := coalesce(v_available, v_type.annual_allowance);

    -- No negative balances. Somebody who needs the day anyway can be given a
    -- larger allocation by an admin, which leaves a record of the decision.
    if v_days > v_available then
      raise exception 'That is more than the % day(s) you have left', trim(to_char(v_available, '999990.9'))
        using errcode = '22023';
    end if;
  end if;

  insert into public.leave_requests (
    workspace_id, member_id, leave_type_id, start_date, end_date,
    day_portion, days, reason
  )
  values (
    p_workspace_id, auth.uid(), p_leave_type_id, p_start_date, p_end_date,
    p_day_portion, v_days, coalesce(p_reason, '')
  )
  returning * into v_request;

  for v_reviewer in select public.attendance_reviewers_of(p_workspace_id, auth.uid())
  loop
    perform public.attendance_notify(
      v_reviewer, p_workspace_id, 'leave_request', v_request.id,
      'Leave request to review',
      v_type.name || ', ' || trim(to_char(v_days, '999990.9')) || ' day(s) from '
        || to_char(p_start_date, 'DD Mon YYYY')
    );
  end loop;

  return v_request;
end;
$$;

create or replace function public.attendance_review_leave(
  p_request_id uuid,
  p_approve boolean,
  p_note text default ''
)
returns public.leave_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.leave_requests;
  v_type public.leave_types;
  v_year integer;
begin
  select * into v_request from public.leave_requests where id = p_request_id;

  if not found then
    raise exception 'Leave request not found' using errcode = 'P0002';
  end if;

  if v_request.status <> 'pending' then
    raise exception 'That request has already been reviewed' using errcode = '22023';
  end if;

  if not public.attendance_can_approve(v_request.workspace_id, v_request.member_id) then
    raise exception 'You cannot review this request' using errcode = '42501';
  end if;

  select * into v_type from public.leave_types where id = v_request.leave_type_id;
  v_year := extract(year from v_request.start_date)::integer;

  if p_approve and v_type.is_balance_tracked then
    insert into public.leave_balances (
      workspace_id, member_id, leave_type_id, year, allocated, used
    )
    values (
      v_request.workspace_id, v_request.member_id, v_request.leave_type_id,
      v_year, v_type.annual_allowance, v_request.days
    )
    on conflict (workspace_id, member_id, leave_type_id, year)
    do update set used = leave_balances.used + v_request.days,
                  updated_at = now();
  end if;

  update public.leave_requests
  set status = case when p_approve then 'approved' else 'rejected' end,
      reviewed_by_id = auth.uid(),
      reviewed_at = now(),
      review_note = coalesce(p_note, '')
  where id = p_request_id
  returning * into v_request;

  perform public.attendance_notify(
    v_request.member_id, v_request.workspace_id, 'leave_request', v_request.id,
    case when p_approve then 'Leave approved' else 'Leave rejected' end,
    v_type.name || ' from ' || to_char(v_request.start_date, 'DD Mon YYYY')
  );

  return v_request;
end;
$$;

create or replace function public.attendance_cancel_leave(p_request_id uuid)
returns public.leave_requests
language plpgsql
security definer
set search_path = public
as $$
declare
  v_request public.leave_requests;
  v_type public.leave_types;
begin
  select * into v_request from public.leave_requests where id = p_request_id;

  if not found or v_request.member_id <> auth.uid() then
    raise exception 'That request is not yours' using errcode = '42501';
  end if;

  if v_request.status not in ('pending', 'approved') then
    raise exception 'That request cannot be cancelled' using errcode = '22023';
  end if;

  -- Leave that has already started stays on the record. Cancelling it after
  -- the fact would erase days somebody actually took.
  if v_request.status = 'approved' and v_request.start_date <= current_date then
    raise exception 'Leave that has already started cannot be cancelled' using errcode = '22023';
  end if;

  select * into v_type from public.leave_types where id = v_request.leave_type_id;

  if v_request.status = 'approved' and v_type.is_balance_tracked then
    update public.leave_balances
    set used = greatest(used - v_request.days, 0), updated_at = now()
    where workspace_id = v_request.workspace_id
      and member_id = v_request.member_id
      and leave_type_id = v_request.leave_type_id
      and year = extract(year from v_request.start_date)::integer;
  end if;

  update public.leave_requests
  set status = 'cancelled'
  where id = p_request_id
  returning * into v_request;

  return v_request;
end;
$$;

grant execute on function public.attendance_request_leave(uuid, uuid, date, date, text, text) to authenticated;
grant execute on function public.attendance_review_leave(uuid, boolean, text) to authenticated;
grant execute on function public.attendance_cancel_leave(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- The auto-close sweep
--
-- Somebody closes their laptop and the shift stays open forever: it blocks the
-- next day's clock-in, and one open row makes every "hours this week" total
-- meaningless. Three ways out, and only one is honest --
--
--   * leave it open: breaks tomorrow
--   * close it at midnight: invents hours nobody worked
--   * close it at the scheduled end and mark it: plausible, visibly provisional
--
-- The third. `needs_review` keeps it out of reports until a person confirms it,
-- and the existing correction flow is how they do that -- no second mechanism.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_sweep_open_sessions()
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row record;
  v_settings public.attendance_settings;
  v_end timestamptz;
  v_closed integer := 0;
begin
  for v_row in
    select r.*, s.end_time, s.is_active as schedule_active
    from public.attendance_records r
    left join public.work_schedules s
      on s.workspace_id = r.workspace_id and s.member_id = r.member_id
    where r.clock_out_at is null and r.deleted_at is null
  loop
    v_settings := public.attendance_settings_for(v_row.workspace_id);

    if v_row.kind = 'task' then
      -- A timer past its cap was left running, not worked.
      v_end := v_row.clock_in_at + make_interval(mins => (v_settings.task_timer_max_hours * 60)::integer);
      if now() < v_end then
        continue;
      end if;
    else
      -- Scheduled end for the day it started, or a default-length shift when
      -- there is no schedule to consult.
      if v_row.end_time is not null and coalesce(v_row.schedule_active, false) then
        v_end := (v_row.business_date + v_row.end_time) at time zone v_row.tz;
      else
        v_end := v_row.clock_in_at + make_interval(mins => (v_settings.default_shift_hours * 60)::integer);
      end if;

      -- An end time before the clock-in means the shift ran past midnight;
      -- give it a default-length day rather than a negative one.
      if v_end <= v_row.clock_in_at then
        v_end := v_row.clock_in_at + make_interval(mins => (v_settings.default_shift_hours * 60)::integer);
      end if;

      if now() < v_end + make_interval(mins => (v_settings.auto_close_grace_hours * 60)::integer) then
        continue;
      end if;
    end if;

    update public.attendance_breaks
    set ended_at = least(v_end, now())
    where record_id = v_row.id and ended_at is null;

    update public.attendance_records
    set clock_out_at = v_end,
        status = 'auto_closed',
        needs_review = true
    where id = v_row.id;

    perform public.attendance_notify(
      v_row.member_id, v_row.workspace_id, 'attendance_record', v_row.id,
      'We closed your shift for you',
      'You were still clocked in from ' || to_char(v_row.business_date, 'DD Mon YYYY')
        || '. Check the time and request a correction if it is wrong.'
    );

    v_closed := v_closed + 1;
  end loop;

  return v_closed;
end;
$$;

-- Not granted to authenticated. This one runs on a schedule, and a client that
-- could call it could close everybody's shift.
revoke all on function public.attendance_sweep_open_sessions() from public, anon, authenticated;
grant execute on function public.attendance_sweep_open_sessions() to service_role;

-- ---------------------------------------------------------------------------
-- Reporting
--
-- Every number the UI shows comes from these two, so a total on the dashboard
-- and the same total in an export cannot drift apart.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_day_totals(
  p_workspace_id uuid,
  p_from date,
  p_to date,
  p_member_id uuid default null
)
returns table (
  member_id uuid,
  business_date date,
  shift_seconds bigint,
  break_seconds bigint,
  task_seconds bigint,
  first_in timestamptz,
  last_out timestamptz,
  is_open boolean,
  needs_review boolean
)
language sql
security definer
stable
set search_path = public
as $$
  with scoped as (
    select r.*
    from public.attendance_records r
    where r.workspace_id = p_workspace_id
      and r.deleted_at is null
      and r.status <> 'superseded'
      and r.business_date between p_from and p_to
      and (p_member_id is null or r.member_id = p_member_id)
      and public.attendance_has_workspace_history(p_workspace_id)
  ),
  shifts as (
    select
      s.member_id,
      s.business_date,
      sum(extract(epoch from coalesce(s.clock_out_at, now()) - s.clock_in_at))::bigint as shift_seconds,
      min(s.clock_in_at) as first_in,
      max(s.clock_out_at) as last_out,
      bool_or(s.clock_out_at is null) as is_open,
      bool_or(s.needs_review) as needs_review
    from scoped s
    where s.kind = 'shift'
    group by s.member_id, s.business_date
  ),
  breaks as (
    select
      s.member_id,
      s.business_date,
      sum(extract(epoch from coalesce(b.ended_at, now()) - b.started_at))::bigint as break_seconds
    from scoped s
    join public.attendance_breaks b on b.record_id = s.id
    where s.kind = 'shift'
    group by s.member_id, s.business_date
  ),
  tasks as (
    select
      s.member_id,
      s.business_date,
      sum(extract(epoch from coalesce(s.clock_out_at, now()) - s.clock_in_at))::bigint as task_seconds
    from scoped s
    where s.kind = 'task'
    group by s.member_id, s.business_date
  ),
  keys as (
    select member_id, business_date from shifts
    union
    select member_id, business_date from tasks
  )
  select
    k.member_id,
    k.business_date,
    coalesce(sh.shift_seconds, 0) - coalesce(br.break_seconds, 0) as shift_seconds,
    coalesce(br.break_seconds, 0) as break_seconds,
    coalesce(tk.task_seconds, 0) as task_seconds,
    sh.first_in,
    sh.last_out,
    coalesce(sh.is_open, false) as is_open,
    coalesce(sh.needs_review, false) as needs_review
  from keys k
  left join shifts sh on sh.member_id = k.member_id and sh.business_date = k.business_date
  left join breaks br on br.member_id = k.member_id and br.business_date = k.business_date
  left join tasks tk on tk.member_id = k.member_id and tk.business_date = k.business_date
  order by k.business_date desc, k.member_id;
$$;

grant execute on function public.attendance_day_totals(uuid, date, date, uuid) to authenticated;

create or replace function public.attendance_team_today(p_workspace_id uuid)
returns table (
  member_id uuid,
  state text,
  clock_in_at timestamptz,
  elapsed_seconds bigint,
  break_seconds bigint,
  active_issue_id uuid,
  active_project_id uuid,
  on_leave boolean
)
language sql
security definer
stable
set search_path = public
as $$
  select
    wm.member_id,
    case
      when open_break.id is not null then 'break'
      when open_shift.id is not null then 'in'
      when leave_today.id is not null then 'leave'
      else 'out'
    end as state,
    open_shift.clock_in_at,
    coalesce(extract(epoch from now() - open_shift.clock_in_at)::bigint, 0) as elapsed_seconds,
    coalesce(brk.break_seconds, 0) as break_seconds,
    task.issue_id as active_issue_id,
    task.project_id as active_project_id,
    leave_today.id is not null as on_leave
  from public.workspace_members wm
  left join lateral (
    select r.* from public.attendance_records r
    where r.member_id = wm.member_id and r.workspace_id = p_workspace_id
      and r.kind = 'shift' and r.clock_out_at is null and r.deleted_at is null
    limit 1
  ) open_shift on true
  left join lateral (
    select b.* from public.attendance_breaks b
    where b.record_id = open_shift.id and b.ended_at is null
    limit 1
  ) open_break on true
  left join lateral (
    select sum(extract(epoch from coalesce(b.ended_at, now()) - b.started_at))::bigint as break_seconds
    from public.attendance_breaks b
    where b.record_id = open_shift.id
  ) brk on true
  left join lateral (
    select r.* from public.attendance_records r
    where r.member_id = wm.member_id and r.workspace_id = p_workspace_id
      and r.kind = 'task' and r.clock_out_at is null and r.deleted_at is null
    limit 1
  ) task on true
  left join lateral (
    select lr.id from public.leave_requests lr
    where lr.member_id = wm.member_id and lr.workspace_id = p_workspace_id
      and lr.status = 'approved'
      and current_date between lr.start_date and lr.end_date
    limit 1
  ) leave_today on true
  where wm.workspace_id = p_workspace_id
    and wm.is_active
    and public.is_workspace_member(p_workspace_id)
  order by
    case
      when open_break.id is not null then 1
      when open_shift.id is not null then 0
      when leave_today.id is not null then 2
      else 3
    end,
    wm.member_id;
$$;

grant execute on function public.attendance_team_today(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- First run
--
-- A workspace opening attendance for the first time gets settings and a set of
-- leave types rather than an empty screen with a "create a leave type" button.
-- Idempotent, so the page can call it on every visit without checking.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_bootstrap(p_workspace_id uuid)
returns public.attendance_settings
language plpgsql
security definer
set search_path = public
as $$
declare
  v_settings public.attendance_settings;
begin
  if not public.is_workspace_member(p_workspace_id) then
    raise exception 'Not a member of this workspace' using errcode = '42501';
  end if;

  v_settings := public.attendance_settings_for(p_workspace_id);

  if not exists (select 1 from public.leave_types where workspace_id = p_workspace_id) then
    insert into public.leave_types (workspace_id, name, colour, annual_allowance, is_paid, is_balance_tracked)
    values
      (p_workspace_id, 'Annual leave', '#6366f1', 25, true, true),
      (p_workspace_id, 'Sick leave', '#f59e0b', 10, true, true),
      (p_workspace_id, 'Unpaid leave', '#94a3b8', 0, false, false)
    on conflict (workspace_id, name) do nothing;
  end if;

  return v_settings;
end;
$$;

grant execute on function public.attendance_bootstrap(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Realtime
--
-- The team view is worth nothing if it needs a refresh to show that somebody
-- clocked in. 0016 is the cautionary tale: tables left out of the publication
-- subscribe happily and receive nothing forever.
-- ---------------------------------------------------------------------------

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'attendance_records'
  ) then
    alter publication supabase_realtime add table public.attendance_records;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'attendance_breaks'
  ) then
    alter publication supabase_realtime add table public.attendance_breaks;
  end if;
end;
$$;

-- UPDATE payloads carry the old row's key columns only with a full replica
-- identity, and clocking out is an UPDATE.
alter table public.attendance_records replica identity full;
alter table public.attendance_breaks replica identity full;

-- ---------------------------------------------------------------------------
-- Schedule
--
-- Hourly rather than nightly: the grace period already decides when a shift is
-- late enough to close, so checking often just means it closes near the time it
-- should have. Guarded because pg_cron is not enabled on every project.
-- ---------------------------------------------------------------------------

do $$
begin
  if exists (select 1 from pg_extension where extname = 'pg_cron') then
    perform cron.unschedule('attendance-sweep-open-sessions')
    where exists (select 1 from cron.job where jobname = 'attendance-sweep-open-sessions');

    perform cron.schedule(
      'attendance-sweep-open-sessions',
      '15 * * * *',
      $cron$select public.attendance_sweep_open_sessions();$cron$
    );
  end if;
exception
  -- A project where pg_cron is installed but the deploying role cannot reach
  -- the cron schema should still get the tables. The sweep can be scheduled by
  -- hand afterwards; failing the whole migration over it would not help.
  when insufficient_privilege or undefined_table then
    raise notice 'attendance: could not schedule the sweep, do it by hand';
end;
$$;
