-- ---------------------------------------------------------------------------
-- 0023_chat_workspace_channels.sql
--
-- Makes workspace-level chat possible, and makes a failed send visible.
--
-- Symptom: messages appear when sent and are gone after a reload.
--
-- Three faults stacked up to produce that, and all three have to go:
--
--   1. `chat_channels.project_id` and `chat_messages.project_id` are
--      `uuid not null`. Workspace chat has no project, so the service wrote
--      the empty string, and Postgres rejected every row with
--      `22P02 invalid input syntax for type uuid`.
--
--   2. Both RLS policies read `is_project_member(project_id)`. Even once a
--      workspace-level row could be written, nobody could read it back:
--      there is no project to be a member of.
--
--   3. `mentions` arrives in 0017. Until that migration is applied the column
--      does not exist and PostgREST rejects every insert with `PGRST204` —
--      which is why this is broken for project chat too, not just workspace
--      chat. It is added defensively here so the fix does not depend on the
--      order the backlog gets deployed in.
--
-- The UI hid all of this: every failure path caught the error and substituted
-- local state, so a message that never reached the database still rendered.
-- That is fixed in the client alongside this migration.
-- ---------------------------------------------------------------------------

-- 1. A channel may belong to a project, or to the workspace at large.
alter table public.chat_channels alter column project_id drop not null;
alter table public.chat_messages alter column project_id drop not null;

-- Rows written before this migration carry the empty-string-as-uuid attempt's
-- successors: any project id pointing at nothing useful becomes an honest null.
update public.chat_channels c
set project_id = null
where c.project_id is not null
  and not exists (select 1 from public.projects p where p.id = c.project_id);

update public.chat_messages m
set project_id = null
where m.project_id is not null
  and not exists (select 1 from public.projects p where p.id = m.project_id);

-- 2. `mentions`, in case 0017 has not run yet. Same definition, so applying
--    them in either order lands in the same place.
alter table public.chat_messages
  add column if not exists mentions uuid[] not null default '{}';

-- 3. Policies that understand both kinds of channel.
--
-- A project channel is for that project's members. A workspace channel — one
-- with no project — is for the workspace's members. Written as one predicate
-- rather than two policies so there is a single place to read the rule.
do $$
declare
  t text;
begin
  foreach t in array array['chat_channels', 'chat_messages']
  loop
    -- 0015's names, dropped so this migration supersedes rather than collides.
    execute format('drop policy if exists %I on public.%I', t || ' read', t);
    execute format('drop policy if exists %I on public.%I', t || ' write', t);

    execute format('drop policy if exists %I on public.%I', t || ' read scoped', t);
    execute format(
      'create policy %I on public.%I for select to authenticated
         using (
           case
             when project_id is null then public.is_workspace_member(workspace_id)
             else public.is_project_member(project_id)
           end
         )',
      t || ' read scoped', t
    );

    execute format('drop policy if exists %I on public.%I', t || ' write scoped', t);
    execute format(
      'create policy %I on public.%I for all to authenticated
         using (
           case
             when project_id is null then public.is_workspace_member(workspace_id)
             else public.is_project_member(project_id)
           end
         )
         with check (
           case
             when project_id is null then public.is_workspace_member(workspace_id)
             else public.is_project_member(project_id)
           end
         )',
      t || ' write scoped', t
    );
  end loop;
end;
$$;

-- 0016 indexed `(project_id, created_at)`, which a workspace channel never
-- matches. This is the lookup the workspace chat view actually performs.
create index if not exists chat_channels_workspace_created
  on public.chat_channels (workspace_id, created_at)
  where project_id is null;

create index if not exists chat_messages_channel_created
  on public.chat_messages (channel_id, created_at);

-- A workspace cannot have two channels with the same name. Without this the
-- seeding path can double up whenever two tabs open chat at the same moment,
-- which is exactly when it is most confusing.
create unique index if not exists chat_channels_unique_workspace_name
  on public.chat_channels (workspace_id, name)
  where project_id is null;

create unique index if not exists chat_channels_unique_project_name
  on public.chat_channels (project_id, name)
  where project_id is not null;
