# Deploying the backend

The live Supabase project is **behind the repository**. Migrations `0001`–`0008`
are applied; `0009`–`0014` are not, and neither Edge Function is deployed. That
gap is what makes analytics, the activity feed, intake, estimates, cycle and
module progress, invitations and AI return 404 from PostgREST while the rest of
the app works.

Everything below was verified on 2026-08-15 by applying the SQL to a
`supabase/postgres:15.8.1.060` container holding the schema Django generates,
and by probing the live project with a real signed-in token.

## What is missing, and what each piece unblocks

| Migration | Contains                                                                           | Broken without it                                                 |
| --------- | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| `0009`    | activity triggers, `cycle_progress`, `module_progress`, `project_work_item_counts` | work item history is never written; cycle and module progress 404 |
| `0010`    | `project_role`, intake, estimates, project membership admin                        | intake, estimates, add/remove project members                     |
| `0011`    | `workspace_analytics`, `workspace_work_item_stats`                                 | the analytics dashboard                                           |
| `0012`    | RLS policies on `project_user_properties`                                          | per-user view preferences cannot be written                       |
| `0013`    | invitation send-status columns and the pg_net trigger                              | invitation email                                                  |
| `0014`    | `user_ai_keys`, `ai_call_log`, rate limiting                                       | anything AI — the tables do not exist                             |

`0001`–`0008` are already applied. Re-applying them is harmless — see the note
on re-runnability below — but they are not what this deploy is for.

## 1. Apply the migrations

This is automatic. `.github/workflows/supabase-deploy.yml` runs on every push to
`main` that touches `supabase/**`, and applies the migrations and both Edge
Functions. The one-time setup is in section 5.

To run it by hand instead — or the first time, to watch it happen:

```bash
supabase link --project-ref <project-ref>
supabase migration list --linked   # what the project thinks it has
supabase db push --include-all
```

`db push` applies whatever the project's migration history is missing. That
history is probably empty, because `0001`–`0008` were applied by hand, so the
first push will re-apply them. **That is safe**: every migration in this
repository is written to be re-runnable, and it was tested by applying all
fourteen six times over against a reproduced schema.

Keep it that way for anything added later. The trap is `create policy`: a
migration that supersedes an older policy has to drop _the name it creates_ as
well as the name it replaces, or the second run fails with
`policy "…" already exists`. `0004` and `0010` both had that bug.

`0014` needs `pgsodium` and `vault`, which hosted Supabase projects have.

`0019` supersedes `0014`'s key-encryption secret. `0014` read it from
`app.settings.encryption_secret`, which cannot be set on a hosted project for
the same reason `0018` had to move the email settings into a table — so on
Supabase, storing an AI key failed with `55000` every time. `0019` routes both
key functions through `public.ai_encryption_secret()`, which reads
`app_settings`, still honours the GUC on a local stack, and provisions a
secret on first use if neither is present. Nothing has to be configured for
the feature to work; see step 3 for the stronger option.

## 2. Point the invitation trigger at the project

`0013`'s trigger reads two database settings and falls back to
`http://127.0.0.1:54321` — the local default — when they are unset, so an
invitation would post the email request into nowhere:

```sql
alter database postgres set app.settings.supabase_url = 'https://<project-ref>.supabase.co';
alter database postgres set app.settings.supabase_anon_key = '<publishable key>';
```

## 3. Deploy the Edge Functions

The workflow does this too. By hand:

```bash
supabase functions deploy send-workspace-invite
supabase functions deploy ai-proxy
```

Set their secrets first — `SUPABASE_URL`, `SUPABASE_ANON_KEY` and
`SUPABASE_SERVICE_ROLE_KEY` are injected by the platform, the rest are not.
CI deliberately does not set these: they live in Supabase, not in the repository,
and a deploy should not be able to rotate them by accident.

```bash
supabase secrets set RESEND_API_KEY=<key> \
                     RESEND_FROM_EMAIL='Keel <invitations@your-domain>' \
                     APP_URL=https://app.keel.ostenmark.com
```

Without `RESEND_API_KEY` the invitation function deploys and then fails per
request, which is worse than not deploying it — set the secret in the same pass.

`ai-proxy` needs no provider secrets. Every model call is billed to the
caller's own key, which users add under Settings → AI provider and which is
stored encrypted; there is deliberately no server-side fallback key, so a
misconfigured deploy cannot quietly spend your money.

The one thing worth deciding is where the key-encryption secret comes from. By
default `0019` generates one and stores it in `app_settings`, which works
immediately but keeps the secret in the same database as the ciphertext. To
hold it outside the database instead, set it before anyone stores a key:

```sql
insert into public.app_settings (key, value, updated_at)
values ('ai_encryption_secret', '<32+ random bytes>', now())
on conflict (key) do nothing;
```

or add a `SUPABASE_AI_ENCRYPTION_SECRET` repository secret and let the workflow
seed it. Both use `on conflict do nothing`: once a key has been encrypted,
changing this value makes every stored key undecryptable, so rotation is a
deliberate manual operation and users have to re-enter their keys.

## 4. Confirm it took

Sign in as a normal user and check that these stop returning `404 PGRST202`:

```bash
curl -s -X POST "$SUPABASE_URL/rest/v1/rpc/workspace_analytics" \
  -H "apikey: $PUBLISHABLE_KEY" -H "Authorization: Bearer $USER_ACCESS_TOKEN" \
  -H 'Content-Type: application/json' -d '{"p_workspace_slug":"<slug>"}'
```

Then create a work item and confirm a row appears in `issue_activities` — that
is `0009`'s trigger, and it is the single best signal that the batch landed.

## 5. One-time setup for the automatic deploy

Three required repository secrets, under Settings → Secrets → Actions (the workflow uses
a `production` environment, so add them there if you want a required reviewer on
database changes):

| Secret                  | Where it comes from                          |
| ----------------------- | -------------------------------------------- |
| `SUPABASE_ACCESS_TOKEN` | `supabase login`, or Account → Access Tokens |
| `SUPABASE_DB_PASSWORD`  | Project Settings → Database                  |
| `SUPABASE_PROJECT_REF`  | the subdomain of your project URL            |

One optional fourth:

| Secret                          | Where it comes from                                              |
| ------------------------------- | ---------------------------------------------------------------- |
| `SUPABASE_AI_ENCRYPTION_SECRET` | your own secret store; omit to let `0019` generate and store one |

Rotate the database password first if it is still the one shared in a session
transcript — `TODO.md` lists that as outstanding.

### The ordering this assumes

Vercel builds the frontend on the same push, so the frontend deploy and the
database apply race each other. That is fine only while migrations stay
**additive** — new tables, new columns, new functions, policies that widen
access. Both orderings work then, because the old frontend does not know about
the new objects and the new frontend finds them already there.

A migration that drops or renames something the current frontend still reads
breaks that. Those need the usual two-step: ship the migration that adds the new
shape, deploy the frontend that uses it, and only then ship the migration that
removes the old one — in two separate merges. Phase 5 in `TODO.md` ("drop tables
the migrated application never reads") is exactly that kind of work.

## What this does not fix

The 243 service methods that still call Django (see `TODO.md`) stay broken
regardless: those endpoints have no backend at all. They now fail as requests
rather than crashing the page, but the features behind them — the profile pages'
statistics, workspace search, sticky notes, drafts — return nothing until they
are migrated.
