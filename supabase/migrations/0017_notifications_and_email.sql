-- ---------------------------------------------------------------------------
-- 0017_notifications_and_email.sql
--
-- Makes collaboration actually reach people.
--
-- 0006 set up the notifications table and wrote in its policy comment that
-- "notifications are raised by triggers and server-side jobs" — but no such
-- trigger was ever written, so the bell has always been empty and nothing has
-- ever been emailed. Everything collaborative (comments, mentions, assignment,
-- chat) has therefore been invisible unless you happened to be looking at the
-- right screen at the right moment.
--
-- This migration raises notifications for the four things worth interrupting
-- someone for, then hands each one to the send-notification-email Edge
-- Function through pg_net, the same way 0013 dispatches invitations.
--
-- Deliberately not notified: your own actions (you know what you did), and
-- anything on a soft-deleted row.
-- ---------------------------------------------------------------------------

create extension if not exists pg_net with schema extensions;

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

-- The editor writes mentions as <mention-component entity_identifier="uuid">.
-- Pulling the ids out in SQL keeps mention handling in one place rather than
-- repeated in every client that can post a comment.
create or replace function public.extract_mentioned_user_ids(p_html text)
returns uuid[]
language plpgsql
immutable
as $$
declare
  v_ids uuid[] := '{}';
  v_match text[];
begin
  if p_html is null then
    return v_ids;
  end if;

  for v_match in
    select regexp_matches(
      p_html,
      'entity_identifier=[''"]([0-9a-fA-F-]{36})[''"]',
      'g'
    )
  loop
    begin
      v_ids := array_append(v_ids, v_match[1]::uuid);
    exception when others then
      -- A malformed id in the markup should not stop the comment from saving.
      continue;
    end;
  end loop;

  return (select coalesce(array_agg(distinct id), '{}') from unnest(v_ids) as id);
end;
$$;

