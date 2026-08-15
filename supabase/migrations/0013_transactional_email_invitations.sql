-- Transactional email notifications for workspace invitations.
--
-- Adds send_status and send_error tracking columns to public.workspace_member_invites,
-- and attaches a Postgres trigger to invoke the send-workspace-invite Edge Function via pg_net.

create extension if not exists pg_net with schema extensions;

-- Add tracking columns for email dispatch status
alter table public.workspace_member_invites
  add column if not exists send_status text not null default 'pending',
  add column if not exists send_error text;

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
  select w.name, w.slug into v_workspace_name, v_workspace_slug
  from public.workspaces w
  where w.id = NEW.workspace_id;

  select coalesce(nullif(trim(u.display_name), ''), nullif(trim(u.first_name || ' ' || u.last_name), ''), u.email)
  into v_inviter_name
  from public.users u
  where u.id = NEW.created_by_id;

  v_supabase_url := coalesce(
    nullif(current_setting('app.settings.supabase_url', true), ''),
    'http://127.0.0.1:54321'
  );

  v_anon_key := current_setting('app.settings.supabase_anon_key', true);

  -- Check if net.http_post procedure exists (pg_net extension)
  if to_regprocedure('net.http_post(text,jsonb,jsonb,integer)') is not null or to_regproc('net.http_post') is not null then
    perform net.http_post(
      url := v_supabase_url || '/functions/v1/send-workspace-invite',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || coalesce(v_anon_key, '')
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
  end if;

  return NEW;
end;
$$;

-- Trigger fires on INSERT or when send_status is reset to 'pending' on UPDATE
drop trigger if exists on_workspace_invitation_created on public.workspace_member_invites;
drop trigger if exists on_workspace_invitation_created_or_updated on public.workspace_member_invites;

create trigger on_workspace_invitation_created_or_updated
  after insert or update on public.workspace_member_invites
  for each row
  when (NEW.send_status = 'pending' and NEW.deleted_at is null)
  execute function public.trigger_send_workspace_invitation();
