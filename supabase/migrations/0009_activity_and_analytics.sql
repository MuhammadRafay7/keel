-- Activity feed and progress aggregates.
--
-- Two things the migrated application could ask for but never got an answer to:
-- what changed on a work item, and how far along a cycle is.
--
-- Django wrote activity rows from Python, in the same request that made the
-- change. That only records changes the API made — anything written directly to
-- the database was invisible. Here it is a trigger, so the record is a property
-- of the table rather than of the code path that happened to touch it.
--
-- The trigger is SECURITY DEFINER and the client's INSERT policy is withdrawn.
-- An activity row nobody can forge is worth more than one anybody can write.

-- ---------------------------------------------------------------------------
-- Naming
-- ---------------------------------------------------------------------------
-- Activity rows store a human-readable value *and* the id it came from. The UI
-- renders old_value/new_value directly, so "In Progress" belongs there and the
-- uuid belongs in old_identifier/new_identifier.

create or replace function public.activity_state_name(p_state_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select s.name from public.states s where s.id = p_state_id;
$$;

create or replace function public.activity_user_name(p_user_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(nullif(btrim(u.display_name), ''), u.email)
  from public.users u
  where u.id = p_user_id;
$$;

create or replace function public.activity_label_name(p_label_id uuid)
returns text
language sql
stable
security definer
set search_path = public
as $$
  select l.name from public.labels l where l.id = p_label_id;
$$;

-- One insert, written once and called from every trigger below.
create or replace function public.record_activity(
  p_issue_id uuid,
  p_project_id uuid,
  p_workspace_id uuid,
  p_verb text,
  p_field text,
  p_old_value text,
  p_new_value text,
  p_old_identifier uuid default null,
  p_new_identifier uuid default null,
  p_comment text default ''
)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.issue_activities (
    id, created_at, updated_at, issue_id, project_id, workspace_id,
    verb, field, old_value, new_value, comment, attachments,
    old_identifier, new_identifier, epoch, actor_id,
    created_by_id, updated_by_id
  )
  values (
    gen_random_uuid(), now(), now(), p_issue_id, p_project_id, p_workspace_id,
    p_verb, p_field, p_old_value, p_new_value, coalesce(p_comment, ''), '{}',
    p_old_identifier, p_new_identifier, extract(epoch from now()) * 1000, auth.uid(),
    auth.uid(), auth.uid()
  );
$$;

-- ---------------------------------------------------------------------------
-- Work item changes
-- ---------------------------------------------------------------------------
-- Only fields the feed renders are tracked. description_stripped, sort_order
-- and the timestamps change constantly and say nothing a person wants to read.

create or replace function public.track_work_item_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'created', null, null, null, null, new.id
    );
    return new;
  end if;

  -- A soft delete is one event, not a diff of every column against null.
  if old.deleted_at is null and new.deleted_at is not null then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'deleted', 'issue', new.name, null, new.id, null
    );
    return new;
  end if;

  if new.deleted_at is not null then
    return new;
  end if;

  if new.name is distinct from old.name then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'updated', 'name', old.name, new.name
    );
  end if;

  -- The body is stored as HTML. Recording both versions would put a document in
  -- every row, so the feed says it changed and the reader opens the item.
  if new.description_html is distinct from old.description_html then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'updated', 'description', null, null
    );
  end if;

  if new.state_id is distinct from old.state_id then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'updated', 'state',
      public.activity_state_name(old.state_id), public.activity_state_name(new.state_id),
      old.state_id, new.state_id
    );
  end if;

  if new.priority is distinct from old.priority then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'updated', 'priority', old.priority, new.priority
    );
  end if;

  if new.parent_id is distinct from old.parent_id then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'updated', 'parent', null, null, old.parent_id, new.parent_id
    );
  end if;

  if new.start_date is distinct from old.start_date then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'updated', 'start_date', old.start_date::text, new.start_date::text
    );
  end if;

  if new.target_date is distinct from old.target_date then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'updated', 'target_date', old.target_date::text, new.target_date::text
    );
  end if;

  if new.estimate_point_id is distinct from old.estimate_point_id then
    perform public.record_activity(
      new.id, new.project_id, new.workspace_id,
      'updated', 'estimate_point', null, null, old.estimate_point_id, new.estimate_point_id
    );
  end if;

  return new;
end;
$$;

drop trigger if exists work_item_activity on public.issues;
create trigger work_item_activity
  after insert or update on public.issues
  for each row execute function public.track_work_item_activity();

