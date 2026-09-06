-- ---------------------------------------------------------------------------
-- 0025_instance_admin_privileges.sql
--
-- Grants omnipotent Superadmin (Instance Admin) capabilities across Keel:
-- 1. Helper function is_instance_admin()
-- 2. Comprehensive RLS policies allowing instance admins to inspect and manage
--    users, workspaces, memberships, projects, work items, and app settings.
-- 3. Audit log table public.admin_audit_logs.
-- 4. Atomic administrative RPCs for user management, workspace management,
--    role assignments, and platform analytics.
-- ---------------------------------------------------------------------------

-- Helper function: True if the calling user is an active instance admin / superuser.
create or replace function public.is_instance_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from public.users
    where id = auth.uid()
      and (is_superuser = true or is_staff = true)
      and is_active = true
  );
$$;

grant execute on function public.is_instance_admin() to authenticated;

-- Ensure if only 1 user exists in public.users, or if no superuser exists yet,
-- the first user is granted superuser so they are not locked out of the admin panel.
do $$
declare
  v_first_user uuid;
  v_superuser_count int;
begin
  select count(*) into v_superuser_count from public.users where is_superuser = true;
  if v_superuser_count = 0 then
    select id into v_first_user from public.users order by created_at asc limit 1;
    if v_first_user is not null then
      update public.users set is_superuser = true, is_staff = true where id = v_first_user;
    end if;
  end if;
end;
$$;

-- ---------------------------------------------------------------------------
-- RLS Superadmin Bypass Policies
-- ---------------------------------------------------------------------------

-- 1. Users & Profiles
drop policy if exists "admin all users" on public.users;
create policy "admin all users"
  on public.users for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

drop policy if exists "admin all profiles" on public.profiles;
create policy "admin all profiles"
  on public.profiles for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

-- 2. Workspaces & Memberships
drop policy if exists "admin all workspaces" on public.workspaces;
create policy "admin all workspaces"
  on public.workspaces for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

drop policy if exists "admin all workspace_members" on public.workspace_members;
create policy "admin all workspace_members"
  on public.workspace_members for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

drop policy if exists "admin all workspace_invites" on public.workspace_member_invites;
create policy "admin all workspace_invites"
  on public.workspace_member_invites for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

-- 3. Projects & Work Items
drop policy if exists "admin all projects" on public.projects;
create policy "admin all projects"
  on public.projects for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

drop policy if exists "admin all project_members" on public.project_members;
create policy "admin all project_members"
  on public.project_members for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

drop policy if exists "admin all issues" on public.issues;
create policy "admin all issues"
  on public.issues for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

-- 4. App Settings
grant select, insert, update, delete on public.app_settings to authenticated;

drop policy if exists "admin all app_settings" on public.app_settings;
create policy "admin all app_settings"
  on public.app_settings for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

-- ---------------------------------------------------------------------------
-- Audit Logs Table
-- ---------------------------------------------------------------------------
create table if not exists public.admin_audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  actor_id uuid references public.users(id) on delete set null,
  actor_email text not null default '',
  action text not null,
  target_type text not null,
  target_id text,
  details jsonb not null default '{}'::jsonb,
  ip_address text default ''
);

alter table public.admin_audit_logs enable row level security;

grant select, insert on public.admin_audit_logs to authenticated;

drop policy if exists "admin all audit_logs" on public.admin_audit_logs;
create policy "admin all audit_logs"
  on public.admin_audit_logs for all
  to authenticated
  using (public.is_instance_admin())
  with check (public.is_instance_admin());

-- ---------------------------------------------------------------------------
-- Superadmin RPC Functions
-- ---------------------------------------------------------------------------

-- 1. Platform KPIs & Overview Stats
create or replace function public.admin_get_platform_stats()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_total_users bigint;
  v_active_users bigint;
  v_new_users_30d bigint;
  v_total_workspaces bigint;
  v_total_projects bigint;
  v_total_issues bigint;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can access platform statistics.' using errcode = '42501';
  end if;

  select count(*) into v_total_users from public.users;
  select count(*) into v_active_users from public.users where is_active = true;
  select count(*) into v_new_users_30d from public.users where created_at >= (now() - interval '30 days');
  select count(*) into v_total_workspaces from public.workspaces where deleted_at is null;
  select count(*) into v_total_projects from public.projects where deleted_at is null;
  select count(*) into v_total_issues from public.issues where deleted_at is null;

  return jsonb_build_object(
    'total_users', v_total_users,
    'active_users', v_active_users,
    'new_users_30d', v_new_users_30d,
    'total_workspaces', v_total_workspaces,
    'total_projects', v_total_projects,
    'total_issues', v_total_issues
  );
