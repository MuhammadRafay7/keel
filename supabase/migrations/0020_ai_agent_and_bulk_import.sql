-- ---------------------------------------------------------------------------
-- 0020_ai_agent_and_bulk_import.sql
--
-- Two things the AI surface needs that the database cannot currently express:
--
-- 1. Bulk work item creation. An import of 200 rows through create_work_item
--    is 200 round trips, and a failure halfway leaves half an import behind
--    with no way to tell which half. One function, one transaction, one
--    advisory lock, one contiguous block of sequence numbers.
--
-- 2. Somewhere for an agent conversation to live. The agent is multi-turn by
--    definition — it calls a tool, reads the result, and decides what to do
--    next — so the turns have to outlive a single HTTP request.
--
-- Everything here runs as the caller. The agent deliberately gets no elevated
-- path into project data: its tools go through the same RLS every other client
-- is subject to, so "what the agent can touch" and "what the user can touch"
-- are the same question with the same answer.
-- ---------------------------------------------------------------------------

-- ---------------------------------------------------------------------------
-- Bulk work item creation
-- ---------------------------------------------------------------------------

/**
 * Creates many work items in one transaction.
 *
 * `p_items` is a JSON array; each element mirrors create_work_item's arguments:
 *   { name, description_html, priority, state_id, parent_id,
 *     start_date, target_date, assignees: [uuid], labels: [uuid] }
 *
 * Returns the created rows. Any single bad element aborts the whole call —
 * a partially applied import is worse than a failed one, because the user
 * cannot tell what to retry.
 */
create or replace function public.create_work_items_bulk(
  p_project_id uuid,
  p_items jsonb
)
returns setof public.issues
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_workspace_id uuid;
  v_default_state uuid;
  v_base_sequence bigint;
  v_offset bigint := 0;
  v_item jsonb;
  v_state_id uuid;
  v_issue public.issues;
  v_assignees uuid[];
  v_labels uuid[];
  v_count int;
begin
  if v_user is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  if not public.is_project_member(p_project_id) then
    raise exception 'You are not a member of that project.' using errcode = '42501';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Items must be a JSON array.' using errcode = '22023';
  end if;

  v_count := jsonb_array_length(p_items);
  if v_count = 0 then
    return;
  end if;

  -- An import is a bounded operation, not a firehose. The ceiling keeps one
  -- call from holding the project's sequence lock for an unbounded time.
  if v_count > 500 then
    raise exception 'Cannot create more than 500 work items in one call (got %).', v_count
      using errcode = '22023';
  end if;

  select p.workspace_id into v_workspace_id
  from public.projects p
  where p.id = p_project_id and p.deleted_at is null;

  if v_workspace_id is null then
    raise exception 'That project does not exist.' using errcode = '22023';
  end if;

  select s.id into v_default_state
  from public.states s
  where s.project_id = p_project_id and s."default" and s.deleted_at is null
  limit 1;

  -- Same lock create_work_item takes, held once for the whole batch rather
  -- than re-acquired per row.
  perform pg_advisory_xact_lock(hashtextextended(p_project_id::text, 0));

  select coalesce(max(i.sequence_id), 0) into v_base_sequence
  from public.issues i
  where i.project_id = p_project_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    if coalesce(btrim(v_item->>'name'), '') = '' then
      raise exception 'Every work item needs a name; item % has none.', v_offset
        using errcode = '22023';
    end if;

    v_offset := v_offset + 1;
    v_state_id := coalesce(nullif(v_item->>'state_id', '')::uuid, v_default_state);

    insert into public.issues (
      id, created_at, updated_at, name, description_html, description_json,
      description_stripped, priority, state_id, parent_id, project_id, workspace_id,
      sequence_id, sort_order, is_draft, start_date, target_date,
      created_by_id, updated_by_id
    )
    values (
      gen_random_uuid(), now(), now(), btrim(v_item->>'name'),
      coalesce(nullif(v_item->>'description_html', ''), '<p></p>'), '{}'::jsonb,
      '', coalesce(nullif(v_item->>'priority', ''), 'none'), v_state_id,
      nullif(v_item->>'parent_id', '')::uuid, p_project_id, v_workspace_id,
      v_base_sequence + v_offset, (v_base_sequence + v_offset) * 10000, false,
      nullif(v_item->>'start_date', '')::date, nullif(v_item->>'target_date', '')::date,
      v_user, v_user
    )
    returning * into v_issue;

    insert into public.issue_sequences (
      id, created_at, updated_at, sequence, issue_id, project_id, workspace_id,
      deleted, created_by_id, updated_by_id
    )
    values (
      gen_random_uuid(), now(), now(), v_base_sequence + v_offset, v_issue.id,
      p_project_id, v_workspace_id, false, v_user, v_user
    );

    v_assignees := coalesce(
      (select array_agg(value::uuid) from jsonb_array_elements_text(coalesce(v_item->'assignees', '[]'::jsonb))),
      '{}'::uuid[]
    );
    if array_length(v_assignees, 1) is not null then
      insert into public.issue_assignees (
        id, created_at, updated_at, assignee_id, issue_id, project_id, workspace_id,
        created_by_id, updated_by_id
      )
      select gen_random_uuid(), now(), now(), a, v_issue.id, p_project_id, v_workspace_id, v_user, v_user
      from unnest(v_assignees) as a;
    end if;

    v_labels := coalesce(
      (select array_agg(value::uuid) from jsonb_array_elements_text(coalesce(v_item->'labels', '[]'::jsonb))),
      '{}'::uuid[]
    );
    if array_length(v_labels, 1) is not null then
      insert into public.issue_labels (
        id, created_at, updated_at, label_id, issue_id, project_id, workspace_id,
        created_by_id, updated_by_id
      )
      select gen_random_uuid(), now(), now(), l, v_issue.id, p_project_id, v_workspace_id, v_user, v_user
      from unnest(v_labels) as l;
    end if;

    return next v_issue;
  end loop;
