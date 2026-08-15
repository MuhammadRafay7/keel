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

## Phase 2 — Core data 🔶

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
- [ ] Attachments — storage is ready (Phase 3); the issue_attachments service
      and UI wiring are not done
- [ ] Activity feed — needs database triggers to record changes; nothing writes
      to issue_activities yet, so the feed reads empty
- [ ] Analytics — aggregate counts (cycle and module progress currently return
      zero rather than a real figure)
- [ ] Intake — policies exist; the triage service and accept/decline flow do not
- [ ] Estimates and work item types
- [ ] Project members: invite, change role, remove
- [ ] Workspace invitations: send, accept, decline (needs email — see Missing)

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

## Phase 4 — Collaborative editing ❌

**This is the one piece that does not fit Vercel + Supabase.** Pages use
Hocuspocus and Yjs over a stateful WebSocket, holding each document in memory
and persisting on debounce. `apps/live` is a long-running server. Serverless
functions cannot hold that state, and Supabase has no Hocuspocus equivalent.

Options, in order of how much they preserve:

- [ ] **Yjs over Supabase Realtime Broadcast.** Peers exchange updates through a
      Supabase channel; a Postgres row holds the merged document. No server, but
      no server-side authority either — needs a spike to find out how it behaves
      with concurrent editors and reconnects.
- [ ] **Single-writer pages.** Drop real-time co-editing; keep documents with
      last-write-wins and a lock or presence indicator. Much simpler, and honest
      about what it is.
- [ ] **A small always-on host for `apps/live` only.** Solves it properly, but
      breaks the no-server constraint.

Decide before building. The first option is the only one that keeps the current
feature, and it is the one with real unknowns.

## Phase 5 — Retire Django ❌

- [ ] Confirm nothing imports from `apps/api`
- [ ] Delete `apps/api`, its Docker services and compose entries
- [ ] Remove `API_BASE_URL`, the axios base class and the SPA rewrite that made
      dead endpoints look successful
- [ ] Drop tables the migrated application never reads

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

# Phase 6 — New product surface

Requested after the migration was scoped. Ordered by dependency, not by wish.
Each carries the architectural catch that decides how it gets built.

## Themes (small, do early)

- [ ] Multiple themes beyond light/dark, in the style of Slack and ClickUp
- [ ] `profiles.theme` is already a jsonb column and `useTheme` already resolves
      a theme, so this is a palette and a picker, not new plumbing

## Chat and messaging

Supabase Realtime is genuinely good at this — it is the closest fit of anything
on this list. The work is product surface, not infrastructure.

- [ ] Channels, direct messages, threads
- [ ] Presence and typing indicators (Realtime Presence)
- [ ] Mentions, unread state, read receipts
- [ ] Message search, attachments, editing and deletion
- [ ] Link messages to work items — the reason to have chat *here* rather than
      in Slack

Scope honestly: this is comparable in size to the entire work-item slice.

## Push notifications

- [ ] Web Push: service worker, VAPID keys, subscription table
- [ ] Sending from an Edge Function, triggered by database events
- [ ] Notification preferences per user and per channel
- [ ] **iOS Safari only delivers Web Push to an installed PWA** — plan for the
      "Add to Home Screen" prompt, or accept no iOS notifications
- [ ] Native mobile push would need a native app, which does not exist

## AI with the user's own API key

**The rules can only be enforced server-side.** If the browser calls the
provider directly, the user can open devtools, read the prompt and call the
provider without it. Anything described as "our rules" therefore requires a
proxy, and that proxy is the feature.

- [ ] Edge Function proxy: system prompt, tool allow-list, limits applied there
- [ ] Keys stored encrypted (Vault/pgsodium), never returned to the client,
      never in the bundle
- [ ] Per-user rate limits and spend caps — a stolen key is the user's money
- [ ] Provider adapters (Anthropic, OpenAI, others), model allow-list
- [ ] Audit log of AI calls
- [ ] Streaming responses through the proxy

## Attendance

- [ ] Decide what this is: clock in/out and leave (an HR product), or time
      tracked against work items (`projects.is_time_tracking_enabled` already
      exists in the schema). They are different builds.
- [ ] Records, corrections, approvals
- [ ] Reports and export
- [ ] Holiday and leave calendar

## MCP integrations

The hard one. MCP servers over stdio are processes; Vercel cannot run them.

- [ ] Remote MCP (Streamable HTTP) via Edge Functions — the only shape that fits
      the hosting constraint
- [ ] OAuth token storage per user per integration, encrypted
- [ ] A permission model for what an integration may read and write
- [ ] Decide whether arbitrary user-supplied MCP servers are allowed, or a
      curated catalogue. Arbitrary servers on serverless is an open problem.

## Admin dashboard

`apps/admin` exists but is **not what this probably means** — see the note in
the session summary. It is an instance-configuration panel for self-hosting,
it is not deployed anywhere, and it authenticates against Django endpoints that
no longer exist.

- [ ] Decide: revive it, or build a real operations dashboard
- [ ] Users, workspaces, usage, AI spend, attendance reports
- [ ] Admin identity — `users.is_superuser` exists; needs its own RLS treatment

## Marketing site

- [ ] New layout and visual direction (needs art direction to start)

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
