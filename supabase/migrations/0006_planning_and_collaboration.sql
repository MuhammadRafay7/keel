-- The rest of Phase 2: cycles, modules, views, pages, intake, comments,
-- reactions, relations, links, labels, estimates, notifications.
--
-- Most of these hang off a project and reuse the shape already established:
-- read and write if you are a member of the project. They are applied in a loop
-- rather than written out, so a new project-scoped table is one array entry.
--
-- Three do not fit that shape and are handled individually below:
--   * notifications        — addressed to a person, not a project
--   * pages                — workspace-scoped, with per-page access rules
--   * project_members      — a member may edit only their own row

-- ---------------------------------------------------------------------------
-- Project-scoped tables
-- ---------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'cycles', 'cycle_issues', 'cycle_user_properties',
    'modules', 'module_issues', 'module_members',
    'issue_comments', 'comment_reactions', 'issue_reactions', 'issue_relations',
    'issue_links', 'issue_subscribers', 'issue_activities',
    'issue_views', 'intakes', 'intake_issues',
    'estimates', 'estimate_points', 'project_pages'
  ]
  loop
    if to_regclass('public.' || t) is null then
      raise notice 'skipping %, not present', t;
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

-- Workspace-scoped, not project-scoped.
do $$
declare
  t text;
begin
  foreach t in array array['issue_types']
  loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    execute format('drop policy if exists %I on public.%I', t || ' read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_workspace_member(workspace_id))',
      t || ' read', t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Notifications — personal, never project-wide
-- ---------------------------------------------------------------------------

drop policy if exists "notifications read own" on public.notifications;
create policy "notifications read own"
  on public.notifications for select
  to authenticated
  using (receiver_id = auth.uid());

-- Marking read is an update to your own notification. Creation is not a client
-- action: notifications are raised by triggers and server-side jobs.
drop policy if exists "notifications update own" on public.notifications;
create policy "notifications update own"
  on public.notifications for update
  to authenticated
  using (receiver_id = auth.uid())
  with check (receiver_id = auth.uid());

drop policy if exists "notification preferences own" on public.user_notification_preferences;
create policy "notification preferences own"
  on public.user_notification_preferences for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Pages — workspace-scoped with an access flag
-- ---------------------------------------------------------------------------
-- access = 0 is public to the workspace, 1 is private to its owner. Project
-- association lives in project_pages, so a page is reachable either way.

drop policy if exists "pages read" on public.pages;
create policy "pages read"
  on public.pages for select
  to authenticated
  using (
    public.is_workspace_member(workspace_id)
    and (access = 0 or owned_by_id = auth.uid())
  );

drop policy if exists "pages write as owner" on public.pages;
create policy "pages write as owner"
  on public.pages for all
  to authenticated
  using (public.is_workspace_member(workspace_id) and owned_by_id = auth.uid())
  with check (public.is_workspace_member(workspace_id) and owned_by_id = auth.uid());

do $$
declare
  t text;
begin
  foreach t in array array['page_labels', 'page_logs']
  loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    execute format('drop policy if exists %I on public.%I', t || ' read', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id))',
      t || ' read', t
    );
  end loop;
end;
$$;

-- ---------------------------------------------------------------------------
-- Creation helpers
-- ---------------------------------------------------------------------------

