-- ---------------------------------------------------------------------------
-- 0018_app_settings.sql
--
-- Gives the email triggers somewhere to read their dispatch target from.
--
-- 0013 and 0017 both reach for current_setting('app.settings.supabase_url'),
-- which assumes someone has run ALTER DATABASE ... SET. On Supabase nobody
-- can: the postgres role is not a superuser, and that statement is refused
-- with "permission denied to set parameter". The settings were therefore
-- never going to be there, and both triggers have been falling back to
-- http://127.0.0.1:54321 and posting into nothing.
--
-- A table works where a GUC cannot. It is writable by the deploy through the
-- Management API as ordinary DML, and readable by the trigger functions
-- through a security-definer accessor.
-- ---------------------------------------------------------------------------

create table if not exists public.app_settings (
  key text primary key,
  value text not null,
  updated_at timestamptz not null default now()
);

-- No policies, deliberately. Nothing in the browser needs these, and the
-- functions that do read them are security definer, so RLS does not apply.
alter table public.app_settings enable row level security;

revoke all on public.app_settings from anon, authenticated;

/**
 * Reads one deploy-time setting.
 *
 * Falls back to the matching GUC so a local stack, where ALTER DATABASE is
 * allowed, keeps working without having to seed the table.
 */
create or replace function public.app_setting(p_key text)
returns text
language plpgsql
security definer
stable
set search_path = public
as $$
declare
  v_value text;
begin
  select s.value into v_value
  from public.app_settings s
  where s.key = p_key;

  if v_value is null or v_value = '' then
    v_value := nullif(current_setting('app.settings.' || p_key, true), '');
  end if;

  return v_value;
end;
$$;

-- ---------------------------------------------------------------------------
-- Point both email triggers at the table
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
  v_supabase_url := public.app_setting('supabase_url');
  v_anon_key := public.app_setting('supabase_anon_key');

  -- Without a target there is nothing useful to do. Raising here would fail
  -- the comment that triggered it, which is a worse outcome than a missing
  -- email, so this returns quietly and leaves the notification in place.
  if v_supabase_url is null or v_anon_key is null then
    return NEW;
  end if;

  if to_regproc('net.http_post') is null then
    return NEW;
  end if;

  perform net.http_post(
    url := v_supabase_url || '/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := jsonb_build_object('notification_id', NEW.id)
  );

  return NEW;
end;
$$;

create or replace function public.trigger_send_workspace_invitation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_supabase_url text;
  v_anon_key text;
  v_inviter_name text;
  v_workspace_name text;
  v_workspace_slug text;
begin
  v_supabase_url := public.app_setting('supabase_url');
  v_anon_key := public.app_setting('supabase_anon_key');

  if v_supabase_url is null or v_anon_key is null then
    return NEW;
  end if;

  select w.name, w.slug into v_workspace_name, v_workspace_slug
  from public.workspaces w
  where w.id = NEW.workspace_id;

  select coalesce(nullif(trim(u.display_name), ''), nullif(trim(u.first_name || ' ' || u.last_name), ''), u.email)
  into v_inviter_name
  from public.users u
  where u.id = NEW.created_by_id;

  if to_regproc('net.http_post') is null then
    return NEW;
  end if;

  perform net.http_post(
    url := v_supabase_url || '/functions/v1/send-workspace-invite',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || v_anon_key
    ),
    body := jsonb_build_object(
      'invitation_id', NEW.id,
      'workspace_id', NEW.workspace_id,
      'workspace_slug', v_workspace_slug,
      'workspace_name', v_workspace_name,
      'email', NEW.email,
      'token', NEW.token,
      'message', NEW.message,
      'role', NEW.role,
      'inviter_name', coalesce(v_inviter_name, 'A teammate')
    )
  );

  return NEW;
end;
$$;