-- ---------------------------------------------------------------------------
-- Assignees and labels
-- ---------------------------------------------------------------------------
-- These are join rows, so the event is the row appearing or disappearing. The
-- service replaces them as a set, which produces one added and one removed row
-- per change rather than an "assignee changed" pair. That is what happened.

create or replace function public.track_assignee_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.record_activity(
      new.issue_id, new.project_id, new.workspace_id,
      'updated', 'assignees', null, public.activity_user_name(new.assignee_id),
      null, new.assignee_id
    );
    return new;
  end if;

  perform public.record_activity(
    old.issue_id, old.project_id, old.workspace_id,
    'updated', 'assignees', public.activity_user_name(old.assignee_id), null,
    old.assignee_id, null
  );
  return old;
end;
$$;

drop trigger if exists assignee_activity on public.issue_assignees;
create trigger assignee_activity
  after insert or delete on public.issue_assignees
  for each row execute function public.track_assignee_activity();

create or replace function public.track_label_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    perform public.record_activity(
      new.issue_id, new.project_id, new.workspace_id,
      'updated', 'labels', null, public.activity_label_name(new.label_id),
      null, new.label_id
    );
    return new;
  end if;

  perform public.record_activity(
    old.issue_id, old.project_id, old.workspace_id,
    'updated', 'labels', public.activity_label_name(old.label_id), null,
    old.label_id, null
  );
  return old;
end;
$$;

drop trigger if exists label_activity on public.issue_labels;
create trigger label_activity
  after insert or delete on public.issue_labels
  for each row execute function public.track_label_activity();

-- ---------------------------------------------------------------------------
-- Cycle and module membership
-- ---------------------------------------------------------------------------

create or replace function public.track_cycle_issue_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  if tg_op = 'INSERT' then
    select c.name into v_name from public.cycles c where c.id = new.cycle_id;
    perform public.record_activity(
      new.issue_id, new.project_id, new.workspace_id,
      'updated', 'cycles', null, v_name, null, new.cycle_id
    );
    return new;
  end if;

  select c.name into v_name from public.cycles c where c.id = old.cycle_id;
  perform public.record_activity(
    old.issue_id, old.project_id, old.workspace_id,
    'updated', 'cycles', v_name, null, old.cycle_id, null
  );
  return old;
end;
$$;

drop trigger if exists cycle_issue_activity on public.cycle_issues;
create trigger cycle_issue_activity
  after insert or delete on public.cycle_issues
  for each row execute function public.track_cycle_issue_activity();

create or replace function public.track_module_issue_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_name text;
begin
  if tg_op = 'INSERT' then
    select m.name into v_name from public.modules m where m.id = new.module_id;
    perform public.record_activity(
      new.issue_id, new.project_id, new.workspace_id,
      'updated', 'modules', null, v_name, null, new.module_id
    );
    return new;
  end if;

  select m.name into v_name from public.modules m where m.id = old.module_id;
  perform public.record_activity(
    old.issue_id, old.project_id, old.workspace_id,
    'updated', 'modules', v_name, null, old.module_id, null
  );
  return old;
end;
$$;

drop trigger if exists module_issue_activity on public.module_issues;
create trigger module_issue_activity
  after insert or delete on public.module_issues
  for each row execute function public.track_module_issue_activity();

-- ---------------------------------------------------------------------------
-- Comments and attachments
-- ---------------------------------------------------------------------------
-- Comments appear in the feed interleaved with changes, so they need a row of
-- their own. issue_comment_id points back at the comment, which is what lets the
-- UI render the current text rather than the text as it was written.

create or replace function public.track_comment_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.issue_activities (
      id, created_at, updated_at, issue_id, project_id, workspace_id,
      verb, field, old_value, new_value, comment, attachments,
      epoch, actor_id, issue_comment_id, created_by_id, updated_by_id
    )
    values (
      gen_random_uuid(), now(), now(), new.issue_id, new.project_id, new.workspace_id,
      'created', 'comment', null, null, coalesce(new.comment_stripped, ''), '{}',
      extract(epoch from now()) * 1000, auth.uid(), new.id, auth.uid(), auth.uid()
    );
    return new;
  end if;

  if old.deleted_at is null and new.deleted_at is not null then
    perform public.record_activity(
      new.issue_id, new.project_id, new.workspace_id,
      'deleted', 'comment', null, null, new.id, null
    );
  end if;

  return new;
end;
$$;

drop trigger if exists comment_activity on public.issue_comments;
create trigger comment_activity
  after insert or update on public.issue_comments
  for each row execute function public.track_comment_activity();