end;
$$;

grant execute on function public.admin_get_platform_stats() to authenticated;

-- 2. User Directory with Workspace Count
create or replace function public.admin_list_users(
  p_search text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  email text,
  display_name text,
  avatar text,
  is_active boolean,
  is_superuser boolean,
  is_staff boolean,
  created_at timestamptz,
  last_login timestamptz,
  workspaces_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can access user directory.' using errcode = '42501';
  end if;

  return query
  select
    u.id,
    u.email,
    coalesce(nullif(btrim(u.display_name), ''), split_part(u.email, '@', 1)) as display_name,
    coalesce(u.avatar, '') as avatar,
    u.is_active,
    u.is_superuser,
    u.is_staff,
    u.created_at,
    u.updated_at as last_login,
    coalesce(count(wm.workspace_id), 0) as workspaces_count
  from public.users u
  left join public.workspace_members wm on wm.member_id = u.id and wm.is_active = true
  where (
    p_search is null
    or p_search = ''
    or u.email ilike ('%' || p_search || '%')
    or u.display_name ilike ('%' || p_search || '%')
  )
  group by u.id
  order by u.created_at desc
  limit coalesce(p_limit, 50)
  offset coalesce(p_offset, 0);
end;
$$;

grant execute on function public.admin_list_users(text, int, int) to authenticated;

-- 3. Create User Directly
create or replace function public.admin_create_user(
  p_email text,
  p_password text,
  p_display_name text default '',
  p_is_superuser boolean default false,
  p_initial_workspace_id uuid default null,
  p_initial_role smallint default 15
)
returns jsonb
language plpgsql
security definer
set search_path = public, auth, extensions
as $$
declare
  v_user_id uuid := gen_random_uuid();
  v_actor_email text;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can create users.' using errcode = '42501';
  end if;

  if p_email is null or btrim(p_email) = '' or p_email !~ '^[^@]+@[^@]+\.[^@]+$' then
    raise exception 'Valid email address is required.' using errcode = '22023';
  end if;

  if exists (select 1 from auth.users where lower(email) = lower(btrim(p_email))) then
    raise exception 'A user with this email already exists.' using errcode = '23505';
  end if;

  select email into v_actor_email from public.users where id = auth.uid();

  -- Insert directly into auth.users (Supabase Auth)
  insert into auth.users (
    id, instance_id, email, encrypted_password, email_confirmed_at,
    raw_app_meta_data, raw_user_meta_data, created_at, updated_at, role, aud
  )
  values (
    v_user_id,
    '00000000-0000-0000-0000-000000000000',
    lower(btrim(p_email)),
    extensions.crypt(p_password, extensions.gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}'::jsonb,
    jsonb_build_object('display_name', coalesce(p_display_name, split_part(p_email, '@', 1))),
    now(),
    now(),
    'authenticated',
    'authenticated'
  );

  -- The trigger on_auth_user_created automatically creates public.users row
  -- Set superuser status if requested
  if p_is_superuser then
    update public.users
    set is_superuser = true, is_staff = true
    where id = v_user_id;
  end if;

  -- Enroll in initial workspace if provided
  if p_initial_workspace_id is not null then
    insert into public.workspace_members (
      id, created_at, updated_at, workspace_id, member_id, role, is_active,
      created_by_id, updated_by_id, view_props, default_props, issue_props,
      explored_features, getting_started_checklist, tips
    )
    values (
      gen_random_uuid(), now(), now(), p_initial_workspace_id, v_user_id,
      coalesce(p_initial_role, 15), true, auth.uid(), auth.uid(),
      '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
    )
    on conflict (workspace_id, member_id) do update
    set role = excluded.role, is_active = true, updated_at = now();
  end if;

  -- Audit log
  insert into public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details)
  values (auth.uid(), coalesce(v_actor_email, ''), 'CREATE_USER', 'user', v_user_id::text, jsonb_build_object('email', p_email, 'is_superuser', p_is_superuser));

  return jsonb_build_object('id', v_user_id, 'email', p_email, 'success', true);
