-- ---------------------------------------------------------------------------
-- 0019_ai_encryption_secret.sql
--
-- Fixes the same bug in 0014 that 0018 fixed for the email triggers.
--
-- save_user_ai_key and get_decrypted_user_ai_key both resolve their encryption
-- secret from current_setting('app.settings.encryption_secret'), falling back
-- to app.settings.jwt_secret. Neither can be relied on: setting either one
-- needs ALTER DATABASE ... SET, which Supabase refuses because the postgres
-- role is not a superuser. On a hosted project both functions therefore raise
-- 55000 and no AI key can be stored at all.
--
-- They now read through public.app_setting(), the security-definer accessor
-- 0018 introduced, under the key 'ai_encryption_secret'. app_settings has RLS
-- enabled with no policies and is revoked from anon and authenticated, so the
-- secret is reachable only from security-definer code and the service role.
--
-- If no secret has been provisioned, one is generated on first use and stored.
-- That makes the feature work without a deployment step. The trade-off is
-- real and worth stating: a self-generated secret lives in the same database
-- as the ciphertext, so it protects against a leaked table dump but not
-- against a full database compromise. Seed 'ai_encryption_secret' from your
-- own secret store to get the stronger property — the resolver below prefers
-- whatever is already there and never overwrites it.
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto with schema extensions;

/**
 * Returns the key-encryption secret, provisioning one if this is first use.
 *
 * Security definer and granted to nobody: only the two functions below, which
 * are themselves security definer, can reach it. Exposing this to a caller
 * would hand over every stored key.
 */
create or replace function public.ai_encryption_secret()
returns text
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_secret text;
begin
  -- Prefers an operator-provisioned value; app_setting() also covers the GUC,
  -- which still works on a local stack where ALTER DATABASE is permitted.
  v_secret := nullif(public.app_setting('ai_encryption_secret'), '');
  if v_secret is not null then
    return v_secret;
  end if;

  -- Legacy names, so a project that did manage to set a GUC keeps working and
  -- its existing ciphertext stays readable.
  v_secret := coalesce(
    nullif(current_setting('app.settings.encryption_secret', true), ''),
    nullif(current_setting('app.settings.jwt_secret', true), '')
  );
  if v_secret is not null then
    return v_secret;
  end if;

  -- First use: generate and store. ON CONFLICT DO NOTHING plus the re-read
  -- makes two concurrent callers agree on one secret rather than each writing
  -- its own and leaving the loser's ciphertext undecryptable.
  insert into public.app_settings (key, value, updated_at)
  values ('ai_encryption_secret', encode(extensions.gen_random_bytes(32), 'hex'), now())
  on conflict (key) do nothing;

  select s.value into v_secret
  from public.app_settings s
  where s.key = 'ai_encryption_secret';

  if v_secret is null or v_secret = '' then
    raise exception 'Could not provision an AI key encryption secret.' using errcode = '55000';
  end if;

  return v_secret;
end;
$$;

revoke all on function public.ai_encryption_secret() from public, anon, authenticated;

-- ---------------------------------------------------------------------------
-- Re-point the two 0014 functions at the resolver
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

  v_secret := public.ai_encryption_secret();

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

  v_secret := public.ai_encryption_secret();

  v_decrypted := pgp_sym_decrypt(dearmor(v_encrypted), v_secret);
  return v_decrypted;
end;
$$;

revoke all on function public.get_decrypted_user_ai_key(uuid, text) from public, authenticated, anon;
grant execute on function public.get_decrypted_user_ai_key(uuid, text) to service_role;
