-- Phase 6: User AI provider API key storage, security helpers, rate limiting, and audit logging.

create extension if not exists pgcrypto with schema extensions;

create table if not exists public.user_ai_keys (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null,
  encrypted_api_key text not null,
  key_hint text not null,
  is_active boolean not null default true
);

-- Ensure a user has at most one active key per provider.
create unique index if not exists idx_user_ai_keys_user_provider
  on public.user_ai_keys (user_id, provider)
  where deleted_at is null;

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------

alter table public.user_ai_keys enable row level security;

-- Users can read their own active key status rows (key_hint, provider, is_active).
drop policy if exists user_ai_keys_owner_select on public.user_ai_keys;
create policy user_ai_keys_owner_select on public.user_ai_keys
  for select
  using (user_id = auth.uid() and deleted_at is null);

-- Key owners can update their own rows (for soft deletion or toggling active status).
drop policy if exists user_ai_keys_owner_update on public.user_ai_keys;
create policy user_ai_keys_owner_update on public.user_ai_keys
  for update
  to authenticated
  using (user_id = auth.uid() and deleted_at is null)
  with check (user_id = auth.uid());

-- Key owners can delete their own rows if hard delete is requested.
drop policy if exists user_ai_keys_owner_delete on public.user_ai_keys;
create policy user_ai_keys_owner_delete on public.user_ai_keys
  for delete
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- Key Encryption & Storage Function
-- ---------------------------------------------------------------------------

create or replace function public.save_user_ai_key(
  p_provider text,
  p_api_key text
)
returns public.user_ai_keys
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_hint text;
  v_secret text;
  v_encrypted text;
  v_row public.user_ai_keys;
begin
  if v_user_id is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  if p_provider is null or length(trim(p_provider)) = 0 then
    raise exception 'Provider is required.' using errcode = '22023';
  end if;

  if p_api_key is null or length(trim(p_api_key)) = 0 then
    raise exception 'API key is required.' using errcode = '22023';
  end if;

  -- Generate a non-sensitive display hint for UI (e.g., "sk-...1234")
  if length(p_api_key) <= 8 then
    v_hint := '***';
  else
    v_hint := concat(substring(p_api_key from 1 for 3), '...', right(p_api_key, 4));
  end if;

  v_secret := coalesce(
    nullif(current_setting('app.settings.encryption_secret', true), ''),
    nullif(current_setting('app.settings.jwt_secret', true), '')
  );

  if v_secret is null or length(trim(v_secret)) = 0 then
    raise exception 'AI key encryption secret is not configured in app.settings.encryption_secret or app.settings.jwt_secret.' using errcode = '55000';
  end if;

  v_encrypted := armor(pgp_sym_encrypt(p_api_key, v_secret));

  insert into public.user_ai_keys (
    id, created_at, updated_at, deleted_at, user_id, provider,
    encrypted_api_key, key_hint, is_active
  )
  values (
    gen_random_uuid(), now(), now(), null, v_user_id, lower(trim(p_provider)),
    v_encrypted, v_hint, true
  )
  on conflict (user_id, provider) where deleted_at is null
  do update set
    encrypted_api_key = excluded.encrypted_api_key,
    key_hint = excluded.key_hint,
    is_active = true,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.save_user_ai_key(text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- Server-Side Decryption Helper (Used ONLY by Edge Functions via Service Role)
-- ---------------------------------------------------------------------------

create or replace function public.get_decrypted_user_ai_key(
  p_user_id uuid,
  p_provider text
)
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_encrypted text;
  v_secret text;
  v_decrypted text;
begin
  -- Security check: FAIL CLOSED. Caller must be service_role context or the key owner.
  if current_setting('role', true) <> 'service_role' and (auth.uid() is null or auth.uid() <> p_user_id) then
    raise exception 'Permission denied.' using errcode = '42501';
  end if;

  select k.encrypted_api_key into v_encrypted
  from public.user_ai_keys k
  where k.user_id = p_user_id
    and k.provider = lower(trim(p_provider))
    and k.is_active = true
    and k.deleted_at is null
  limit 1;

  if v_encrypted is null then
    return null;
  end if;

  v_secret := coalesce(
    nullif(current_setting('app.settings.encryption_secret', true), ''),
    nullif(current_setting('app.settings.jwt_secret', true), '')
  );

  if v_secret is null or length(trim(v_secret)) = 0 then
    raise exception 'AI key encryption secret is not configured in app.settings.encryption_secret or app.settings.jwt_secret.' using errcode = '55000';
  end if;

  v_decrypted := pgp_sym_decrypt(dearmor(v_encrypted), v_secret);
  return v_decrypted;
end;
$$;

revoke all on function public.get_decrypted_user_ai_key(uuid, text) from public, authenticated, anon;
grant execute on function public.get_decrypted_user_ai_key(uuid, text) to service_role;

-- ---------------------------------------------------------------------------
-- Persistent Rate Limiting Table & Function
-- ---------------------------------------------------------------------------

create table if not exists public.user_ai_rate_limits (
  user_id uuid primary key references public.users(id) on delete cascade,
  request_count integer not null default 1,
  window_start timestamptz not null default now()
);

alter table public.user_ai_rate_limits enable row level security;

create or replace function public.check_ai_rate_limit(
  p_user_id uuid,
  p_max_requests integer default 20,
  p_window_seconds integer default 60
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_now timestamptz := now();
  v_row public.user_ai_rate_limits;
begin
  select * into v_row
  from public.user_ai_rate_limits
  where user_id = p_user_id
  for update;

  if not found or (v_now - v_row.window_start) > (p_window_seconds || ' seconds')::interval then
    insert into public.user_ai_rate_limits (user_id, request_count, window_start)
    values (p_user_id, 1, v_now)
    on conflict (user_id) do update
    set request_count = 1, window_start = v_now;

    return jsonb_build_object('allowed', true, 'remaining', p_max_requests - 1);
  end if;

  if v_row.request_count >= p_max_requests then
    return jsonb_build_object('allowed', false, 'remaining', 0);
  end if;

  update public.user_ai_rate_limits
  set request_count = request_count + 1
  where user_id = p_user_id;

  return jsonb_build_object('allowed', true, 'remaining', p_max_requests - (v_row.request_count + 1));
end;
$$;

grant execute on function public.check_ai_rate_limit(uuid, integer, integer) to authenticated, service_role;

-- ---------------------------------------------------------------------------
-- Audit & Usage Logging
-- ---------------------------------------------------------------------------

create table if not exists public.ai_usage_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.users(id) on delete cascade,
  provider text not null,
  model text not null,
  prompt_tokens integer default 0,
  completion_tokens integer default 0
);

alter table public.ai_usage_logs enable row level security;

drop policy if exists ai_usage_logs_owner_select on public.ai_usage_logs;
create policy ai_usage_logs_owner_select on public.ai_usage_logs
  for select to authenticated
  using (user_id = auth.uid());
