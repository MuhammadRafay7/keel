-- ---------------------------------------------------------------------------
-- 0021_user_ai_key_model.sql
--
-- Gives user_ai_keys somewhere to record which model a provider should use.
--
-- Until now the web app kept the chosen model in localStorage, because the row
-- had nowhere to put it. That made the preference per-browser: signing in on a
-- second machine silently fell back to the provider's default model, and the AI
-- proxy — which already accepts a `model` on its payload — had no server-side
-- value to read when the caller did not supply one.
--
-- The column is nullable on purpose. Null means "use the provider's default",
-- which is the correct behaviour for every row that exists before this runs.
-- ---------------------------------------------------------------------------

alter table public.user_ai_keys
  add column if not exists model text;

comment on column public.user_ai_keys.model is
  'Preferred model id for this provider. Null means use the provider default.';

-- ---------------------------------------------------------------------------
-- save_user_ai_key: now records the model alongside the key
--
-- The two-argument version is dropped rather than left in place. Postgres would
-- keep both overloads, and a two-argument call would then be ambiguous against
-- a three-argument function with a default — PostgREST resolves by argument
-- names, so the older signature would win for existing callers and silently
-- discard the model.
-- ---------------------------------------------------------------------------

drop function if exists public.save_user_ai_key(text, text);

create or replace function public.save_user_ai_key(
  p_provider text,
  p_api_key text,
  p_model text default null
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

  -- A non-sensitive display hint for the UI (e.g. "sk-...1234").
  if length(p_api_key) <= 8 then
    v_hint := '***';
  else
    v_hint := concat(substring(p_api_key from 1 for 3), '...', right(p_api_key, 4));
  end if;

  v_secret := public.ai_encryption_secret();
  v_encrypted := armor(pgp_sym_encrypt(p_api_key, v_secret));

  insert into public.user_ai_keys (
    id, created_at, updated_at, deleted_at, user_id, provider,
    encrypted_api_key, key_hint, is_active, model
  )
  values (
    gen_random_uuid(), now(), now(), null, v_user_id, lower(trim(p_provider)),
    v_encrypted, v_hint, true, nullif(trim(coalesce(p_model, '')), '')
  )
  on conflict (user_id, provider) where deleted_at is null
  do update set
    encrypted_api_key = excluded.encrypted_api_key,
    key_hint = excluded.key_hint,
    is_active = true,
    model = excluded.model,
    updated_at = now()
  returning * into v_row;

  return v_row;
end;
$$;

grant execute on function public.save_user_ai_key(text, text, text) to authenticated;

-- ---------------------------------------------------------------------------
-- set_user_ai_model: change the model without re-entering the key
--
-- Without this, switching model would mean pasting the API key again, because
-- save_user_ai_key requires one. The user already proved ownership when the key
-- was stored; asking for it again to change a dropdown is a poor trade.
-- ---------------------------------------------------------------------------

create or replace function public.set_user_ai_model(
  p_provider text,
  p_model text
)
returns public.user_ai_keys
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
  v_user_id uuid := auth.uid();
  v_row public.user_ai_keys;
begin
  if v_user_id is null then
    raise exception 'Not signed in.' using errcode = '28000';
  end if;

  update public.user_ai_keys
  set model = nullif(trim(coalesce(p_model, '')), ''),
      updated_at = now()
  where user_id = v_user_id
    and provider = lower(trim(p_provider))
    and deleted_at is null
  returning * into v_row;

  if v_row.id is null then
    raise exception 'No stored key for that provider.' using errcode = 'P0002';
  end if;

  return v_row;
end;
$$;

grant execute on function public.set_user_ai_model(text, text) to authenticated;
