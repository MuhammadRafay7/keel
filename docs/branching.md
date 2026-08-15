# Branching and deploys

Two long-lived branches. Everything reaches production through a pull request.

```
feature/*  ──PR──▶  staging  ──PR──▶  main
                      │                 │
                      ▼                 ▼
              staging deploy      production
                                keel.ostenmark.com
```

## The branches

| Branch | Role | Deploys to | Protected |
| --- | --- | --- | --- |
| `main` | Production. Release-only. | `keel.ostenmark.com` | Yes — PR required, no direct pushes |
| `staging` | Integration. Everything lands here first. | staging domain | No — PRs merge freely |
| `feature/*` | Individual work | Vercel preview per PR | No |

Work is never committed directly to `main`. A change proves itself on staging, then a PR promotes it.

## Branch naming

Follow the existing repo convention — see the `branch-name` skill in `.claude/skills/`:

```
<type>/<work-item-id>-<short-description>
```

The work item ID matters: the `create-pull-request` skill extracts it to prefix the PR title.

## Protection rules for `main`

Apply these on GitHub under **Settings → Branches → Add rule**, or as a ruleset:

- Require a pull request before merging
- Require status checks to pass, and require branches to be up to date first
- Dismiss stale approvals when new commits are pushed
- Block force pushes
- Block deletion

The status checks worth requiring are the workflows already in `.github/workflows/`:

- `pull-request-build-lint-web-apps.yml`
- `check-version.yml`
- `codeql.yml`

Note that branch protection on **private** repos requires a paid GitHub plan; public repos get it free. Rulesets are the newer mechanism and are worth preferring over classic protection rules.

Applied via CLI:

```bash
gh api -X PUT repos/:owner/:repo/branches/main/protection \
  --input protection.json
```

## Vercel wiring

Vercel deploys from git, so the branch model drives the environments:

- **Production Branch** → `main`. This is the only branch that serves `keel.ostenmark.com`.
- **Preview Deployments** → enabled for `staging` and all feature branches.
- Assign a stable staging domain to the `staging` branch so it is a fixed target rather than a rotating preview URL.

Three apps deploy from this monorepo (`apps/web`, `apps/admin`, `apps/space`), so each needs its own Vercel project pointing at the same repo with a different root directory and build command.

## Environment variables

Set per-environment in Vercel, never committed:

| Variable | Production | Preview/staging |
| --- | --- | --- |
| `SUPABASE_URL` | production project | staging project or branch |
| `SUPABASE_PUBLISHABLE_KEY` | production | staging |

**Never put the Supabase secret key in a frontend build.** It bypasses RLS entirely and anything in a client bundle is public. Secret-key work belongs in Edge Functions, where the key is injected server-side.

Ideally staging points at a **separate Supabase project** (or a Supabase branch) so staging migrations cannot damage production data.
