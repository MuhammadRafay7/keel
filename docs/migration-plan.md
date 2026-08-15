# Migration plan

Moving Keel off Django onto Supabase, staged behind flags. A working app at every step — never a big-bang cutover.

## Why staged

Stripping Django, rebuilding the logic on Supabase, and restyling the UI simultaneously means nothing runs for months and no failure can be localized to a layer. Each phase below leaves the app working.

## Phase 0 — schema into Supabase ✅

Point Django's `DATABASE_URL` at Supabase's Postgres and run `manage.py migrate` once, from a throwaway container.

This uses Django as a **schema generator, not a server**. The output is the real table structure — constraints, foreign keys and indexes from 123 migrations across 30 model files — with no hand-translation. Hand-authoring that SQL would take weeks and every typo would become a subtle bug in the RLS policies built on top.

Django is not deployed and does not run again after this.

Settings notes for repeating it:
- Use the **session-mode pooler** (port 5432). Migrations are DDL and need a stable session; the transaction pooler (6543) misbehaves on them.
- The direct connection is IPv6-only; the pooler is the IPv4-safe route.
- Percent-encode special characters in the password (`@` → `%40`).
- `REDIS_URL` must be set for settings to import, but is never contacted during `migrate`.
- No Postgres extensions are required — all 123 migrations were scanned.

## Phase 1 — auth

Replace `apps/api/plane/authentication/` with Supabase Auth. The frontend currently uses cookie-session auth (`withCredentials: true` in `packages/services/src/api.service.ts`); this becomes Supabase's JWT session.

Django's `db.User` table and Supabase's `auth.users` live in different schemas, so they do not collide. A mapping between them is needed.

## Phase 2 — storage

Move file assets to Supabase Storage. Uploads go direct from browser to Storage. The affected services are the file/asset classes in `packages/services` plus the upload helpers in `apps/web/core/services/`.

## Phase 3 — RLS

Translate `apps/api/plane/app/permissions/` into RLS policies.

The highest-risk phase. Every policy needs a test asserting the *negative* case — that a member of workspace A cannot read workspace B. Do not move to Phase 4 on any table whose policies are untested.

## Phase 4 — the service classes

Re-implement the 55 classes in `packages/services` against `supabase-js`, **one domain at a time, each behind a feature flag that can be flipped back**.

Suggested order, lowest risk first:

1. `state`, `label` — small, read-heavy, few writers
2. `project`, `workspace`
3. `cycle`, `module`
4. `issue` — largest surface, most activity-log coupling
5. `intake`, `dashboard`, `ai`

Because every network call already funnels through this package, the rest of the frontend does not change.

## Phase 5 — collaborative editing

The unsolved one. See [architecture.md](./architecture.md#collaborative-editing). Start with a throwaway spike proving two browsers can co-edit through Supabase Realtime Broadcast before committing to the approach.

## Phase 6 — retire Django

Once no service points at it, remove `apps/api` from any build or compose config. Keep the source on disk as reference.

## Parallel track — UI restyle

Restyle only: a new visual language through `packages/ui` and `packages/propel`. Navigation, screens and flows stay as they are.

This runs alongside the backend work rather than after it, because the two touch almost entirely separate files — the service layer is the boundary between them.

## Status

| Phase | State |
| --- | --- |
| Rename to Keel | Done — 3,707 files, all 15 packages re-scoped, lockfile regenerated |
| 0 — schema | Migration run against Supabase |
| 1 — auth | Not started |
| 2 — storage | Not started |
| 3 — RLS | Not started |
| 4 — services | Not started |
| 5 — collaboration | Not started, needs spike |
| 6 — retire Django | Not started |