end;
$$;

grant execute on function public.create_work_items_bulk(uuid, jsonb) to authenticated;

-- ---------------------------------------------------------------------------
-- Agent conversations
-- ---------------------------------------------------------------------------

create table if not exists public.ai_conversations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  user_id uuid not null references public.users(id) on delete cascade,
  workspace_id uuid references public.workspaces(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null default 'New conversation'
);

create index if not exists idx_ai_conversations_user
  on public.ai_conversations (user_id, updated_at desc)
  where deleted_at is null;

/**
 * One turn. `role` is 'user', 'assistant' or 'tool'.
 *
 * `content` holds the provider-neutral turn shape the Edge Function works in:
 * assistant turns carry their text and any tool calls, tool turns carry the
 * results. Keeping it neutral is what lets a conversation started on one
 * provider continue on another.
 */
create table if not exists public.ai_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  conversation_id uuid not null references public.ai_conversations(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'tool')),
  content jsonb not null default '{}'::jsonb,
  seq bigint not null
);

create unique index if not exists idx_ai_messages_conversation_seq
  on public.ai_messages (conversation_id, seq);

alter table public.ai_conversations enable row level security;
alter table public.ai_messages enable row level security;

-- A conversation is private to the person who had it. There is no sharing
-- model here on purpose: the agent acts with the user's own permissions, so
-- its transcript can name anything that user can see.
drop policy if exists ai_conversations_owner_all on public.ai_conversations;
create policy ai_conversations_owner_all on public.ai_conversations
  for all to authenticated
  using (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

drop policy if exists ai_messages_owner_select on public.ai_messages;
create policy ai_messages_owner_select on public.ai_messages
  for select to authenticated
  using (user_id = auth.uid());

-- Writes go through the Edge Function under the service role. Granting INSERT
-- to the browser would let a client forge an assistant turn — including a tool
-- result the agent never actually got back.
drop policy if exists ai_messages_owner_delete on public.ai_messages;
create policy ai_messages_owner_delete on public.ai_messages
  for delete to authenticated
  using (user_id = auth.uid());