end;
$$;

grant execute on function public.admin_create_user(text, text, text, boolean, uuid, smallint) to authenticated;

-- 4. Update User Status & Roles
create or replace function public.admin_update_user(
  p_user_id uuid,
  p_is_active boolean default null,
  p_is_superuser boolean default null
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_email text;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can update user status.' using errcode = '42501';
  end if;

  select email into v_actor_email from public.users where id = auth.uid();

  update public.users
  set
    is_active = coalesce(p_is_active, is_active),
    is_superuser = coalesce(p_is_superuser, is_superuser),
    is_staff = coalesce(p_is_superuser, is_staff),
    updated_at = now()
  where id = p_user_id;

  -- Audit log
  insert into public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details)
  values (auth.uid(), coalesce(v_actor_email, ''), 'UPDATE_USER', 'user', p_user_id::text, jsonb_build_object('is_active', p_is_active, 'is_superuser', p_is_superuser));

  return true;
end;
$$;

grant execute on function public.admin_update_user(uuid, boolean, boolean) to authenticated;

-- 5. Delete User
create or replace function public.admin_delete_user(p_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  v_actor_email text;
  v_user_email text;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can delete users.' using errcode = '42501';
  end if;

  if p_user_id = auth.uid() then
    raise exception 'Cannot delete your own administrator account.' using errcode = '22023';
  end if;

  select email into v_actor_email from public.users where id = auth.uid();
  select email into v_user_email from public.users where id = p_user_id;

  -- Remove workspace memberships
  delete from public.workspace_members where member_id = p_user_id;
  delete from public.project_members where member_id = p_user_id;
  delete from public.profiles where user_id = p_user_id;
  delete from public.users where id = p_user_id;
  delete from auth.users where id = p_user_id;

  -- Audit log
  insert into public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details)
  values (auth.uid(), coalesce(v_actor_email, ''), 'DELETE_USER', 'user', p_user_id::text, jsonb_build_object('email', v_user_email));

  return true;
end;
$$;

grant execute on function public.admin_delete_user(uuid) to authenticated;