-- One place that writes a notification row, so every caller stamps the same
-- columns and the "never notify yourself" rule cannot be forgotten.
create or replace function public.raise_notification(
  p_receiver_id uuid,
  p_triggered_by_id uuid,
  p_workspace_id uuid,
  p_project_id uuid,
  p_entity_name text,
  p_entity_identifier uuid,
  p_title text,
  p_message text,
  p_message_html text default null,
  p_data jsonb default '{}'::jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_receiver_id is null or p_receiver_id = p_triggered_by_id then
    return;
  end if;

  insert into public.notifications (
    id, created_at, updated_at, title, message, message_html, message_stripped,
    entity_name, entity_identifier, receiver_id, triggered_by_id,
    workspace_id, project_id, data
  )
  values (
    gen_random_uuid(), now(), now(), p_title, p_message,
    coalesce(p_message_html, '<p>' || coalesce(p_message, '') || '</p>'),
    coalesce(p_message, ''),
    p_entity_name, p_entity_identifier, p_receiver_id, p_triggered_by_id,
    p_workspace_id, p_project_id, coalesce(p_data, '{}'::jsonb)
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Comments: notify the people following the work item, and anyone mentioned
-- ---------------------------------------------------------------------------

create or replace function public.notify_on_issue_comment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_issue record;
  v_actor_name text;
  v_receiver uuid;
  v_mentioned uuid[];
  v_preview text;
begin
  select i.name, i.sequence_id, i.workspace_id, i.project_id
  into v_issue
  from public.issues i
  where i.id = NEW.issue_id and i.deleted_at is null;

  if v_issue is null then
    return NEW;
  end if;

  select coalesce(nullif(trim(u.display_name), ''), u.email, 'Someone')
  into v_actor_name
  from public.users u
  where u.id = NEW.actor_id;

  v_preview := left(regexp_replace(coalesce(NEW.comment_stripped, NEW.comment_html, ''), '<[^>]*>', '', 'g'), 200);

  -- Mentions first, and marked as mentions, because being named is a stronger
  -- signal than merely following the thread.
  v_mentioned := public.extract_mentioned_user_ids(NEW.comment_html);

  foreach v_receiver in array coalesce(v_mentioned, '{}')
  loop
    perform public.raise_notification(
      v_receiver, NEW.actor_id, v_issue.workspace_id, v_issue.project_id,
      'issue_mention', NEW.issue_id,
      v_actor_name || ' mentioned you',
      v_actor_name || ' mentioned you on ' || v_issue.name,
      NEW.comment_html,
      jsonb_build_object('comment_id', NEW.id, 'sequence_id', v_issue.sequence_id)
    );
  end loop;

  -- Then everyone following the work item who was not already mentioned.
  for v_receiver in
    select distinct s.subscriber_id
    from public.issue_subscribers s
    where s.issue_id = NEW.issue_id
      and s.subscriber_id <> NEW.actor_id
      and not (s.subscriber_id = any(coalesce(v_mentioned, '{}')))
    union
    select distinct a.assignee_id
    from public.issue_assignees a
    where a.issue_id = NEW.issue_id
      and a.assignee_id <> NEW.actor_id
      and not (a.assignee_id = any(coalesce(v_mentioned, '{}')))
  loop
    perform public.raise_notification(
      v_receiver, NEW.actor_id, v_issue.workspace_id, v_issue.project_id,
      'issue_comment', NEW.issue_id,
      'New comment on ' || v_issue.name,
      v_actor_name || ' commented: ' || v_preview,
      NEW.comment_html,
      jsonb_build_object('comment_id', NEW.id, 'sequence_id', v_issue.sequence_id)
    );
  end loop;

  return NEW;
end;
$$;

drop trigger if exists on_issue_comment_notify on public.issue_comments;
create trigger on_issue_comment_notify
  after insert on public.issue_comments
  for each row
  execute function public.notify_on_issue_comment();

-- ---------------------------------------------------------------------------
-- Assignment: being given a work item is worth an interruption
-- ---------------------------------------------------------------------------

create or replace function public.notify_on_issue_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_issue record;
  v_actor_name text;
begin
  select i.name, i.sequence_id, i.workspace_id, i.project_id
  into v_issue
  from public.issues i
  where i.id = NEW.issue_id and i.deleted_at is null;

  if v_issue is null then
    return NEW;
  end if;

  select coalesce(nullif(trim(u.display_name), ''), u.email, 'Someone')
  into v_actor_name
  from public.users u
  where u.id = NEW.created_by_id;

  perform public.raise_notification(
    NEW.assignee_id, NEW.created_by_id, v_issue.workspace_id, v_issue.project_id,
    'issue_assigned', NEW.issue_id,
    'Assigned to you',
    v_actor_name || ' assigned you ' || v_issue.name,
    null,
    jsonb_build_object('sequence_id', v_issue.sequence_id)
  );

  return NEW;
end;
$$;

drop trigger if exists on_issue_assignee_notify on public.issue_assignees;
create trigger on_issue_assignee_notify
  after insert on public.issue_assignees
  for each row
  execute function public.notify_on_issue_assignment();

-- ---------------------------------------------------------------------------
-- Chat: a message that names you
-- ---------------------------------------------------------------------------

-- Chat messages are plain text by design, so mentions are recorded as ids
-- alongside the text rather than as markup inside it. The display string and
-- the thing we notify on then cannot drift apart.
alter table public.chat_messages
  add column if not exists mentions uuid[] not null default '{}';

create or replace function public.notify_on_chat_mention()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_channel_name text;
  v_receiver uuid;
  v_mentioned uuid[];
begin
  select c.name into v_channel_name
  from public.chat_channels c
  where c.id = NEW.channel_id;

  v_mentioned := coalesce(NEW.mentions, '{}');

  foreach v_receiver in array v_mentioned
  loop
    perform public.raise_notification(
      v_receiver, NEW.sender_id, NEW.workspace_id, NEW.project_id,
      'chat_mention', NEW.channel_id,
      coalesce(NEW.sender_name, 'Someone') || ' mentioned you in #' || coalesce(v_channel_name, 'chat'),
      left(NEW.message, 200),
      null,
      jsonb_build_object('channel_id', NEW.channel_id, 'message_id', NEW.id)
    );
  end loop;

  return NEW;
end;
$$;

drop trigger if exists on_chat_message_notify on public.chat_messages;
create trigger on_chat_message_notify
  after insert on public.chat_messages
  for each row
  execute function public.notify_on_chat_mention();

-- ---------------------------------------------------------------------------
-- Email dispatch
--
-- Every notification row is offered to the mailer. Whether it actually sends
-- is the Edge Function's decision, because the per-user preference check and
-- the address lookup both belong next to the send.
-- ---------------------------------------------------------------------------

create or replace function public.trigger_send_notification_email()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_supabase_url text;
  v_anon_key text;
begin
  v_supabase_url := coalesce(
    nullif(current_setting('app.settings.supabase_url', true), ''),
    'http://127.0.0.1:54321'
  );

  v_anon_key := current_setting('app.settings.supabase_anon_key', true);

  if to_regproc('net.http_post') is null then
    return NEW;
  end if;

  perform net.http_post(
    url := v_supabase_url || '/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || coalesce(v_anon_key, '')
    ),
    body := jsonb_build_object('notification_id', NEW.id)
  );

  return NEW;
end;
$$;

drop trigger if exists on_notification_send_email on public.notifications;
create trigger on_notification_send_email
  after insert on public.notifications
  for each row
  execute function public.trigger_send_notification_email();

-- Reading the bell is a query per workspace per person; it deserves an index.
create index if not exists notifications_receiver_unread_idx
  on public.notifications (receiver_id, workspace_id, read_at, archived_at);

-- ---------------------------------------------------------------------------
-- Realtime
--
-- The bell should light up while you are looking at the page, not on the next
-- reload. Same publication the chat tables joined in 0016.
-- ---------------------------------------------------------------------------

alter table public.notifications replica identity full;

do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;

  if not exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'notifications'
  ) then
    alter publication supabase_realtime add table public.notifications;
  end if;
end;
$$;