-- Attachments are file_assets rows, so the trigger has to filter: only the ones
-- tied to a work item as an attachment belong in a work item's feed.
create or replace function public.track_attachment_activity()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.issue_id is null or new.entity_type is distinct from 'ISSUE_ATTACHMENT' then
    return new;
  end if;

  if tg_op = 'INSERT' then
    perform public.record_activity(
      new.issue_id, new.project_id, new.workspace_id,
      'created', 'attachment', null, coalesce(new.attributes ->> 'name', ''), null, new.id
    );
    return new;
  end if;

  if not old.is_deleted and new.is_deleted then
    perform public.record_activity(
      new.issue_id, new.project_id, new.workspace_id,
      'deleted', 'attachment', coalesce(new.attributes ->> 'name', ''), null, new.id, null
    );
  end if;

  return new;
end;
$$;

drop trigger if exists attachment_activity on public.file_assets;
create trigger attachment_activity
  after insert or update on public.file_assets
  for each row execute function public.track_attachment_activity();

-- ---------------------------------------------------------------------------
-- The feed is read-only to clients
-- ---------------------------------------------------------------------------
-- 0006 gave issue_activities the same read/write pair as every other
-- project-scoped table. Now that triggers write it, the client must not: an
-- editable history is not a history.

drop policy if exists "issue_activities write" on public.issue_activities;

drop policy if exists "issue_activities read" on public.issue_activities;
create policy "issue_activities read"
  on public.issue_activities for select
  to authenticated
  using (public.is_project_member(project_id));

-- ---------------------------------------------------------------------------
-- Progress
-- ---------------------------------------------------------------------------
-- Cycle and module progress were returning zero because nothing counted. These
-- run as the caller — SECURITY INVOKER — so RLS on issues still applies and a
-- non-member counts nothing rather than counting everything.
--
-- Counting is by state *group* rather than state name, because a project may
-- rename its states but the five groups are fixed.

create or replace function public.cycle_progress(p_project_id uuid)
returns table (
  cycle_id uuid,
  total_issues integer,
  completed_issues integer,
  backlog_issues integer,
  started_issues integer,
  unstarted_issues integer,
  cancelled_issues integer
)
language sql
stable
set search_path = public
as $$
  select
    ci.cycle_id,
    count(*)::integer,
    count(*) filter (where s."group" = 'completed')::integer,
    count(*) filter (where s."group" = 'backlog')::integer,
    count(*) filter (where s."group" = 'started')::integer,
    count(*) filter (where s."group" = 'unstarted')::integer,
    count(*) filter (where s."group" = 'cancelled')::integer
  from public.cycle_issues ci
  join public.issues i on i.id = ci.issue_id and i.deleted_at is null
  left join public.states s on s.id = i.state_id
  where ci.project_id = p_project_id
    and ci.deleted_at is null
  group by ci.cycle_id;
$$;

grant execute on function public.cycle_progress(uuid) to authenticated;

create or replace function public.module_progress(p_project_id uuid)
returns table (
  module_id uuid,
  total_issues integer,
  completed_issues integer,
  backlog_issues integer,
  started_issues integer,
  unstarted_issues integer,
  cancelled_issues integer
)
language sql
stable
set search_path = public
as $$
  select
    mi.module_id,
    count(*)::integer,
    count(*) filter (where s."group" = 'completed')::integer,
    count(*) filter (where s."group" = 'backlog')::integer,
    count(*) filter (where s."group" = 'started')::integer,
    count(*) filter (where s."group" = 'unstarted')::integer,
    count(*) filter (where s."group" = 'cancelled')::integer
  from public.module_issues mi
  join public.issues i on i.id = mi.issue_id and i.deleted_at is null
  left join public.states s on s.id = i.state_id
  where mi.project_id = p_project_id
    and mi.deleted_at is null
  group by mi.module_id;
$$;

grant execute on function public.module_progress(uuid) to authenticated;

-- Counts per state and per priority for a whole project — what the analytics
-- panel charts, and what the sidebar shows next to each state.
create or replace function public.project_work_item_counts(p_project_id uuid)
returns table (
  state_id uuid,
  state_group text,
  priority text,
  work_item_count integer
)
language sql
stable
set search_path = public
as $$
  select
    i.state_id,
    s."group"::text,
    i.priority,
    count(*)::integer
  from public.issues i
  left join public.states s on s.id = i.state_id
  where i.project_id = p_project_id
    and i.deleted_at is null
  group by i.state_id, s."group", i.priority;
$$;

grant execute on function public.project_work_item_counts(uuid) to authenticated;
