-- The last of Phase 2: intake triage, estimates, work item types, project
-- membership and workspace invitations.
--
-- Three of these share a problem the earlier migrations did not have: they are
-- privileged. Adding someone to a project, inviting them to a workspace and
-- changing a role are not things every member may do. Until now every policy
-- asked "are you a member"; these ask "at what level", which is what
-- workspace_role() and the project_role() added below are for.
--
-- Roles are Django's numbers, unchanged: 20 admin, 15 member, 5 guest.

create or replace function public.project_role(p_project_id uuid)
returns smallint
language sql
security definer
stable
set search_path = public
as $$
  select pm.role
  from public.project_members pm
  where pm.project_id = p_project_id
    and pm.member_id = auth.uid()
    and pm.is_active
  limit 1;
$$;

grant execute on function public.project_role(uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Project membership
-- ---------------------------------------------------------------------------
-- "Inviting" someone to a project is not an invitation: they are already in the
-- workspace, so it is an add. Only workspace invitations involve an email and a
-- token, and those are further down.

create or replace function public.add_project_members(
  p_project_id uuid,
  p_members jsonb
)
returns setof public.project_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_member jsonb;
  v_member_id uuid;
  v_role smallint;
  v_row public.project_members;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;
  if coalesce(public.project_role(p_project_id), 0) < 20 then
    raise exception 'Only a project admin can add members.' using errcode = '42501';
  end if;

  select p.workspace_id into v_workspace_id
  from public.projects p
  where p.id = p_project_id and p.deleted_at is null;

  if v_workspace_id is null then
    raise exception 'That project does not exist.' using errcode = '22023';
  end if;

  for v_member in select * from jsonb_array_elements(coalesce(p_members, '[]'::jsonb))
  loop
    v_member_id := (v_member ->> 'member_id')::uuid;
    v_role := coalesce((v_member ->> 'role')::smallint, 5);

    -- A project cannot contain someone the workspace does not.
    if not exists (
      select 1 from public.workspace_members wm
      where wm.workspace_id = v_workspace_id
        and wm.member_id = v_member_id
        and wm.is_active
    ) then
      raise exception 'That person is not a member of this workspace.' using errcode = '42501';
    end if;

    -- Someone removed from a project keeps their row with is_active false, so
    -- re-adding them restores it rather than colliding with the unique index.
    insert into public.project_members (
      id, created_at, updated_at, project_id, workspace_id, member_id, role,
      is_active, created_by_id, updated_by_id,
      view_props, default_props, preferences, sort_order
    )
    values (
      gen_random_uuid(), now(), now(), p_project_id, v_workspace_id, v_member_id, v_role,
      true, v_user, v_user,
      '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, 65535
    )
    on conflict (project_id, member_id) where deleted_at is null
    do update set is_active = true, role = excluded.role, updated_at = now(), updated_by_id = v_user
    returning * into v_row;

    -- Django created this alongside the membership; the project sidebar reads
    -- its sort_order, and its absence is an empty project list rather than an
    -- error, which is the harder kind of bug to find.
    insert into public.project_user_properties (
      id, created_at, updated_at, project_id, workspace_id, user_id,
      filters, display_filters, display_properties, rich_filters, preferences,
      sort_order, created_by_id, updated_by_id
    )
    values (
      gen_random_uuid(), now(), now(), p_project_id, v_workspace_id, v_member_id,
      '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
      65535, v_user, v_user
    )
    on conflict do nothing;

    return next v_row;
  end loop;
end;
$$;

grant execute on function public.add_project_members(uuid, jsonb) to authenticated;

-- Removing a member is a deactivation, not a delete: their authored work items,
-- comments and activity rows still point at them.
create or replace function public.remove_project_member(
  p_project_id uuid,
  p_member_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  -- Leaving is always allowed. Removing someone else is an admin action.
  if p_member_id <> v_user and coalesce(public.project_role(p_project_id), 0) < 20 then
    raise exception 'Only a project admin can remove members.' using errcode = '42501';
  end if;

  -- A project with no admin cannot be administered again.
  if coalesce((select pm.role from public.project_members pm
               where pm.project_id = p_project_id and pm.member_id = p_member_id
                 and pm.is_active), 0) = 20
     and (select count(*) from public.project_members pm
          where pm.project_id = p_project_id and pm.role = 20 and pm.is_active) <= 1
  then
    raise exception 'A project must keep at least one admin.' using errcode = '42501';
  end if;

  update public.project_members
  set is_active = false, updated_at = now(), updated_by_id = v_user
  where project_id = p_project_id and member_id = p_member_id;
end;
$$;

grant execute on function public.remove_project_member(uuid, uuid) to authenticated;

-- 0004 let a member edit only their own row, which made role changes
-- impossible. An admin may edit anyone's; everyone may still edit their own,
-- because view_props and preferences live on that row.
drop policy if exists "project members update own" on public.project_members;
create policy "project members update"
  on public.project_members for update
  to authenticated
  using (member_id = auth.uid() or coalesce(public.project_role(project_id), 0) >= 20)
  with check (member_id = auth.uid() or coalesce(public.project_role(project_id), 0) >= 20);

-- ---------------------------------------------------------------------------
-- Workspace membership and invitations
-- ---------------------------------------------------------------------------

create or replace function public.update_workspace_member_role(
  p_workspace_slug text,
  p_member_id uuid,
  p_role smallint
)
returns public.workspace_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_row public.workspace_members;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  select w.id into v_workspace_id
  from public.workspaces w
  where w.slug = p_workspace_slug and w.deleted_at is null;

  if coalesce(public.workspace_role(v_workspace_id), 0) < 20 then
    raise exception 'Only a workspace admin can change roles.' using errcode = '42501';
  end if;

  if p_member_id = v_user and p_role < 20 then
    raise exception 'You cannot remove your own admin access.' using errcode = '42501';
  end if;

  update public.workspace_members
  set role = p_role, updated_at = now(), updated_by_id = v_user
  where workspace_id = v_workspace_id and member_id = p_member_id
  returning * into v_row;

  if v_row.id is null then
    raise exception 'That person is not a member of this workspace.' using errcode = '22023';
  end if;

  return v_row;
end;
$$;

grant execute on function public.update_workspace_member_role(text, uuid, smallint) to authenticated;

create or replace function public.remove_workspace_member(
  p_workspace_slug text,
  p_member_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  select w.id into v_workspace_id
  from public.workspaces w
  where w.slug = p_workspace_slug and w.deleted_at is null;

  if p_member_id <> v_user and coalesce(public.workspace_role(v_workspace_id), 0) < 20 then
    raise exception 'Only a workspace admin can remove members.' using errcode = '42501';
  end if;

  if coalesce((select wm.role from public.workspace_members wm
               where wm.workspace_id = v_workspace_id and wm.member_id = p_member_id
                 and wm.is_active), 0) = 20
     and (select count(*) from public.workspace_members wm
          where wm.workspace_id = v_workspace_id and wm.role = 20 and wm.is_active) <= 1
  then
    raise exception 'A workspace must keep at least one admin.' using errcode = '42501';
  end if;

  -- Workspace access gone means project access gone with it.
  update public.project_members
  set is_active = false, updated_at = now(), updated_by_id = v_user
  where workspace_id = v_workspace_id and member_id = p_member_id;

  update public.workspace_members
  set is_active = false, updated_at = now(), updated_by_id = v_user
  where workspace_id = v_workspace_id and member_id = p_member_id;
end;
$$;

grant execute on function public.remove_workspace_member(text, uuid) to authenticated;

-- Invitations.
--
-- There is no transactional email yet, so nothing is sent. The row and its token
-- are created and returned to the inviter, who can pass on the link by whatever
-- means they have. That is the honest version of this feature until email
-- exists; it is not a substitute for it.
create or replace function public.create_workspace_invitations(
  p_workspace_slug text,
  p_invites jsonb
)
returns setof public.workspace_member_invites
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_invite jsonb;
  v_email text;
  v_role smallint;
  v_row public.workspace_member_invites;
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
  if coalesce(public.workspace_role(v_workspace_id), 0) < 20 then
    raise exception 'Only a workspace admin can invite people.' using errcode = '42501';
  end if;

  for v_invite in select * from jsonb_array_elements(coalesce(p_invites, '[]'::jsonb))
  loop
    v_email := lower(btrim(v_invite ->> 'email'));
    v_role := coalesce((v_invite ->> 'role')::smallint, 5);

    if v_email = '' or v_email !~ '^[^@\s]+@[^@\s]+\.[^@\s]+$' then
      raise exception 'That is not an email address: %', v_email using errcode = '22023';
    end if;

    -- An admin cannot mint an invitation more powerful than their own role.
    if v_role > coalesce(public.workspace_role(v_workspace_id), 0) then
      raise exception 'You cannot invite someone at a higher role than your own.' using errcode = '42501';
    end if;

    if exists (
      select 1
      from public.workspace_members wm
      join public.users u on u.id = wm.member_id
      where wm.workspace_id = v_workspace_id and lower(u.email) = v_email and wm.is_active
    ) then
      raise exception '% is already a member of this workspace.', v_email using errcode = '23505';
    end if;

    -- The token is the invitation. gen_random_uuid twice is 256 bits of
    -- unguessable, which is what stops an invitation being enumerated.
    insert into public.workspace_member_invites (
      id, created_at, updated_at, workspace_id, email, accepted, token, message,
      role, created_by_id, updated_by_id
    )
    values (
      gen_random_uuid(), now(), now(), v_workspace_id, v_email, false,
      replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
      nullif(v_invite ->> 'message', ''),
      v_role, v_user, v_user
    )
    on conflict (email, workspace_id) where deleted_at is null
    do update set role = excluded.role, updated_at = now(), updated_by_id = v_user
    returning * into v_row;

    return next v_row;
  end loop;
end;
$$;

grant execute on function public.create_workspace_invitations(text, jsonb) to authenticated;

-- Accepting is the moment an email address becomes a member row. It runs as
-- definer because the accepter is, by definition, not yet a member — no policy
-- could let them write their own membership without letting them write anyone's.
create or replace function public.accept_workspace_invitation(p_invitation_id uuid)
returns public.workspace_members
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
  v_invite public.workspace_member_invites;
  v_row public.workspace_members;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  select * into v_invite
  from public.workspace_member_invites i
  where i.id = p_invitation_id and i.deleted_at is null;

  if v_invite.id is null then
    raise exception 'That invitation does not exist.' using errcode = '22023';
  end if;

  -- The invitation is addressed to an email, so that is what is checked. Being
  -- able to name the id is not the same as being the person invited.
  if lower(v_invite.email) <> v_email or v_email = '' then
    raise exception 'That invitation was sent to a different email address.' using errcode = '42501';
  end if;
  if v_invite.accepted then
    raise exception 'That invitation has already been used.' using errcode = '22023';
  end if;

  insert into public.workspace_members (
    id, created_at, updated_at, workspace_id, member_id, role, is_active,
    created_by_id, updated_by_id, view_props, default_props, company_role
  )
  values (
    gen_random_uuid(), now(), now(), v_invite.workspace_id, v_user, v_invite.role, true,
    v_user, v_user, '{}'::jsonb, '{}'::jsonb, null
  )
  on conflict (workspace_id, member_id) where deleted_at is null
  do update set is_active = true, role = excluded.role, updated_at = now()
  returning * into v_row;

  update public.workspace_member_invites
  set accepted = true, responded_at = now(), updated_at = now()
  where id = p_invitation_id;

  return v_row;
end;
$$;

grant execute on function public.accept_workspace_invitation(uuid) to authenticated;

create or replace function public.decline_workspace_invitation(p_invitation_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := lower(coalesce(auth.jwt() ->> 'email', ''));
begin
  update public.workspace_member_invites
  set responded_at = now(), deleted_at = now(), updated_at = now()
  where id = p_invitation_id
    and lower(email) = v_email
    and v_email <> ''
    and deleted_at is null;
end;
$$;

grant execute on function public.decline_workspace_invitation(uuid) to authenticated;

-- 0003 let you read invitations addressed to you. An admin also needs to see the
-- ones they have sent, to know who is outstanding.
drop policy if exists "invites read as admin" on public.workspace_member_invites;
create policy "invites read as admin"
  on public.workspace_member_invites for select
  to authenticated
  using (coalesce(public.workspace_role(workspace_id), 0) >= 20);

-- Revoking an outstanding invitation. Creation stays with the function, which is
-- where the role ceiling and the duplicate check live.
drop policy if exists "invites revoke as admin" on public.workspace_member_invites;
create policy "invites revoke as admin"
  on public.workspace_member_invites for update
  to authenticated
  using (coalesce(public.workspace_role(workspace_id), 0) >= 20)
  with check (coalesce(public.workspace_role(workspace_id), 0) >= 20);

-- ---------------------------------------------------------------------------
-- Intake
-- ---------------------------------------------------------------------------
-- Intake is a project's front door: anyone may file, and a member triages. A
-- filed item is a real work item from the start, parked in the triage state, so
-- accepting it is a state change rather than a conversion.

create or replace function public.ensure_project_intake(p_project_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_intake_id uuid;
begin
  if not public.is_project_member(p_project_id) then
    raise exception 'You are not a member of that project.' using errcode = '42501';
  end if;

  select i.id into v_intake_id
  from public.intakes i
  where i.project_id = p_project_id and i.deleted_at is null
  order by i.is_default desc, i.created_at asc
  limit 1;

  if v_intake_id is not null then
    return v_intake_id;
  end if;

  select p.workspace_id into v_workspace_id from public.projects p where p.id = p_project_id;

  insert into public.intakes (
    id, created_at, updated_at, name, description, is_default,
    project_id, workspace_id, view_props, logo_props, created_by_id, updated_by_id
  )
  values (
    gen_random_uuid(), now(), now(), 'Intake', '', true,
    p_project_id, v_workspace_id, '{}'::jsonb, '{}'::jsonb, v_user, v_user
  )
  returning id into v_intake_id;

  return v_intake_id;
end;
$$;

grant execute on function public.ensure_project_intake(uuid) to authenticated;

create or replace function public.create_intake_work_item(
  p_project_id uuid,
  p_name text,
  p_description_html text default '<p></p>',
  p_priority text default 'none'
)
returns public.intake_issues
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_intake_id uuid;
  v_triage_state uuid;
  v_issue public.issues;
  v_row public.intake_issues;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  v_intake_id := public.ensure_project_intake(p_project_id);

  select p.workspace_id into v_workspace_id from public.projects p where p.id = p_project_id;

  select s.id into v_triage_state
  from public.states s
  where s.project_id = p_project_id and s.is_triage and s.deleted_at is null
  limit 1;

  if v_triage_state is null then
    raise exception 'This project has no triage state, so nothing can be filed to it.' using errcode = '22023';
  end if;

  -- Reuse create_work_item rather than repeat it: the sequence allocation it
  -- guards is exactly as necessary here as anywhere else.
  select * into v_issue
  from public.create_work_item(
    p_project_id, p_name, p_description_html, p_priority, v_triage_state
  );

  insert into public.intake_issues (
    id, created_at, updated_at, intake_id, issue_id, status, source,
    project_id, workspace_id, extra, created_by_id, updated_by_id
  )
  values (
    gen_random_uuid(), now(), now(), v_intake_id, v_issue.id, -2, 'IN_APP',
    p_project_id, v_workspace_id, '{}'::jsonb, v_user, v_user
  )
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.create_intake_work_item(uuid, text, text, text) to authenticated;

-- Triage. The status codes are Django's: -2 pending, -1 rejected, 0 snoozed,
-- 1 accepted, 2 duplicate.
--
-- Accepting is the only one that touches the work item: it leaves triage for the
-- project's default state, which is what makes it appear in the normal views.
create or replace function public.update_intake_status(
  p_intake_issue_id uuid,
  p_status integer,
  p_snoozed_till timestamptz default null,
  p_duplicate_to uuid default null
)
returns public.intake_issues
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_row public.intake_issues;
  v_default_state uuid;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  select * into v_row from public.intake_issues where id = p_intake_issue_id and deleted_at is null;

  if v_row.id is null then
    raise exception 'That intake item does not exist.' using errcode = '22023';
  end if;
  if not public.is_project_member(v_row.project_id) then
    raise exception 'You are not a member of that project.' using errcode = '42501';
  end if;
  if p_status not in (-2, -1, 0, 1, 2) then
    raise exception 'That is not an intake status.' using errcode = '22023';
  end if;
  if p_status = 0 and p_snoozed_till is null then
    raise exception 'Snoozing needs a date to snooze until.' using errcode = '22023';
  end if;
  if p_status = 2 and p_duplicate_to is null then
    raise exception 'Marking a duplicate needs the work item it duplicates.' using errcode = '22023';
  end if;

  update public.intake_issues
  set status = p_status,
      snoozed_till = case when p_status = 0 then p_snoozed_till else null end,
      duplicate_to_id = case when p_status = 2 then p_duplicate_to else null end,
      updated_at = now(),
      updated_by_id = v_user
  where id = p_intake_issue_id
  returning * into v_row;

  if p_status = 1 then
    select s.id into v_default_state
    from public.states s
    where s.project_id = v_row.project_id and s."default" and s.deleted_at is null
    limit 1;

    if v_default_state is not null then
      update public.issues
      set state_id = v_default_state, updated_at = now(), updated_by_id = v_user
      where id = v_row.issue_id
        and state_id in (select id from public.states where project_id = v_row.project_id and is_triage);
    end if;
  end if;

  -- Rejecting or declaring a duplicate removes it from the project's work,
  -- without destroying what was filed — the intake row still shows it happened.
  if p_status in (-1, 2) then
    update public.issues
    set deleted_at = now(), updated_by_id = v_user
    where id = v_row.issue_id and deleted_at is null;
  end if;

  return v_row;
end;
$$;

grant execute on function public.update_intake_status(uuid, integer, timestamptz, uuid) to authenticated;

-- ---------------------------------------------------------------------------
-- Estimates
-- ---------------------------------------------------------------------------
-- An estimate without its points is not usable and not visible, so the two are
-- written together for the same reason a project and its states are.

create or replace function public.create_estimate(
  p_project_id uuid,
  p_name text,
  p_type text,
  p_points jsonb
)
returns public.estimates
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_estimate public.estimates;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;
  if coalesce(public.project_role(p_project_id), 0) < 20 then
    raise exception 'Only a project admin can change estimates.' using errcode = '42501';
  end if;
  if p_type not in ('categories', 'points', 'time') then
    raise exception 'That is not an estimate system.' using errcode = '22023';
  end if;
  if jsonb_array_length(coalesce(p_points, '[]'::jsonb)) = 0 then
    raise exception 'An estimate needs at least one point.' using errcode = '22023';
  end if;

  select p.workspace_id into v_workspace_id from public.projects p where p.id = p_project_id;

  -- Only one estimate is in use at a time, so a new one takes over.
  update public.estimates set last_used = false, updated_at = now()
  where project_id = p_project_id and last_used;

  insert into public.estimates (
    id, created_at, updated_at, name, description, type, last_used,
    project_id, workspace_id, created_by_id, updated_by_id
  )
  values (
    gen_random_uuid(), now(), now(),
    coalesce(nullif(btrim(p_name), ''), 'Estimate'), '', p_type, true,
    p_project_id, v_workspace_id, v_user, v_user
  )
  returning * into v_estimate;

  insert into public.estimate_points (
    id, created_at, updated_at, estimate_id, key, value, description,
    project_id, workspace_id, created_by_id, updated_by_id
  )
  select
    gen_random_uuid(), now(), now(), v_estimate.id,
    coalesce((point ->> 'key')::integer, ordinality::integer - 1),
    coalesce(point ->> 'value', ''), '',
    p_project_id, v_workspace_id, v_user, v_user
  from jsonb_array_elements(p_points) with ordinality as t(point, ordinality);

  return v_estimate;
end;
$$;

grant execute on function public.create_estimate(uuid, text, text, jsonb) to authenticated;

-- 0003 gave estimates a workspace-wide read policy as a placeholder. 0006 gave
-- them the project-scoped pair they actually want; this removes the wider one,
-- which would otherwise still grant reads on its own.
drop policy if exists "estimates read as member" on public.estimates;

-- ---------------------------------------------------------------------------
-- Work item types
-- ---------------------------------------------------------------------------
-- Types are defined once per workspace and enabled per project, so the two
-- tables have different owners: an admin defines, a project member enables.
-- Both are guarded by to_regclass — these tables are not present in every build.

do $$
begin
  if to_regclass('public.issue_types') is not null then
    execute 'drop policy if exists "issue types write as admin" on public.issue_types';
    execute $p$
      create policy "issue types write as admin"
        on public.issue_types for all
        to authenticated
        using (coalesce(public.workspace_role(workspace_id), 0) >= 20)
        with check (coalesce(public.workspace_role(workspace_id), 0) >= 20)
    $p$;
  end if;

  if to_regclass('public.project_issue_types') is not null then
    execute 'drop policy if exists "project issue types read" on public.project_issue_types';
    execute $p$
      create policy "project issue types read"
        on public.project_issue_types for select
        to authenticated
        using (public.is_project_member(project_id))
    $p$;

    execute 'drop policy if exists "project issue types write" on public.project_issue_types';
    execute $p$
      create policy "project issue types write"
        on public.project_issue_types for all
        to authenticated
        using (coalesce(public.project_role(project_id), 0) >= 20)
        with check (coalesce(public.project_role(project_id), 0) >= 20)
    $p$;
  end if;
end;
$$;
