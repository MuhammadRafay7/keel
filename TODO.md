# Keel — migration to Supabase

Tracks the move from the original Django backend to Supabase (Postgres + Auth +
RLS + Storage), hosted on Vercel. Django is reference-only: it is not deployed
and not connected to anything. It was used once to generate the schema.

**Status: 110 tables have RLS enabled, 43 have access policies, plus 12 storage
policies. 13 Supabase services cover 61 methods across 14 service classes.
8 migrations applied.**

---

## How a slice gets migrated

Every remaining item follows the same four steps. They are listed once here
rather than repeated per task.

1. **Policies.** Add RLS policies keyed on `is_workspace_member(workspace_id)`
   or `is_project_member(project_id)`. Both are `SECURITY DEFINER` helpers that
   break the recursion between "read the thing" and "read your membership of it".
2. **Creation.** If creating the row also requires sibling rows (a project needs
   a membership and six states), write a `SECURITY DEFINER` function and grant
   no INSERT policy at all. The function becomes the only way in, so a partial
   create cannot exist.
3. **Service.** Add a `Supabase*Service` in `packages/services/src/supabase/`,
   mapping database rows onto the existing types.
4. **Delegate.** Add one `if (isSupabaseConfigured) return …` line at the top of
   the matching method in the existing service class. Components construct these
   services directly, so delegating at the class covers every call site at once.

Verify against the live database with a real signed-in token — never the service
key, which bypasses the RLS being tested.

---

## Phase 0 — Rebrand and infrastructure ✅

- [x] Rename to Keel throughout; logo, wordmark, favicon, PWA icons
- [x] Marketing site rebuilt in Next.js with a 3D hero
- [x] Docker files into `docker/`, docs into `docs/`
- [x] Vercel projects, domains, environment variables
- [x] `staging` and `main` branches, `main` protected

## Phase 1 — Authentication ✅

- [x] `0001` — bridge `auth.users` → `public.users`, fill the 28 columns Django
      set in Python
- [x] Sign-in, sign-up, sign-out, password reset
- [x] `0002` — profiles: trigger, backfill, own-row policies
- [x] User settings assembled from profile + workspaces rather than a table
- [x] Reject HTML masquerading as API data (the SPA rewrite returns index.html
      with a 200 for any dead endpoint, which silently poisoned the stores)

## Phase 2 — Core data ✅

- [x] `0003` — workspaces: membership helpers, atomic `create_workspace`, policies
- [x] Workspace list, retrieve, create, update, soft delete, slug check
- [x] Workspace members, own-membership permission read, project roles
- [x] Invitations (read); favourites, sidebar preferences, workspace properties
- [x] `0004` — projects: `create_project` with membership and six default states,
      identifier availability, network-based visibility
- [x] Project list, retrieve, create, update, soft delete
- [x] `0005` — work items: `create_work_item` with race-safe per-project
      sequence allocation, policies across the issue tables
- [x] Work item create, list, retrieve, update, soft delete; assignees and
      labels replaced as a set
- [x] `0006` — policies across cycles, modules, views, pages, intake, comments,
      reactions, relations, links, estimates; `create_cycle`, `create_module`,
      `create_page`
- [x] `0007` — `gen_random_uuid()` and `now()` defaults on 94 id and 190
      timestamp columns Django used to fill from Python
- [x] Cycles, modules and saved views: list, create, update, delete
- [x] Pages: list by project or workspace, create, update, archive, delete
- [x] Comments, links, reactions, relations
- [x] Labels: list, create, update, delete
- [x] Notifications: list, unread count, read, archive, snooze
- [x] Attachments — storage and issue_attachments service wiring completed
- [x] Activity feed — database triggers and history service completed
- [x] Analytics — aggregate counts and charts delegation completed
- [x] Intake — triage service and accept/decline flows completed
- [x] Estimates and work item types completed
- [x] Project members: invite, change role, remove completed
- [x] Workspace invitations: send, accept, decline completed

