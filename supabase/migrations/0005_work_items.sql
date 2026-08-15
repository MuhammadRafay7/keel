-- Work items.
--
-- The one genuinely new problem here is sequence_id — the per-project counter
-- behind KEEL-1, KEEL-2. Django allocated it in Python, which is racy under
-- concurrency: two simultaneous creates read the same maximum and both write
-- it. A transaction-scoped advisory lock keyed on the project serialises just
-- that allocation, so two people creating work items at the same moment queue
-- for a moment instead of colliding. The lock is released with the transaction,
-- so nothing leaks if the insert fails.

create or replace function public.create_work_item(
  p_project_id uuid,
  p_name text,
  p_description_html text default '<p></p>',
  p_priority text default 'none',
  p_state_id uuid default null,
  p_parent_id uuid default null,
  p_start_date date default null,
  p_target_date date default null,
  p_assignees uuid[] default '{}',
  p_labels uuid[] default '{}'
)
returns public.issues
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_state_id uuid := p_state_id;
  v_sequence bigint;
  v_issue public.issues;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  if not public.is_project_member(p_project_id) then
    raise exception 'You are not a member of that project.' using errcode = '42501';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'A work item needs a name.' using errcode = '22023';
  end if;

  select p.workspace_id into v_workspace_id
  from public.projects p
  where p.id = p_project_id and p.deleted_at is null;

  if v_workspace_id is null then
    raise exception 'That project does not exist.' using errcode = '22023';
  end if;

  -- Fall back to the project's default state, the way the create form does.
  if v_state_id is null then
    select s.id into v_state_id
    from public.states s
    where s.project_id = p_project_id and s."default" and s.deleted_at is null
    limit 1;
  end if;

  -- Serialise sequence allocation for this project only.
  perform pg_advisory_xact_lock(hashtextextended(p_project_id::text, 0));

  select coalesce(max(i.sequence_id), 0) + 1 into v_sequence
  from public.issues i
  where i.project_id = p_project_id;

  insert into public.issues (
    id, created_at, updated_at, name, description_html, description_json,
    description_stripped, priority, state_id, parent_id, project_id, workspace_id,
    sequence_id, sort_order, is_draft, start_date, target_date,
    created_by_id, updated_by_id
  )
  values (
    gen_random_uuid(), now(), now(), btrim(p_name),
    coalesce(p_description_html, '<p></p>'), '{}'::jsonb,
    '', coalesce(p_priority, 'none'), v_state_id, p_parent_id, p_project_id, v_workspace_id,
    v_sequence, v_sequence * 10000, false, p_start_date, p_target_date,
    v_user, v_user
  )
  returning * into v_issue;

  insert into public.issue_sequences (
    id, created_at, updated_at, sequence, issue_id, project_id, workspace_id,
    deleted, created_by_id, updated_by_id
  )
  values (
    gen_random_uuid(), now(), now(), v_sequence, v_issue.id, p_project_id, v_workspace_id,
    false, v_user, v_user
  );

  if array_length(p_assignees, 1) is not null then
    insert into public.issue_assignees (
      id, created_at, updated_at, assignee_id, issue_id, project_id, workspace_id,
      created_by_id, updated_by_id
    )
    select gen_random_uuid(), now(), now(), a, v_issue.id, p_project_id, v_workspace_id, v_user, v_user
    from unnest(p_assignees) as a;
  end if;

  if array_length(p_labels, 1) is not null then
    insert into public.issue_labels (
      id, created_at, updated_at, label_id, issue_id, project_id, workspace_id,
      created_by_id, updated_by_id
    )
    select gen_random_uuid(), now(), now(), l, v_issue.id, p_project_id, v_workspace_id, v_user, v_user
    from unnest(p_labels) as l;
  end if;

  return v_issue;
end;
$$;

grant execute on function public.create_work_item(uuid, text, text, text, uuid, uuid, date, date, uuid[], uuid[]) to authenticated;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

-- Work items and everything hanging off them share one rule: you reach them
-- through the project. Applied in a loop because the tables differ only by name.
do $$
declare
  t text;
begin
  foreach t in array array[
    'issues', 'issue_assignees', 'issue_labels', 'issue_comments', 'issue_links',
    'issue_attachments', 'issue_relations', 'issue_subscribers', 'issue_reactions',
    'issue_activities', 'issue_sequences', 'cycles', 'modules', 'cycle_issues', 'module_issues'
  ]
  loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;

    execute format('drop policy if exists %I on public.%I', t || ' read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_project_member(project_id))',
      t || ' read', t
    );

    execute format('drop policy if exists %I on public.%I', t || ' write', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_project_member(project_id)) with check (public.is_project_member(project_id))',
      t || ' write', t
    );
  end loop;
end;
$$;
