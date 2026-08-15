# Architecture

Keel runs on **Vercel and Supabase only**. There is no VPS, no always-on server, and no third host. Every design decision below follows from that constraint.

## Target shape

| Piece                                  | Runs on                                    | Notes                                                                                                                                           |
| -------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/web`, `apps/admin`, `apps/space` | Vercel                                     | Static SPA builds. `react-router.config.ts` sets `ssr: false`, so these are client-only bundles — no serverless functions needed to serve them. |
| Postgres, Auth, Storage, RLS, Realtime | Supabase                                   | The database _is_ Supabase. Managed, nothing to patch.                                                                                          |
| API logic                              | Supabase Edge Functions                    | Deno. Covers what PostgREST's generated CRUD can't.                                                                                             |
| Scheduled + queued work                | Supabase Cron (`pg_cron`), Queues (`pgmq`) | Replaces Celery Beat.                                                                                                                           |
| PDF export                             | Vercel serverless function                 | Uses `sharp`, not headless Chrome, so it ports cleanly.                                                                                         |
| `apps/api` (Django)                    | **Nowhere**                                | Reference-only. See below.                                                                                                                      |
| `apps/live` (Hocuspocus)               | **Unsolved**                               | See [Collaborative editing](#collaborative-editing).                                                                                            |

## Why the frontend barely changes

Every network call funnels through `packages/services` — 55 service classes, all extending one base `api.service.ts`. Only nine files outside that package touch the network, and they are mostly file-upload and timezone helpers.

That package is the seam. Re-implement those classes against `supabase-js` and the rest of the frontend does not need to know Django is gone. It also means the UI restyle and the backend swap touch almost entirely separate files and can proceed in parallel.

## What replaces the background jobs

Django ran 34 Celery tasks in `apps/api/plane/bgtasks/`. None of them need a worker process:

| Was                                                              | Becomes                                                                                     |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| `issue_activities_task`, `notification_task`, title sync         | Postgres triggers — fire in-transaction, nothing to miss                                    |
| `webhook_task`                                                   | Database Webhooks / `pg_net` from the trigger                                               |
| Auth email, invitations, magic links                             | Supabase Auth sends auth mail natively; the rest via Edge Function → transactional mail API |
| `cleanup_task`, `exporter_expired_task`, `storage_metadata_task` | Supabase Cron (`pg_cron`)                                                                   |
| `export_task`, `analytic_plot_export`                            | Supabase Queues (`pgmq`) + Cron-driven Edge Function, chunked, output to Storage            |
| `page_version_task`, `issue_description_version_*`               | Triggers writing version rows                                                               |

## Permissions

`apps/api/plane/app/permissions/` holds the workspace, project and page permission classes. These become **RLS policies**.

This is the highest-risk part of the migration. A wrong policy is not a bug you notice in QA — it is one workspace reading another's data. Every policy needs a test that asserts the negative case.

## Collaborative editing

**This is the one unsolved problem.**

`apps/live` runs Hocuspocus, a _stateful_ WebSocket server: it holds each Yjs document in memory, merges CRDT updates from connected clients, broadcasts to peers, and debounce-persists. Vercel serverless cannot hold WebSocket connections and Supabase Edge Functions are request-scoped. Neither can host it, and no configuration flag changes that.

The planned answer is to drop the authoritative server and let Yjs be peer-to-peer, since Yjs needs a message relay rather than a smart server:

- **Transport** — Supabase Realtime Broadcast, one private channel per page, authorized through RLS so page permissions still hold.
- **Presence** — Supabase Realtime Presence for cursors.
- **Persistence** — the column already exists. `Page.description_binary` is a `BinaryField` holding the encoded Yjs document; it becomes a `bytea`. An Edge Function does read → merge incoming update → write back, keeping merge authority server-side without a persistent server.

The frontend dependency is narrow: one `HocuspocusProvider` in `apps/web/core/components/pages/editor/editor-body.tsx`.

**Known risks.** Without a server holding the document, persistence depends on a client completing the write — mitigated by writing on interval, on `visibilitychange`, and on unload, with CRDT merge making late writes safe rather than destructive. Concurrent saves must go through the merge path, never a naive overwrite.

**This is not proven.** It needs a throwaway spike showing two browsers co-editing through Supabase Realtime before it is treated as settled. Fallbacks: single-writer autosave with an "someone else is editing" warning, or a managed CRDT vendor.

## Django is reference-only

`apps/api/` stays on disk and is not deleted. It is the specification for business logic and permissions — 233 URL patterns across 60 view files, and the 123 migrations that define the schema. Read it constantly; deploy it never.

Its one active use was generating the schema: pointing `DATABASE_URL` at Supabase and running `manage.py migrate` produced the real table structure with no hand-translation. See [migration-plan.md](./migration-plan.md).

## Licensing

Keel is licensed **AGPL-3.0-only**.

Two obligations follow from that:

1. **Source-file copyright headers and `LICENSE.txt` stay as they are.** Those notices are not ours to remove — they belong to the original authors of that code, and stripping them is copyright infringement regardless of how the product is branded. Add your own copyright alongside for new work.
2. **AGPL §13 applies.** Serving Keel over a network obliges us to offer users the complete source of this modified version. The public site links to the repository, which satisfies it as long as the repository stays public.
