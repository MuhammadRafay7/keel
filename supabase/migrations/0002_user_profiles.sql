-- Every user needs exactly one profile row. Django created it in Python on
-- signup; with Django out of the request path, the database has to do it
-- itself or onboarding has nothing to read.
--
-- Split from the auth trigger deliberately: this fires on public.users, so a
-- user created by any means (the auth bridge, a backfill, a seed script) ends
-- up with a profile rather than only those arriving through Supabase Auth.

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id, user_id, created_at, updated_at,
    theme, onboarding_step, mobile_onboarding_step, goals, product_tour,
    is_tour_completed, is_onboarded, is_mobile_onboarded,
    is_navigation_tour_completed, mobile_timezone_auto_set,
    is_smooth_cursor_enabled, is_app_rail_docked,
    has_billing_address, has_marketing_email_consent, is_subscribed_to_changelog,
    billing_address_country, company_name, language, background_color,
    notification_view_mode, start_of_the_week
  )
  values (
    gen_random_uuid(), new.id, now(), now(),
    '{}'::jsonb,
    '{"workspace_join": false, "profile_complete": false, "workspace_create": false, "workspace_invite": false}'::jsonb,
    '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
    false, false, false,
    false, false,
    false, false,
    false, false, false,
    '', '', 'en', '',
    'full', 0
  )
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_user_created_profile on public.users;
create trigger on_user_created_profile
  after insert on public.users
  for each row
  execute function public.handle_new_user_profile();

-- Backfill anyone who predates the trigger.
insert into public.profiles (
  id, user_id, created_at, updated_at,
  theme, onboarding_step, mobile_onboarding_step, goals, product_tour,
  is_tour_completed, is_onboarded, is_mobile_onboarded,
  is_navigation_tour_completed, mobile_timezone_auto_set,
  is_smooth_cursor_enabled, is_app_rail_docked,
  has_billing_address, has_marketing_email_consent, is_subscribed_to_changelog,
  billing_address_country, company_name, language, background_color,
  notification_view_mode, start_of_the_week
)
select
  gen_random_uuid(), u.id, now(), now(),
  '{}'::jsonb,
  '{"workspace_join": false, "profile_complete": false, "workspace_create": false, "workspace_invite": false}'::jsonb,
  '{}'::jsonb, '{}'::jsonb, '{}'::jsonb,
  false, false, false,
  false, false,
  false, false,
  false, false, false,
  '', '', 'en', '',
  'full', 0
from public.users u
where not exists (select 1 from public.profiles p where p.user_id = u.id);

-- A signed-in user reads and edits their own profile, and nothing else.
-- No insert policy: rows come from the trigger above, never from the client.
drop policy if exists "profiles read own" on public.profiles;
create policy "profiles read own"
  on public.profiles for select
  to authenticated
  using (user_id = auth.uid());

drop policy if exists "profiles update own" on public.profiles;
create policy "profiles update own"
  on public.profiles for update
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