-- 6. Enriched Workspaces Directory
create or replace function public.admin_list_workspaces(
  p_search text default null,
  p_limit int default 50,
  p_offset int default 0
)
returns table (
  id uuid,
  name text,
  slug text,
  logo_url text,
  created_at timestamptz,
  owner_id uuid,
  owner_email text,
  owner_name text,
  members_count bigint,
  projects_count bigint,
  issues_count bigint
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can view all workspaces.' using errcode = '42501';
  end if;

  return query
  select
    w.id,
    w.name,
    w.slug,
    coalesce(w.logo_url, '') as logo_url,
    w.created_at,
    w.owner_id,
    coalesce(u.email, 'unknown') as owner_email,
    coalesce(nullif(btrim(u.display_name), ''), split_part(u.email, '@', 1), 'Unknown') as owner_name,
    (select count(*) from public.workspace_members wm where wm.workspace_id = w.id and wm.is_active = true) as members_count,
    (select count(*) from public.projects p where p.workspace_id = w.id and p.deleted_at is null) as projects_count,
    (select count(*) from public.issues wi where wi.workspace_id = w.id and wi.deleted_at is null) as issues_count
  from public.workspaces w
  left join public.users u on u.id = w.owner_id
  where w.deleted_at is null
    and (
      p_search is null
      or p_search = ''
      or w.name ilike ('%' || p_search || '%')
      or w.slug ilike ('%' || p_search || '%')
      or u.email ilike ('%' || p_search || '%')
    )
  order by w.created_at desc
  limit coalesce(p_limit, 50)
  offset coalesce(p_offset, 0);
end;
$$;

grant execute on function public.admin_list_workspaces(text, int, int) to authenticated;

-- 7. Transfer Workspace Ownership
create or replace function public.admin_transfer_workspace_owner(
  p_workspace_id uuid,
  p_new_owner_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_email text;
  v_workspace_name text;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can transfer workspace ownership.' using errcode = '42501';
  end if;

  select name into v_workspace_name from public.workspaces where id = p_workspace_id;
  if not found then
    raise exception 'Workspace not found.' using errcode = 'P0002';
  end if;

  select email into v_actor_email from public.users where id = auth.uid();

  -- Update owner
  update public.workspaces
  set owner_id = p_new_owner_id, updated_at = now()
  where id = p_workspace_id;

  -- Ensure new owner is an active Admin (20) in workspace_members
  insert into public.workspace_members (
    id, created_at, updated_at, workspace_id, member_id, role, is_active,
    created_by_id, updated_by_id, view_props, default_props, issue_props,
    explored_features, getting_started_checklist, tips
  )
  values (
    gen_random_uuid(), now(), now(), p_workspace_id, p_new_owner_id, 20, true,
    auth.uid(), auth.uid(), '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
  )
  on conflict (workspace_id, member_id) do update
  set role = 20, is_active = true, updated_at = now();

  -- Audit log
  insert into public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details)
  values (auth.uid(), coalesce(v_actor_email, ''), 'TRANSFER_WORKSPACE_OWNER', 'workspace', p_workspace_id::text, jsonb_build_object('workspace', v_workspace_name, 'new_owner', p_new_owner_id));

  return true;
end;
$$;

grant execute on function public.admin_transfer_workspace_owner(uuid, uuid) to authenticated;

-- 8. Delete Workspace
create or replace function public.admin_delete_workspace(p_workspace_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_email text;
  v_workspace_name text;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can delete workspaces.' using errcode = '42501';
  end if;

  select name into v_workspace_name from public.workspaces where id = p_workspace_id;
  select email into v_actor_email from public.users where id = auth.uid();

  update public.workspaces set deleted_at = now() where id = p_workspace_id;
  delete from public.workspace_members where workspace_id = p_workspace_id;

  -- Audit log
  insert into public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details)
  values (auth.uid(), coalesce(v_actor_email, ''), 'DELETE_WORKSPACE', 'workspace', p_workspace_id::text, jsonb_build_object('workspace', v_workspace_name));

  return true;
end;
$$;

grant execute on function public.admin_delete_workspace(uuid) to authenticated;

-- 9. Enter / Join Workspace as Admin ("God Mode" Join)
create or replace function public.admin_join_workspace(p_workspace_id uuid)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_actor_email text;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can perform god-mode join.' using errcode = '42501';
  end if;

  select email into v_actor_email from public.users where id = v_user_id;

  insert into public.workspace_members (
    id, created_at, updated_at, workspace_id, member_id, role, is_active,
    created_by_id, updated_by_id, view_props, default_props, issue_props,
    explored_features, getting_started_checklist, tips
  )
  values (
    gen_random_uuid(), now(), now(), p_workspace_id, v_user_id, 20, true,
    v_user_id, v_user_id, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
  )
  on conflict (workspace_id, member_id) do update
  set role = 20, is_active = true, updated_at = now();

  -- Audit log
  insert into public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details)
  values (v_user_id, coalesce(v_actor_email, ''), 'GOD_MODE_JOIN', 'workspace', p_workspace_id::text, '{}'::jsonb);

  return true;
end;
$$;

grant execute on function public.admin_join_workspace(uuid) to authenticated;

-- 10. Add Any User to Any Workspace & Set Role
create or replace function public.admin_add_user_to_workspace(
  p_workspace_id uuid,
  p_user_id uuid,
  p_role smallint default 15
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_email text;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can add users to workspaces.' using errcode = '42501';
  end if;

  select email into v_actor_email from public.users where id = auth.uid();

  insert into public.workspace_members (
    id, created_at, updated_at, workspace_id, member_id, role, is_active,
    created_by_id, updated_by_id, view_props, default_props, issue_props,
    explored_features, getting_started_checklist, tips
  )
  values (
    gen_random_uuid(), now(), now(), p_workspace_id, p_user_id, coalesce(p_role, 15), true,
    auth.uid(), auth.uid(), '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb
  )
  on conflict (workspace_id, member_id) do update
  set role = excluded.role, is_active = true, updated_at = now();

  -- Audit log
  insert into public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details)
  values (auth.uid(), coalesce(v_actor_email, ''), 'ADD_WORKSPACE_MEMBER', 'workspace', p_workspace_id::text, jsonb_build_object('member_id', p_user_id, 'role', p_role));

  return true;
