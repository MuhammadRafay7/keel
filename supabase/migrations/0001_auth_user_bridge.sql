-- Phase 1: bridge Supabase Auth to the application's users table.
--
-- public.users.id and auth.users.id are both uuid, so the two share a primary
-- key rather than needing a mapping table. A user created through Supabase Auth
-- gets a matching application row with the same id.
--
-- Every NOT NULL column on public.users was created by Django without a database
-- default -- Django enforced them in application code. Since Django is gone, the
-- trigger must supply all of them.

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_email text := new.email;
  v_display text := coalesce(
    nullif(new.raw_user_meta_data ->> 'display_name', ''),
    split_part(coalesce(new.email, 'user'), '@', 1)
  );
begin
  insert into public.users (
    id, password, username, email, first_name, last_name, avatar,
    date_joined, created_at, updated_at,
    last_location, created_location,
    is_superuser, is_managed, is_password_expired, is_active, is_staff,
    is_email_verified, is_password_autoset,
    token, user_timezone,
    last_login_ip, last_logout_ip, last_login_medium, last_login_uagent,
    is_bot, display_name, is_email_valid, is_password_reset_required
  )
  values (
    new.id,
    '',                                    -- credentials live in auth.users, never mirrored
    v_email,                               -- username is unique; email satisfies it
    v_email,
    '', '', '',
    now(), now(), now(),
    '', '',
    false, false, false, true, false,
    new.email_confirmed_at is not null,
    true,                                  -- password is managed by Supabase Auth
    '', 'UTC',
    '', '', 'supabase', '',
    false, v_display, true, false
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_auth_user();

-- Keep email verification state in step with Supabase Auth.
create or replace function public.handle_auth_user_updated()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.users
     set is_email_verified = new.email_confirmed_at is not null,
         email             = coalesce(new.email, email),
         updated_at        = now()
   where id = new.id;
  return new;
end;
$$;

drop trigger if exists on_auth_user_updated on auth.users;

create trigger on_auth_user_updated
  after update on auth.users
  for each row
  execute function public.handle_auth_user_updated();

-- Minimal RLS so a signed-in user can read and edit their own profile.
-- Full policy work for every table is Phase 3; this covers Phase 1 only.
drop policy if exists "users read own row" on public.users;
create policy "users read own row"
  on public.users for select
  to authenticated
  using (id = auth.uid());

drop policy if exists "users update own row" on public.users;
create policy "users update own row"
  on public.users for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());
