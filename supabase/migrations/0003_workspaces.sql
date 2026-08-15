-- Workspaces: membership-scoped reads, and an atomic create.
--
-- Two problems shape this file.
--
-- First, recursion. "You can read a workspace if you are a member" and "you can
-- read the members of a workspace you belong to" are policies that reference
-- each other, and Postgres re-enters RLS while evaluating them. The way out is
-- a SECURITY DEFINER helper that reads workspace_members with RLS bypassed, so
-- the membership check never re-enters a policy.
--
-- Second, the chicken and egg in creation. An INSERT policy on workspaces would
-- have to allow a row whose membership does not exist yet, and the membership
-- row is what the policy checks. Rather than loosen that, workspaces are
-- created through a function that writes both rows in one transaction. There is
-- no INSERT policy on either table: the function is the only way in.

-- ---------------------------------------------------------------------------
-- Membership helper
-- ---------------------------------------------------------------------------

create or replace function public.is_workspace_member(p_workspace_id uuid)
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
      and wm.is_active
  );
$$;

grant execute on function public.is_workspace_member(uuid) to authenticated;

create or replace function public.workspace_role(p_workspace_id uuid)
returns smallint
language sql
security definer
stable
set search_path = public
as $$
  select wm.role
  from public.workspace_members wm
  where wm.workspace_id = p_workspace_id
    and wm.member_id = auth.uid()
    and wm.is_active
  limit 1;
$$;

grant execute on function public.workspace_role(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Creation
-- ---------------------------------------------------------------------------

create or replace function public.create_workspace(
  p_name text,
  p_slug text,
  p_organization_size text default null
)
returns public.workspaces
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace public.workspaces;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  if p_name is null or btrim(p_name) = '' then
    raise exception 'A workspace needs a name.' using errcode = '22023';
  end if;

  if p_slug is null or p_slug !~ '^[a-z0-9][a-z0-9-]*$' then
    raise exception 'That URL contains characters that are not allowed.' using errcode = '22023';
  end if;

  insert into public.workspaces (
    id, created_at, updated_at, name, slug, owner_id, created_by_id, updated_by_id,
    organization_size, timezone, background_color
  )
  values (
    gen_random_uuid(), now(), now(), btrim(p_name), p_slug, v_user, v_user, v_user,
    p_organization_size, 'UTC', ''
  )
  returning * into v_workspace;

  -- The creator is an admin of their own workspace (EUserPermissions.ADMIN).
  insert into public.workspace_members (
    id, created_at, updated_at, workspace_id, member_id, role, is_active,
    created_by_id, updated_by_id,
    view_props, default_props, issue_props,
    explored_features, getting_started_checklist, tips
  )
  values (
    gen_random_uuid(), now(), now(), v_workspace.id, v_user, 20, true,
    v_user, v_user,
    '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
    '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
  );

  return v_workspace;
end;
$$;

grant execute on function public.create_workspace(text, text, text) to authenticated;

-- Slug availability. A plain select would leak nothing useful, but routing it
-- through a function keeps the workspaces table closed to non-members.
create or replace function public.is_workspace_slug_available(p_slug text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select not exists (
    select 1 from public.workspaces w
    where w.slug = p_slug and w.deleted_at is null
  );
$$;

grant execute on function public.is_workspace_slug_available(text) to authenticated;

-- ---------------------------------------------------------------------------
-- Read and write policies
-- ---------------------------------------------------------------------------

drop policy if exists "workspaces read as member" on public.workspaces;
create policy "workspaces read as member"
  on public.workspaces for select
  to authenticated
  using (public.is_workspace_member(id));

-- Only an admin reshapes the workspace itself.
drop policy if exists "workspaces update as admin" on public.workspaces;
create policy "workspaces update as admin"
  on public.workspaces for update
  to authenticated
  using (public.workspace_role(id) = 20)
  with check (public.workspace_role(id) = 20);

drop policy if exists "workspace members read" on public.workspace_members;
create policy "workspace members read"
  on public.workspace_members for select
  to authenticated
  using (public.is_workspace_member(workspace_id));

-- A member edits their own membership row (view preferences and the like).
-- Changing someone else's role is an admin action and stays server-side.
drop policy if exists "workspace members update own" on public.workspace_members;
create policy "workspace members update own"
  on public.workspace_members for update
  to authenticated
  using (member_id = auth.uid())
  with check (member_id = auth.uid());

-- Invitations are addressed to an email, not to a member row, so this is the
-- one place membership cannot be the test.
drop policy if exists "invites read own" on public.workspace_member_invites;
create policy "invites read own"
  on public.workspace_member_invites for select
  to authenticated
  using (lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')));

-- Workspace-scoped content the application loads on entry. Read-only for now;
-- writes arrive with the phase that migrates each feature.
do $$
declare
  t text;
begin
  foreach t in array array['projects', 'project_members', 'states', 'labels', 'estimates']
  loop
    execute format('drop policy if exists %I on public.%I', t || ' read as member', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_workspace_member(workspace_id))',
      t || ' read as member', t
    );
  end loop;
end;
$$;

-- Per-user, per-workspace state. Owned by the user outright.
do $$
declare
  t text;
begin
  foreach t in array array['user_favorites', 'workspace_home_preferences', 'workspace_user_properties']
  loop
    execute format('drop policy if exists %I on public.%I', t || ' own rows', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid())',
      t || ' own rows', t
    );
  end loop;
end;
$$;
