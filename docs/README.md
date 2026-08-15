# Keel docs

Working documentation for Keel — a fork of [Plane](https://github.com/makeplane/plane) being migrated off Django onto Supabase and deployed at `keel.ostenmark.com`.

| Doc | What's in it |
| --- | --- |
| [architecture.md](./architecture.md) | Target architecture, what replaces what, and the one unsolved problem |
| [migration-plan.md](./migration-plan.md) | The phased plan off Django, with current status |
| [branching.md](./branching.md) | Branch model, protection rules, deploy flow |
| [brand.md](./brand.md) | The Keel identity — mark, wordmark, usage |
| [linting.md](./linting.md) | Lint and format tooling (oxlint / oxfmt) |

## Ground rules

- **Nothing but Vercel and Supabase.** No VPS, no always-on box, no third host. If a design needs one, the design is wrong.
- **`apps/api/` is reference-only.** The Django code stays on disk as the spec for business logic and permissions. It is not deployed and not maintained.
- **Licensing.** This is a fork of AGPL-3.0 software. See [architecture.md](./architecture.md#licensing) before removing any notice.
