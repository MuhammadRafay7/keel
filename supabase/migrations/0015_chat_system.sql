-- ---------------------------------------------------------------------------
-- 0015_chat_system.sql
-- Chat channels and messages table definitions for ClickUp 3.0 Chat system
-- ---------------------------------------------------------------------------

create table if not exists public.chat_channels (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null,
  description text default '',
  is_private boolean not null default false,
  project_id uuid not null references public.projects(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  created_by_id uuid references auth.users(id) on delete set null,
  updated_by_id uuid references auth.users(id) on delete set null
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  channel_id uuid not null references public.chat_channels(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  message text not null,
  sender_id uuid references auth.users(id) on delete set null,
  sender_name text default 'Anonymous',
  sender_avatar text default '',
  attachments jsonb default '[]'::jsonb,
  reactions jsonb default '{}'::jsonb
);

-- RLS Policies for chat tables
alter table public.chat_channels enable row level security;
alter table public.chat_messages enable row level security;

do $$
declare
  t text;
begin
  foreach t in array array['chat_channels', 'chat_messages']
  loop
    execute format('drop policy if exists %I on public.%I', t || ' read', t);
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.is_project_member(project_id))',
      t || ' read', t
    );

    execute format('drop policy if exists %I on public.%I', t || ' write', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_project_member(project_id)) with check (public.is_project_member(project_id))',
      t || ' write', t
    );
  end loop;
end;
$$;