end;
$$;

grant execute on function public.admin_add_user_to_workspace(uuid, uuid, smallint) to authenticated;

-- 11. Update Workspace Member Role
create or replace function public.admin_update_workspace_member_role(
  p_workspace_id uuid,
  p_user_id uuid,
  p_new_role smallint
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_email text;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can change member roles.' using errcode = '42501';
  end if;

  select email into v_actor_email from public.users where id = auth.uid();

  update public.workspace_members
  set role = p_new_role, updated_at = now()
  where workspace_id = p_workspace_id and member_id = p_user_id;

  -- Audit log
  insert into public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details)
  values (auth.uid(), coalesce(v_actor_email, ''), 'UPDATE_MEMBER_ROLE', 'workspace', p_workspace_id::text, jsonb_build_object('member_id', p_user_id, 'role', p_new_role));

  return true;
end;
$$;

grant execute on function public.admin_update_workspace_member_role(uuid, uuid, smallint) to authenticated;

-- 12. Remove User From Workspace
create or replace function public.admin_remove_user_from_workspace(
  p_workspace_id uuid,
  p_user_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_email text;
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized: Only instance administrators can remove workspace members.' using errcode = '42501';
  end if;

  select email into v_actor_email from public.users where id = auth.uid();

  delete from public.workspace_members
  where workspace_id = p_workspace_id and member_id = p_user_id;

  -- Audit log
  insert into public.admin_audit_logs (actor_id, actor_email, action, target_type, target_id, details)
  values (auth.uid(), coalesce(v_actor_email, ''), 'REMOVE_WORKSPACE_MEMBER', 'workspace', p_workspace_id::text, jsonb_build_object('member_id', p_user_id));

  return true;
end;
$$;

grant execute on function public.admin_remove_user_from_workspace(uuid, uuid) to authenticated;

-- 13. Get Workspace Members List for Admin
create or replace function public.admin_get_workspace_members(p_workspace_id uuid)
returns table (
  member_id uuid,
  email text,
  display_name text,
  avatar text,
  role smallint,
  is_active boolean,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized.' using errcode = '42501';
  end if;

  return query
  select
    u.id as member_id,
    u.email,
    coalesce(nullif(btrim(u.display_name), ''), split_part(u.email, '@', 1)) as display_name,
    coalesce(u.avatar, '') as avatar,
    wm.role,
    wm.is_active,
    wm.created_at as joined_at
  from public.workspace_members wm
  join public.users u on u.id = wm.member_id
  where wm.workspace_id = p_workspace_id
  order by wm.role desc, wm.created_at asc;
end;
$$;

grant execute on function public.admin_get_workspace_members(uuid) to authenticated;

-- 14. Get User Workspaces List for Admin
create or replace function public.admin_get_user_workspaces(p_user_id uuid)
returns table (
  workspace_id uuid,
  name text,
  slug text,
  role smallint,
  joined_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized.' using errcode = '42501';
  end if;

  return query
  select
    w.id as workspace_id,
    w.name,
    w.slug,
    wm.role,
    wm.created_at as joined_at
  from public.workspace_members wm
  join public.workspaces w on w.id = wm.workspace_id
  where wm.member_id = p_user_id and w.deleted_at is null
  order by wm.created_at desc;
end;
$$;

grant execute on function public.admin_get_user_workspaces(uuid) to authenticated;

-- 15. Audit Logs Reader
create or replace function public.admin_list_audit_logs(
  p_limit int default 100,
  p_offset int default 0
)
returns table (
  id uuid,
  created_at timestamptz,
  actor_id uuid,
  actor_email text,
  action text,
  target_type text,
  target_id text,
  details jsonb
)
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_instance_admin() then
    raise exception 'Unauthorized.' using errcode = '42501';
  end if;

  return query
  select
    al.id,
    al.created_at,
    al.actor_id,
    al.actor_email,
    al.action,
    al.target_type,
    al.target_id,
    al.details
  from public.admin_audit_logs al
  order by al.created_at desc
  limit coalesce(p_limit, 100)
  offset coalesce(p_offset, 0);
end;
$$;

grant execute on function public.admin_list_audit_logs(int, int) to authenticated;
