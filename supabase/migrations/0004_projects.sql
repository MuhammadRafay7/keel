-- Projects, and the rows a project cannot function without.
--
-- Creating a project is three writes, not one: the project, the creator's
-- membership, and the six default states. Django did that in a view; here it is
-- a single function so a half-made project cannot exist. Same reasoning as
-- create_workspace in 0003 — and the same consequence: no INSERT policy on
-- projects or project_members, because the function is the only way in.

create or replace function public.is_project_member(p_project_id uuid)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.project_members pm
    where pm.project_id = p_project_id
      and pm.member_id = auth.uid()
      and pm.is_active
  );
$$;

grant execute on function public.is_project_member(uuid) to authenticated;

create or replace function public.create_project(
  p_workspace_slug text,
  p_name text,
  p_identifier text,
  p_description text default '',
  p_network smallint default 2,
  p_logo_props jsonb default '{}'::jsonb
)
returns public.projects
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_project public.projects;
  v_identifier text := upper(btrim(p_identifier));
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  select w.id into v_workspace_id
  from public.workspaces w
  where w.slug = p_workspace_slug and w.deleted_at is null;

  if v_workspace_id is null then
    raise exception 'That workspace does not exist.' using errcode = '22023';
  end if;

  -- Membership is checked explicitly: this function runs as definer, so RLS is
  -- not doing it for us.
  if not public.is_workspace_member(v_workspace_id) then
    raise exception 'You are not a member of that workspace.' using errcode = '42501';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'A project needs a name.' using errcode = '22023';
  end if;

  if v_identifier = '' or v_identifier !~ '^[A-Z0-9]+$' then
    raise exception 'A project ID may only contain letters and numbers.' using errcode = '22023';
  end if;

  if exists (
    select 1 from public.projects p
    where p.workspace_id = v_workspace_id
      and upper(p.identifier) = v_identifier
      and p.deleted_at is null
  ) then
    raise exception 'That project ID is already used in this workspace.' using errcode = '23505';
  end if;

  insert into public.projects (
    id, created_at, updated_at, name, description, identifier, workspace_id,
    created_by_id, updated_by_id, project_lead_id, network, logo_props,
    cycle_view, module_view, issue_views_view, page_view, intake_view,
    archive_in, close_in, is_time_tracking_enabled, is_issue_type_enabled,
    guest_view_all_features, timezone
  )
  values (
    gen_random_uuid(), now(), now(), btrim(p_name), coalesce(p_description, ''), v_identifier, v_workspace_id,
    v_user, v_user, v_user, coalesce(p_network, 2), coalesce(p_logo_props, '{}'::jsonb),
    true, true, true, true, false,
    0, 0, false, false,
    false, 'UTC'
  )
  returning * into v_project;

  insert into public.project_members (
    id, created_at, updated_at, project_id, workspace_id, member_id, role,
    is_active, created_by_id, updated_by_id,
    view_props, default_props, preferences, sort_order
  )
  values (
    gen_random_uuid(), now(), now(), v_project.id, v_workspace_id, v_user, 20,
    true, v_user, v_user,
    '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 65535
  );

  -- The six states every project starts with. Triage is flagged rather than
  -- named so the application can find it without matching on a label.
  insert into public.states (
    id, created_at, updated_at, name, description, color, slug,
    project_id, workspace_id, sequence, "group", "default", is_triage,
    created_by_id, updated_by_id
  )
  select
    gen_random_uuid(), now(), now(), s.name, '', s.color, lower(s.name),
    v_project.id, v_workspace_id, s.sequence, s.grp, s.is_default, (s.grp = 'triage'),
    v_user, v_user
  from (values
    ('Backlog',     '#60646C', 15000, 'backlog',   true),
    ('Todo',        '#60646C', 25000, 'unstarted', false),
    ('In Progress', '#F59E0B', 35000, 'started',   false),
    ('Done',        '#46A758', 45000, 'completed', false),
    ('Cancelled',   '#9AA4BC', 55000, 'cancelled', false),
    ('Triage',      '#4E5355', 65000, 'triage',    false)
  ) as s(name, color, sequence, grp, is_default);

  return v_project;
end;
$$;

grant execute on function public.create_project(text, text, text, text, smallint, jsonb) to authenticated;

create or replace function public.is_project_identifier_available(
  p_workspace_slug text,
  p_identifier text
)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists (
    select 1
    from public.projects p
    join public.workspaces w on w.id = p.workspace_id
    where w.slug = p_workspace_slug
      and upper(p.identifier) = upper(btrim(p_identifier))
      and p.deleted_at is null
  );
$$;

grant execute on function public.is_project_identifier_available(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Policies
-- ---------------------------------------------------------------------------

-- 0003 gave projects a read policy for workspace members. Replace it: a project
-- is visible if it is public to the workspace (network 2) or you are a member
-- of it, which is what the network column exists to express.
drop policy if exists "projects read as member" on public.projects;
-- Drop the replacement too, so re-running this file is safe.
drop policy if exists "projects read" on public.projects;
create policy "projects read"
  on public.projects for select
  to authenticated
  using (
    public.is_workspace_member(workspace_id)
    and (network = 2 or public.is_project_member(id))
  );

drop policy if exists "projects update as project admin" on public.projects;
create policy "projects update as project admin"
  on public.projects for update
  to authenticated
  using (public.is_project_member(id))
  with check (public.is_project_member(id));

drop policy if exists "project_members read as member" on public.project_members;
drop policy if exists "project members read" on public.project_members;
create policy "project members read"
  on public.project_members for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "project members update own" on public.project_members;
create policy "project members update own"
  on public.project_members for update
  to authenticated
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

-- States belong to a project, so project membership is the test, not workspace
-- membership as the placeholder in 0003 assumed.
drop policy if exists "states read as member" on public.states;
drop policy if exists "states read" on public.states;
create policy "states read"
  on public.states for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "states write as project member" on public.states;
create policy "states write as project member"
  on public.states for all
  to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));

drop policy if exists "labels read as member" on public.labels;
drop policy if exists "labels read" on public.labels;
create policy "labels read"
  on public.labels for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

drop policy if exists "labels write as project member" on public.labels;
create policy "labels write as project member"
  on public.labels for all
  to authenticated
  using (public.is_project_member(project_id))
  with check (public.is_project_member(project_id));