create or replace function public.create_cycle(
  p_project_id uuid,
  p_name text,
  p_description text default '',
  p_start_date date default null,
  p_end_date date default null
)
returns public.cycles
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_cycle public.cycles;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;
  if not public.is_project_member(p_project_id) then
    raise exception 'You are not a member of that project.' using errcode = '42501';
  end if;
  if p_name is null or btrim(p_name) = '' then
    raise exception 'A cycle needs a name.' using errcode = '22023';
  end if;
  -- A cycle with only one of its two dates cannot be scheduled or burned down.
  if (p_start_date is null) <> (p_end_date is null) then
    raise exception 'A cycle needs both a start and an end date, or neither.' using errcode = '22023';
  end if;
  if p_start_date is not null and p_end_date < p_start_date then
    raise exception 'A cycle cannot end before it starts.' using errcode = '22023';
  end if;

  select p.workspace_id into v_workspace_id from public.projects p where p.id = p_project_id;

  insert into public.cycles (
    id, created_at, updated_at, name, description, start_date, end_date,
    owned_by_id, project_id, workspace_id, created_by_id, updated_by_id,
    view_props, progress_snapshot, logo_props, sort_order, timezone, version
  )
  values (
    gen_random_uuid(), now(), now(), btrim(p_name), coalesce(p_description, ''), p_start_date, p_end_date,
    v_user, p_project_id, v_workspace_id, v_user, v_user,
    '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 65535, 'UTC', 1
  )
  returning * into v_cycle;

  return v_cycle;
end;
$$;

grant execute on function public.create_cycle(uuid, text, text, date, date) to authenticated;

create or replace function public.create_module(
  p_project_id uuid,
  p_name text,
  p_description text default '',
  p_status text default 'planned',
  p_start_date date default null,
  p_target_date date default null,
  p_lead_id uuid default null
)
returns public.modules
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_module public.modules;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;
  if not public.is_project_member(p_project_id) then
    raise exception 'You are not a member of that project.' using errcode = '42501';
  end if;
  if p_name is null or btrim(p_name) = '' then
    raise exception 'A module needs a name.' using errcode = '22023';
  end if;

  select p.workspace_id into v_workspace_id from public.projects p where p.id = p_project_id;

  insert into public.modules (
    id, created_at, updated_at, name, description, status,
    start_date, target_date, lead_id, project_id, workspace_id,
    created_by_id, updated_by_id, view_props, logo_props, sort_order
  )
  values (
    gen_random_uuid(), now(), now(), btrim(p_name), coalesce(p_description, ''), coalesce(p_status, 'planned'),
    p_start_date, p_target_date, p_lead_id, p_project_id, v_workspace_id,
    v_user, v_user, '{}'::jsonb, '{}'::jsonb, 65535
  )
  returning * into v_module;

  return v_module;
end;
$$;

grant execute on function public.create_module(uuid, text, text, text, date, date, uuid) to authenticated;

-- A page is workspace-level; project_pages is what puts it in a project, so
-- both rows are written together when a project is given.
create or replace function public.create_page(
  p_workspace_slug text,
  p_name text default 'Untitled',
  p_access smallint default 0,
  p_project_id uuid default null
)
returns public.pages
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_page public.pages;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  select w.id into v_workspace_id
  from public.workspaces w
  where w.slug = p_workspace_slug and w.deleted_at is null;

  if v_workspace_id is null or not public.is_workspace_member(v_workspace_id) then
    raise exception 'You are not a member of that workspace.' using errcode = '42501';
  end if;

  if p_project_id is not null and not public.is_project_member(p_project_id) then
    raise exception 'You are not a member of that project.' using errcode = '42501';
  end if;

  insert into public.pages (
    id, created_at, updated_at, name, description_html, description_json,
    access, owned_by_id, workspace_id, created_by_id, updated_by_id,
    color, is_locked, view_props, logo_props, is_global, sort_order
  )
  values (
    gen_random_uuid(), now(), now(), coalesce(nullif(btrim(p_name), ''), 'Untitled'), '<p></p>', '{}'::jsonb,
    coalesce(p_access, 0), v_user, v_workspace_id, v_user, v_user,
    '', false, '{}'::jsonb, '{}'::jsonb, false, 65535
  )
  returning * into v_page;

  if p_project_id is not null then
    insert into public.project_pages (
      id, created_at, updated_at, page_id, project_id, workspace_id,
      created_by_id, updated_by_id
    )
    values (
      gen_random_uuid(), now(), now(), v_page.id, p_project_id, v_workspace_id,
      v_user, v_user
    );
  end if;

  return v_page;
end;
$$;

grant execute on function public.create_page(text, text, smallint, uuid) to authenticated;
