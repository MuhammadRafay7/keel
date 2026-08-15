# Keel — migration to Supabase

Tracks the move from the original Django backend to Supabase (Postgres + Auth +
RLS + Storage), hosted on Vercel. Django is reference-only: it is not deployed
and not connected to anything. It was used once to generate the schema.

## Status at a glance

| Phase                          | State                                     | Note                                                        |
| ------------------------------ | ----------------------------------------- | ----------------------------------------------------------- |
| 0 — Rebrand and infrastructure | ✅ done                                   |                                                             |
| 1 — Authentication             | ✅ done                                   |                                                             |
| 2 — Core data                  | 🔶 nearly                                 | analytics **charts** and invitation delivery open           |
| 3 — File storage               | 🔶 mostly                                 | 3 items open (sweep schedule, editor paste, orphan objects) |
| 4 — Collaborative editing      | 🔶 done as single-writer                  | no real-time co-editing; concurrent editors overwrite       |
| 5 — Retire Django              | ⏸️ **on hold — nothing is being deleted** | audit done, see below                                       |
| 6 — New product surface        | ❌ not started                            | marketing site only                                         |

**11 migrations; 20 Supabase services; 97 of 340 web service methods (29%) have
a Supabase path.**

That 29% is the number to watch. The phases above track _features_, and the
primary path of each is migrated — but a great deal of secondary surface still
calls Django. The inventory is at the bottom under "What still calls Django".

### Two things gate everything else

1. **None of the SQL in `0009`–`0011` has ever run.** It was written from the
   Django models by reading, so column names, constraint predicates and
   `on conflict` targets are inference, not fact. Verifying it against the live
   database with a real signed-in token is the highest-value work available, and
   nothing further should be built on top of it until that happens.
2. **Transactional email does not exist.** It blocks workspace invitations,
   which makes every collaborative feature single-player.

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
- [x] Attachments — `file_assets` rows plus signed URLs, wired to the issue
      attachment service
- [x] Activity feed — `0009` triggers write `issue_activities`; the client has no
      INSERT policy, so history cannot be forged
- [x] Intake — `create_intake_work_item` and `update_intake_status` (accept,
      decline, snooze, duplicate)
- [x] Estimates and work item types — `create_estimate` writes the scale and its
      points together; type policies split workspace-define from project-enable
- [x] Project members: add, change role, remove (`add_project_members`,
      `remove_project_member`, both admin-gated)
- [x] Cycle and module progress — `cycle_progress` / `module_progress`, counted
      by state group in one call per project
- [x] Analytics dashboard — `0011` adds `workspace_analytics` (the card row, one
      call for both tabs) and `workspace_work_item_stats` (the per-project
      table). Both run as the caller, so RLS scopes the counts.
- [ ] Analytics **charts** — not migrated. They cross every x-axis property with
      every y-axis metric, which is an aggregation layer rather than one more
      count. `getAdvanceAnalyticsCharts` throws a clear error on the Supabase
      path rather than returning an empty series that would look like real data.
- [ ] **Workspace invitations** — rows, tokens, accept and decline all work, but
      nothing is sent. Until transactional email exists (see Blocking) the
      inviter has to pass the link on by hand, so this is not shippable.

## Phase 3 — File storage 🔶

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

## Phase 4 — Collaborative editing 🔶

The second option was taken: **single-writer pages**, no real-time co-editing.
Real-time was not attempted, so `apps/live` is bypassed rather than replaced.

- [x] `DocumentEditorWithRef` behind `isSupabaseConfigured`, in place of the
      Hocuspocus-backed collaborative editor
- [x] Load: the page body is passed as `value`, captured once per page so the
      optimistic write-back cannot re-set content under the caret
- [x] Save: debounced `onChange` → `pages.description_html` / `description_json`,
      flushed on unmount so closing a page does not drop the last edit
- [x] Sync indicator reflects the save rather than a socket that is not there
- [ ] Concurrent editors silently overwrite each other — last write wins, with no
      lock and no presence indicator. This is the honest cost of the option and
      it is not yet surfaced to the user.
- [ ] `apps/live` still exists and still builds; it is simply unused on this path

## Phase 5 — Retire Django ⏸️ on hold

**Decision: nothing is being deleted for now.** That is the right order. Two
reasons, and both have to clear before deletion is safe:

1. `apps/api` is the only record of the schema, and `0009`–`0011` were written
   by reading those models. Until that SQL has actually run, `apps/api` is what
   you check against when something turns out to be wrong. Deleting it first
   removes exactly the reference the unverified work depends on.
2. The app still needs the axios layer. 243 of 340 service methods route to
   Django, covering features that work today. Removing `API_BASE_URL` now
   breaks them.

- [x] Confirm what still depends on Django — done, inventory below
- [ ] Verify `0009`–`0011` against the live database _(gate for everything else)_
- [ ] Migrate the remaining 243 methods, or consciously drop the features
- [ ] Delete `apps/api`, its Docker services and compose entries —
      `docker-compose-local.yml` and `docker-compose-test.yml` still build it
