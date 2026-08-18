-- ---------------------------------------------------------------------------
-- 0016_chat_realtime_and_indexes.sql
-- Makes the chat view's message stream actually stream, and gives the two
-- queries it runs on every render an index to sit on.
--
-- 0015 created the tables but left them out of the supabase_realtime
-- publication, so postgres_changes subscriptions received nothing. Replica
-- identity has to be set too: without it Postgres publishes the primary key
-- only, and row-level security filtering on the realtime side needs the
-- whole row to decide who may see it.
-- ---------------------------------------------------------------------------

create index if not exists chat_channels_project_created_idx
  on public.chat_channels (project_id, created_at);

create index if not exists chat_messages_channel_created_idx
  on public.chat_messages (channel_id, created_at);

alter table public.chat_channels replica identity full;
alter table public.chat_messages replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_messages'
  ) then
    alter publication supabase_realtime add table public.chat_messages;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'chat_channels'
  ) then
    alter publication supabase_realtime add table public.chat_channels;
  end if;
end;
$$;