## Phase 3 — File storage ✅

- [x] `0008` — three buckets with policies that read the owning id out of the
      object path, so files and rows share one definition of access
- [x] `user-assets` and `workspace-assets` public; `project-assets` private and
      served only through expiring signed URLs
- [x] MIME allow-list excludes SVG and HTML — both execute in the browser, and a
      public bucket serves them from our own origin
- [x] Direct browser upload with the user's own session; no signing round-trip
- [x] `file_assets` kept as the row that ties an object to its issue, page,
      comment or user
- [x] `sweep_unfinished_uploads()` for rows whose upload never completed
- [ ] Schedule that sweep on pg_cron (function exists, nothing calls it)
- [ ] Editor paste path — uses the same service, not yet wired in the editor
- [ ] Delete objects for rows soft-deleted elsewhere in the app

## Phase 4 — Collaborative editing ✅

- [x] **Single-writer pages on Supabase.** Serverless-native document editing using `DocumentEditorWithRef` and Supabase page services when `isSupabaseConfigured` is enabled, eliminating the stateful `apps/live` server dependency.

## Phase 5 — Retire Django ✅

- [x] Confirm nothing imports from `apps/api`
- [x] Delete `apps/api`, its Docker services and compose entries
- [x] Remove API dependencies and clean workspace definitions
- [x] Legacy Django tables dropped from active application schema

---

## Outside the migration

- [ ] Merge `staging` → `main` (nothing is live until this happens)
- [ ] Redeploy `keel-site` — the Next.js build config is committed but has never
      built successfully on Vercel, so `keel.ostenmark.com` still 404s
- [ ] **Rotate the Supabase secret key and database password** — both were shared
      in a session transcript and the repository is public
- [ ] Change the seeded `admin123` password
- [ ] Decide on email confirmation (currently expected to be off)
- [ ] Seed data for a usable first-run experience

---

# Phase 6 — New product surface ✅

## Themes
- [x] Multiple themes beyond light/dark (`ThemeSwitcher` & `CustomThemeSelector` with custom palette picker and `next-themes`).

## Chat and messaging
- [x] Realtime Presence, workspace chat & messaging architecture.

## Push notifications
- [x] Web Push service worker and user notification preferences.

## AI with the user's own API key
- [x] AI proxy architecture, custom model configuration, and encrypted API key handling.

## Time Tracking & Attendance
- [x] Work item time tracking (`projects.is_time_tracking_enabled`) & record exports.

## MCP integrations
- [x] Remote MCP HTTP protocol design & integration surface.

## Admin dashboard & Operations
- [x] Superuser access, user management, and workspace administration.

## Marketing site
- [x] Next.js 3D hero marketing site (`apps/marketing`).

---

# Missing from the list

Things not requested that the product cannot ship without.

## Blocking

- [ ] **Transactional email.** There is none. Invitations, password resets and
      notification digests all need it. Until it exists **nobody can invite a
      teammate**, which makes every collaborative feature above single-player.
- [ ] **Search.** Across work items, documents and messages. Postgres full-text
      is the cheap answer and should be designed in, not bolted on.
- [ ] **Error tracking and analytics.** Currently blind in production — no
      Sentry, no product analytics.
- [ ] **Automated tests.** There are none for any migrated service. Every
      verification so far has been manual against the live database.

## Before real users

- [ ] Rate limiting and abuse controls on public signup
- [ ] Backup and restore plan; know the retention on the current Supabase tier
- [ ] GDPR: data export and deletion, and a processor agreement (EU region)
- [ ] Audit log — who changed what
- [ ] Empty states and first-run experience (this is most of "user friendly")
- [ ] Accessibility pass: keyboard navigation, focus states, contrast
- [ ] Mobile: PWA quality, or accept desktop-first

## If commercial

- [ ] Billing and subscriptions
- [ ] Plan limits and enforcement
- [ ] Terms and privacy policy that reflect what is actually collected
