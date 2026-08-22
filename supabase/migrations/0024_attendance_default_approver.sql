-- ---------------------------------------------------------------------------
-- 0024_attendance_default_approver.sql
--
-- One approver for the whole workspace, and an escape from the deadlock a
-- one-person workspace fell into.
--
-- 0022 offered two ways to route a request: a per-member mapping, or nothing
-- at all, in which case every workspace admin picked it up. Most workspaces
-- want the thing in between — one person who signs off everybody's time —
-- and expressing that as a row per member is a list somebody has to remember
-- to update whenever anyone joins.
--
-- The deadlock: `attendance_can_approve` opens with `p_member_id <> auth.uid()`
-- so that nobody approves their own hours. In a workspace with a single admin
-- that rule leaves *their* requests with no reviewer at all, permanently
-- pending. The rule is right for every other case, so it stays, and a last
-- resort is added underneath it: when a person has genuinely no other
-- eligible reviewer, they may review their own, and the review is stamped as
-- self-approved so it is never mistaken for a second pair of eyes.
-- ---------------------------------------------------------------------------

alter table public.attendance_settings
  add column if not exists default_approver_id uuid references auth.users(id) on delete set null;

comment on column public.attendance_settings.default_approver_id is
  'Reviews everybody who has no explicit approver mapping. Null falls through to workspace admins.';

-- ---------------------------------------------------------------------------
-- One place that answers "who reviews this person"
--
-- The chain, most specific first: their own mapping, then the workspace
-- approver, then the admins. Each rung is used only when the one above it is
-- empty, so naming a workspace approver takes the admins out of the queue
-- exactly the way naming a personal approver already did.
-- ---------------------------------------------------------------------------
create or replace function public.attendance_reviewers_of(p_workspace_id uuid, p_member_id uuid)
returns setof uuid
language sql
security definer
stable
set search_path = public
as $$
  with mapped as (
    select a.approver_id
    from public.attendance_approvers a
    where a.workspace_id = p_workspace_id and a.member_id = p_member_id
  ),
  workspace_default as (
    select s.default_approver_id as approver_id
    from public.attendance_settings s
    where s.workspace_id = p_workspace_id
      and s.default_approver_id is not null
      -- The workspace approver cannot review themselves; their own requests
      -- fall through to the admins below.
      and s.default_approver_id <> p_member_id
      and not exists (select 1 from mapped)
  ),
  admins as (
    select wm.member_id as approver_id
    from public.workspace_members wm
    where wm.workspace_id = p_workspace_id
      and wm.role = 20
      and wm.is_active
      and wm.member_id <> p_member_id
      and not exists (select 1 from mapped)
      and not exists (select 1 from workspace_default)
  )
  select approver_id from mapped
  union
  select approver_id from workspace_default
  union
  select approver_id from admins;
$$;

grant execute on function public.attendance_reviewers_of(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Whether the caller may review this person
--
-- Now derived from the list above rather than restating the rule, so the queue
-- somebody sees and the requests they can act on cannot disagree.
-- ---------------------------------------------------------------------------
create or replace function public.attendance_can_approve(p_workspace_id uuid, p_member_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select
    exists (
      select 1 from public.attendance_reviewers_of(p_workspace_id, p_member_id) r
      where r = auth.uid()
    )
    -- Last resort. Only when the list above is genuinely empty, only for your
    -- own request, and only if you administer the workspace — so a member
    -- cannot reach it by having their approver removed.
    or (
      p_member_id = auth.uid()
      and coalesce(public.workspace_role(p_workspace_id) = 20, false)
      and not exists (select 1 from public.attendance_reviewers_of(p_workspace_id, p_member_id))
    );
$$;

grant execute on function public.attendance_can_approve(uuid, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Say so in the record
--
-- A self-approval is a real decision with nobody checking it. It is allowed,
-- and it is labelled, so an export or an audit can tell the two apart.
--
-- A trigger rather than an edit to 0022's review functions: the rule is "any
-- review where the reviewer is the requester", which is a property of the row,
-- and putting it here means the two review paths cannot drift apart or forget
-- it.
-- ---------------------------------------------------------------------------

create or replace function public.attendance_mark_self_review()
returns trigger
language plpgsql
as $$
begin
  if new.reviewed_by_id is not null
    and new.reviewed_by_id = new.member_id
    and coalesce(old.reviewed_by_id, '00000000-0000-0000-0000-000000000000'::uuid) is distinct from new.reviewed_by_id
  then
    new.review_note := trim(both ' ' from 'Self-approved: no other reviewer. ' || coalesce(new.review_note, ''));
  end if;

  return new;
end;
$$;

do $$
declare
  t text;
begin
  foreach t in array array['attendance_corrections', 'leave_requests']
  loop
    execute format('drop trigger if exists %I on public.%I', t || '_self_review', t);
    execute format(
      'create trigger %I before update on public.%I
         for each row execute function public.attendance_mark_self_review()',
      t || '_self_review', t
    );
  end loop;
end;
$$;
