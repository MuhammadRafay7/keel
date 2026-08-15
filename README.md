# Keel

Project management — work items, cycles, modules, roadmaps and collaborative docs.

Running at **[keel.ostenmark.com](https://keel.ostenmark.com)**.

---

## What it is

Keel tracks work. Items carry state, priority, assignees, labels, estimates and dates, nest into sub-items, and link to each other as blocking, duplicate or related. Around that:

- **Cycles** — time-boxed sprints with burn-down tracking
- **Modules** — durable groupings that cut across cycles
- **Views** — saved filter, grouping and layout combinations, private or shared
- **Pages** — collaborative rich-text docs, editable by several people at once
- **Intake** — a triage inbox for requests before they enter the backlog
- **Analytics** — charts across the whole workspace

Lists render as list, board, calendar, spreadsheet or timeline, grouped by any property.

## Architecture

Keel runs on **Vercel and Supabase only** — no VPS, no always-on server.

| Piece                                  | Runs on                               |
| -------------------------------------- | ------------------------------------- |
| `apps/web`, `apps/admin`, `apps/space` | Vercel — static SPA builds            |
| Postgres, Auth, Storage, RLS, Realtime | Supabase                              |
| API logic, scheduled and queued work   | Supabase Edge Functions, Cron, Queues |
| `apps/api` (Django)                    | Nowhere — reference-only, see below   |

See [docs/architecture.md](./docs/architecture.md) for the full picture, including the one unsolved problem: collaborative editing without a stateful server.

## Repository layout

```
apps/
  web/      main application
  admin/    instance administration
  space/    public shared views
  live/     realtime collaboration server
  api/      Django — reference-only, not deployed
packages/   15 shared workspace packages (@keel/*)
docs/       working documentation
```

## Development

Requires Node ≥ 22.18 and pnpm 11.3.

```bash
pnpm install
pnpm dev          # web:3000, admin:3001
pnpm build
pnpm check        # format, lint, types
pnpm fix          # auto-fix
```

Tooling is the **oxc** stack — `oxlint` and `oxfmt`, not ESLint or Prettier. Internal dependencies use `workspace:*`, external ones use `catalog:` from `pnpm-workspace.yaml`.

## Contributing

Two branches: `staging` for integration, `main` for production. Everything reaches `main` through a pull request. See [docs/branching.md](./docs/branching.md).

## Documentation

| Doc                                           | Contents                                   |
| --------------------------------------------- | ------------------------------------------ |
| [architecture.md](./docs/architecture.md)     | Target architecture and what replaces what |
| [migration-plan.md](./docs/migration-plan.md) | The phased migration off Django            |
| [branching.md](./docs/branching.md)           | Branch model, protection, deploys          |
| [brand.md](./docs/brand.md)                   | Identity — mark, wordmark, usage           |
| [linting.md](./docs/linting.md)               | Lint and format tooling                    |

## Origin and licence

Keel is a fork of **[Plane](https://github.com/makeplane/plane)** by Plane Software, Inc., used under the GNU Affero General Public License v3.0. Plane is an excellent piece of software and this project would not exist without it.

Keel is not affiliated with, endorsed by, or supported by Plane Software, Inc.

This project remains licensed under **[AGPL-3.0-only](./LICENSE.txt)**. Upstream copyright notices are preserved throughout the source.

Because Keel is served over a network, AGPL §13 obliges us to offer users the complete corresponding source of this modified version — which is this repository.
