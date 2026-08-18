-- ---------------------------------------------------------------------------
-- seed.sql — demo content for a project: work items across every view, plus
-- chat channels and a short conversation.
--
-- Replaces the old "Seed Data" toolbar button. Run it from the Supabase SQL
-- editor (or `psql "$DATABASE_URL" -f supabase/seed.sql`), where it runs as an
-- owner and so is not filtered by RLS — which is the point, since the button's
-- version could only ever write as the person clicking it.
--
-- Safe to run twice: every insert is keyed on a name that is checked first.
--
-- To target a specific project, set v_project_id below. Left null, it picks the
-- most recently created project.
-- ---------------------------------------------------------------------------

do $$
declare
  v_project_id  uuid := null;
  v_workspace   uuid;
  v_author      uuid;
  v_sequence    bigint;
  v_issue_id    uuid;
  v_channel_id  uuid;
  v_member_ids  uuid[];
  v_state_id    uuid;
  v_item        record;
  v_msg         record;
  v_today       date := current_date;
begin
  if v_project_id is null then
    select p.id into v_project_id
    from public.projects p
    where p.deleted_at is null
    order by p.created_at desc
    limit 1;
  end if;

  if v_project_id is null then
    raise notice 'No project found — create a project first, then re-run this seed.';
    return;
  end if;

  select p.workspace_id into v_workspace from public.projects p where p.id = v_project_id;

  -- Attribute everything to a real member, so the rows look like the app wrote them.
  select array_agg(pm.member_id) into v_member_ids
  from public.project_members pm
  where pm.project_id = v_project_id and pm.is_active;

  v_author := v_member_ids[1];

  if v_author is null then
    raise notice 'Project % has no active members — nothing to attribute the seed data to.', v_project_id;
    return;
  end if;

  raise notice 'Seeding project % (workspace %)', v_project_id, v_workspace;

  -- -------------------------------------------------------------------------
  -- Work items. Spread across state groups, priorities and dates so the list,
  -- board, calendar, table and timeline views all have something to draw.
  -- -------------------------------------------------------------------------
  for v_item in
    select *
    from (
      values
        ('Design system and theme refresh', 'urgent',  'started',    -2,  5,
         'Vibrant accent tokens, dual-theme support, and the modern layout controls.'),
        ('Work item API validation and UUID sanitisation', 'high', 'completed', -9, -1,
         'Empty strings coerce to null before they reach Postgres.'),
        ('Views toolbar: list, board, calendar, table, timeline', 'high', 'started', 0, 7,
         'One-click switching between every work item layout.'),
        ('Me Mode filter toggle', 'medium', 'unstarted', 2, 10,
         'Filter the board down to the signed-in user in a single click.'),
        ('Chat: channels, messages and realtime stream', 'high', 'started', -1, 4,
         'Per-project channels with a live message feed.'),
        ('Sprint retrospective and roadmap', 'low', 'backlog', 5, 14,
         'Team feedback on the redesign, and what the next milestone contains.'),
        ('Onboarding empty states', 'medium', 'unstarted', 3, 9,
         'Every view needs something useful to say when it has no data.'),
        ('Timeline dependencies pass', 'low', 'backlog', 8, 21,
         'Blocked-by relationships drawn on the timeline view.')
    ) as t(name, priority, state_group, start_offset, target_offset, summary)
  loop
    if exists (
      select 1 from public.issues i
      where i.project_id = v_project_id and i.name = v_item.name and i.deleted_at is null
    ) then
      continue;
    end if;

    select s.id into v_state_id
    from public.states s
    where s.project_id = v_project_id and s."group" = v_item.state_group and s.deleted_at is null
    limit 1;

    if v_state_id is null then
      select s.id into v_state_id
      from public.states s
      where s.project_id = v_project_id and s."default" and s.deleted_at is null
      limit 1;
    end if;

    select coalesce(max(i.sequence_id), 0) + 1 into v_sequence
    from public.issues i where i.project_id = v_project_id;

    v_issue_id := gen_random_uuid();

    insert into public.issues (
      id, created_at, updated_at, name, description_html, description_json,
      description_stripped, priority, state_id, parent_id, project_id, workspace_id,
      sequence_id, sort_order, is_draft, start_date, target_date,
      created_by_id, updated_by_id
    )
    values (
      v_issue_id, now(), now(), v_item.name,
      '<p>' || v_item.summary || '</p>', '{}'::jsonb,
      v_item.summary, v_item.priority, v_state_id, null, v_project_id, v_workspace,
      v_sequence, v_sequence * 10000, false,
      v_today + v_item.start_offset, v_today + v_item.target_offset,
      v_author, v_author
    );

    insert into public.issue_sequences (
      id, created_at, updated_at, sequence, issue_id, project_id, workspace_id,
      deleted, created_by_id, updated_by_id
    )
    values (
      gen_random_uuid(), now(), now(), v_sequence, v_issue_id, v_project_id, v_workspace,
      false, v_author, v_author
    );

    -- Round-robin the assignee across members so Me Mode and grouping have variety.
    insert into public.issue_assignees (
      id, created_at, updated_at, assignee_id, issue_id, project_id, workspace_id,
      created_by_id, updated_by_id
    )
    values (
      gen_random_uuid(), now(), now(),
      v_member_ids[1 + (v_sequence % array_length(v_member_ids, 1))],
      v_issue_id, v_project_id, v_workspace, v_author, v_author
    );
  end loop;

  -- -------------------------------------------------------------------------
  -- Chat. The app creates these channels on first visit; seeding them here
  -- means the view has a conversation in it rather than three empty rooms.
  -- -------------------------------------------------------------------------
  if to_regclass('public.chat_channels') is not null then
    insert into public.chat_channels (name, description, project_id, workspace_id, created_by_id, updated_by_id)
    select c.name, c.description, v_project_id, v_workspace, v_author, v_author
    from (
      values
        ('general',   'General project discussions and team updates'),
        ('dev-team',  'Engineering and code review chat'),
        ('design-ui', 'UI/UX specs, assets, and design system discussions')
    ) as c(name, description)
    where not exists (
      select 1 from public.chat_channels ch
      where ch.project_id = v_project_id and ch.name = c.name
    );

    select ch.id into v_channel_id
    from public.chat_channels ch
    where ch.project_id = v_project_id and ch.name = 'general'
    limit 1;

    if v_channel_id is not null
       and not exists (select 1 from public.chat_messages m where m.channel_id = v_channel_id) then
      for v_msg in
        select *
        from (
          values
            (1, 'Kicking off the redesign here — every view now has a tab in the toolbar.', 45),
            (2, 'Timeline view is picking up the seeded start and target dates correctly.', 32),
            (3, 'Chat is on Postgres realtime now, so new messages arrive without a refresh.', 12),
            (4, 'Nice. Retro is on the board under backlog when we are ready for it.', 3)
        ) as m(ordinal, body, minutes_ago)
      loop
        insert into public.chat_messages (
          channel_id, project_id, workspace_id, message, sender_id, sender_name, created_at, updated_at
        )
        select
          v_channel_id, v_project_id, v_workspace, v_msg.body,
          v_member_ids[1 + (v_msg.ordinal % array_length(v_member_ids, 1))],
          coalesce(
            nullif(u.display_name, ''),
            nullif(u.first_name, ''),
            'Teammate'
          ),
          now() - make_interval(mins => v_msg.minutes_ago),
          now() - make_interval(mins => v_msg.minutes_ago)
        from public.users u
        where u.id = v_member_ids[1 + (v_msg.ordinal % array_length(v_member_ids, 1))];
      end loop;
    end if;
  end if;

  raise notice 'Seed complete.';
end;
$$;