- [ ] Remove `API_BASE_URL` (90 references), the axios base class (46 subclasses)
      and the SPA rewrite that made dead endpoints look successful
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

# Phase 6 — New product surface ❌

Not started, other than the marketing site. A repo-wide search finds no code for
any of it: no `VAPID` or service worker, no MCP, no AI proxy, no Realtime channel
or presence, no attendance or time tracking. There is no `supabase/functions`
directory at all — and by the analysis below, the AI proxy and MCP both require
Edge Functions before anything else can be built.

Ordered by dependency, not by wish. Each carries the architectural catch that
decides how it gets built.

## Themes (small, do early)

- [ ] Multiple themes beyond light/dark, in the style of Slack and ClickUp
- [ ] `profiles.theme` is already a jsonb column and `useTheme` already resolves
      a theme, so this is a palette and a picker, not new plumbing. The existing
      `ThemeSwitcher` / `CustomThemeSelector` are upstream components, not this.

## Chat and messaging

Supabase Realtime is genuinely good at this — it is the closest fit of anything
on this list. The work is product surface, not infrastructure.

- [ ] Channels, direct messages, threads
- [ ] Presence and typing indicators (Realtime Presence)
- [ ] Mentions, unread state, read receipts
- [ ] Message search, attachments, editing and deletion
- [ ] Link messages to work items — the reason to have chat _here_ rather than
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
- [ ] Provider adapters, model allow-list
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
      curated catalogue

## Admin dashboard

`apps/admin` exists but is **not what this probably means**: it is an
instance-configuration panel for self-hosting, it is not deployed, and it
authenticates against Django endpoints that no longer exist.

- [ ] Decide: revive it, or build a real operations dashboard
- [ ] Users, workspaces, usage, AI spend, attendance reports
- [ ] Admin identity — `users.is_superuser` exists; needs its own RLS treatment

## Marketing site

- [x] Next.js marketing site with a 3D hero (`apps/marketing`)
- [ ] It has never built successfully on Vercel — see "Outside the migration"

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

---

# What still calls Django

Generated by counting `if (isSupabaseConfigured)` guards against method counts in
`apps/web/core/services`. **97 of 340 methods (29%) have a Supabase path.**

This is the real remaining scope of the migration. The phase checklists above
cover the primary path of each feature; this covers everything.

## Fully migrated (6 services)

`estimate` · `inbox/inbox-issue` · `issue/issue_activity` ·
`issue/issue_attachment` · `issue/issue_comment` · `project/project-member`

## Partially migrated (14 services, 153 methods still on Django)

| Service                          | Migrated | Still Django                                                                                        |
| -------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| `issue/issue.service`            | 4/33     | list/sync variants, cycle & module assignment, relations, sub-items, links, bulk ops, subscriptions |
| `user.service`                   | 1/26     | profile, onboarding, email settings, password, activity, join/leave                                 |
| `workspace.service`              | 21/42    | workspace views, links, search, recents, widgets, sidebar prefs                                     |
| `file.service`                   | 3/16     | deletes, restores, bulk upload status, unsplash, duplicate                                          |
| `module.service`                 | 5/17     | workspace modules, issue assignment, links, favourites                                              |
| `page/project-page.service`      | 6/18     | access, favourites, archive/restore, lock, duplicate, move                                          |
| `cycle.service`                  | 5/15     | active-cycle analytics, cycle issues, transfer, favourites                                          |
| `project/project.service`        | 7/17     | user properties, github sync, favourites, search                                                    |
| `project/project-state.service`  | 1/9      | everything but the list                                                                             |
| `favorite/favorite.service`      | 1/5      |                                                                                                     |
| `workspace-notification.service` | 4/8      |                                                                                                     |
| `view.service`                   | 5/8      |                                                                                                     |
| `issue/issue_label.service`      | 4/5      |                                                                                                     |
| `analytics.service`              | 3/4      | charts only                                                                                         |

## Not migrated at all (26 services, 90 methods)

**Probably needed:** `issue/issue_reaction` · `issue/issue_relation` ·
`issue_filter` · `issue/issue_archive` · `cycle_archive` · `module_archive` ·
`project/project-archive` · `page/project-page-version` ·
`issue/work_item_version` · `inbox/intake-work_item_version` · `sticky` ·
`dashboard` · `issue/workspace_draft` · `project/project-export`

**Needs a product decision first:** `ai` (Phase 6 proxy) · `webhook` ·
`integrations/integration` · `integrations/github` · `integrations/jira` ·
`app_installation` · `project/project-publish`

**Instance/self-hosting, likely obsolete under Vercel + Supabase:**
`instance` · `app_config` · `auth` (superseded by `SupabaseAuthService`) ·
`timezone` · `file-upload` (superseded by direct-to-storage upload)

## How to read this

A method with no Supabase path calls a Django endpoint that is not deployed. The
SPA rewrite returns `index.html` with a 200 for those, which the Phase 1 guard
now rejects — so they surface as errors rather than silently poisoning a store.
Loud failure is the current behaviour and it is the correct one; it is not the
same as the feature working.
