# Hand-off prompt — Keel **app** UI redesign

Paste everything below the rule into Antigravity. It is written to be
self-contained and to stop the agent making the four wrong assumptions that
would waste the most time.

---

## What you are working on

The **Keel web app** — `apps/web` in a pnpm + Turborepo monorepo. Not the
marketing site (`apps/marketing`), which is being redesigned separately. Do not
touch `apps/marketing`.

Keel is a work-management tool for engineering teams: work items, five layouts
over them (List, Board, Calendar, Table, Timeline), cycles (sprints), modules,
saved views, wiki pages, chat, and AI.

## Stack — read this before you plan anything

- **React 18 + React Router 7** (file-based routes under `apps/web/app`), Vite,
  TypeScript strict
- **MobX** stores, `observer()` components
- **Tailwind CSS v4**, configured entirely in CSS (`packages/tailwind-config`).
  There is no `tailwind.config.js`
- Component packages: **`@keel/propel`** (built on **Base UI**) and
  **`@keel/ui`** (Headless UI + one Radix scroll-area)
- Icons today: **lucide-react** (~252 imports) and **`@keel/propel/icons`**
  (~357 imports)

### Correction #1 — there is no shadcn/ui in this repository

The brief you may have been given says to "remove shadcn." **Do not go looking
for it — there is zero shadcn code here.** A search for `shadcn` across the
whole monorepo returns nothing. The components are custom, built on Base UI,
which is _newer_ than the Radix base shadcn uses.

What the request actually means is: **the components look like generic
off-the-shelf library defaults.** That is the real problem and it is a styling
problem, not a dependency problem. Fix it by restyling `@keel/propel` and
`@keel/ui` in place. **Do not** swap in a different component library, and do
not add MUI, Mantine, Chakra, Bootstrap or CoreUI — they all fight Tailwind's
cascade and the token layer below.

## The design system you must build on, not replace

`packages/tailwind-config/variables.css` defines a full semantic token layer.
**Consume these tokens. Never hard-code a hex, rgba or oklch value in a
component.**

- **Surfaces:** `bg-canvas`, `bg-surface-1`, `bg-surface-2`,
  `bg-layer-1|2|3` each with `-hover` / `-active` / `-selected`
- **Text:** `text-primary`, `text-secondary`, `text-tertiary`,
  `text-placeholder`, `text-on-color`
- **Borders:** `border-subtle`, `border-subtle-1`, `border-strong`,
  `border-strong-1`
- **Accent:** `bg-accent-primary`, `bg-accent-subtle`, `text-accent-primary`,
  `border-accent-strong` — all resolve through a single `--brand-*` ramp
- **Elevation:** `shadow-raised-100|200|300` for things sitting on the page,
  `shadow-overlay-100|200` for things floating above it. These are theme-aware.
  **Tailwind's default `shadow-sm` / `shadow-md` / `shadow-lg` DO NOT EXIST**
  here — the theme clears `--shadow-*`. Using them emits no CSS at all
- **Motion:** one curve, `--ease-smooth` (`cubic-bezier(0.16, 1, 0.3, 1)`), via
  the `transition-smooth` utility. Nothing bounces
- **Focus:** the `focus-ring` utility. Every interactive element needs a visible
  keyboard focus state
- **Themes:** `data-theme` on `<html>` is `light` / `dark` / `light-contrast` /
  `dark-contrast`. Independently, `data-accent` selects one of eight accent
  hues (violet default, plus azure, indigo, emerald, teal, amber, rose, pink).
  **Every screen must be checked in light and dark.**

## The work

### 1. Kill the glass — it is the top complaint

There are `glass-panel`, `glass-card`, `glass-pill`, `glass-header`,
`glass-overlay`, `glass-rail` and `glass-well` utilities in
`packages/tailwind-config/index.css`, applied to the sidebar, app rail, top
navigation, board columns, command palette and peek panel.

**They are not working.** Translucency plus `backdrop-filter` means page content
bleeds through the sidebar and headers, so text sits on top of moving content
behind it and nothing has a clean edge.

Replace them with **opaque surfaces**:

- Sidebar, app rail, top navigation, board columns → solid `bg-surface-1` /
  `bg-surface-2` with a single `border-subtle` hairline
- Separation comes from **one** device: a hairline border, or an elevation
  shadow — not both, and not translucency
- Floating panes (menus, dialogs, palette, peek) may keep a _slight_ blur on the
  **backdrop scrim only**; the pane itself must be opaque
- When you are done, `glass-*` should have no remaining consumers. Delete the
  utilities rather than leaving dead CSS

### 2. Replace every icon — this is a large, deliberate task

The app currently mixes lucide-react with a partial in-house set, so weight,
corner radius and optical size are inconsistent from row to row.

- Choose **one** coherent icon system and apply it everywhere. Build it in
  `packages/propel/src/icons` as inline SVG components — no icon-font, no
  runtime icon CDN
- Uniform spec: 16px and 20px optical sizes, ~1.5px stroke, round caps and
  joins, drawn on a 24×24 grid, `currentColor` only
- **Priority** (urgent / high / medium / low / none) and **state** (backlog /
  todo / in progress / done / cancelled) need purpose-drawn glyphs in the
  ClickUp idiom: filled, saturated, instantly separable at 14px, and each
  occupying the **same box** so a column of work items aligns
  - The existing `PriorityIcon` already draws three bars plus an urgent square —
    keep that structure and take it further; do not regress to lucide's
    `SignalHigh`/`SignalMedium`/`SignalLow`, which are left-anchored and need
    per-priority `translate-x` hacks to look centred
  - State icons should read as a progress ring: empty → dashed → part-filled →
    filled check → crossed
- Sidebar, toolbar and row-action icons all get the same treatment. No lucide
  icon should remain in `apps/web/core/components`

### 3. Fix the cycles page — real bug, not styling

`apps/web/core/components/cycles/cycles-view.tsx` renders **"No matching cycles
— Remove the filters to see all cycles"** whenever the filtered list is empty.
It cannot distinguish _"this project has no cycles yet"_ from _"filters excluded
everything"_, so a brand-new project is told to remove filters that do not
exist. That is why cycles look broken.

Fix it properly:

- **No cycles exist** → a real first-run empty state: what a cycle is, and a
  primary **Create cycle** button
- **Cycles exist but filters/search exclude them all** → the current message,
  plus a **Clear filters** button that actually clears them
- Verify the underlying fetch actually returns cycles before assuming it is only
  a display issue

### 4. Add workspace-level chat to the sidebar

Chat exists today only **inside a project** (`Projects → ayn → Chat`). Add a
**workspace-level Chat entry** in the main sidebar section alongside Home, Your
work and Drafts, reachable without opening a project. Include direct/private
conversations between workspace members in the design.

> Note for whoever schedules this: the backend for global and private chat does
> not exist yet — it needs new tables, RLS policies and migrations. Build the
> navigation and screens; wire them to real data as a follow-up.

### 5. De-genericise the components

Restyle `@keel/propel` and `@keel/ui` so nothing reads as an untouched library
default. Concretely: buttons, inputs, selects, dropdown menus, dialogs,
tooltips, tabs, toasts, checkboxes, radios, switches, avatars, badges and
tables. Give them a consistent radius scale, considered padding, real hover /
active / disabled / focus states, and typography that matches the app rather
than a starter template.

### 6. Density and layout

Work-item rows currently end in seven near-identical grey icon buttons, which is
unreadable. Rethink the row: group related properties, let the important ones
(state, priority, assignee, due date) carry colour and shape, and demote the
rest behind a single overflow control.

## Rules

1. **Never hard-code colour.** Tokens only. A hex in a component is a bug
2. **Never use `shadow-sm` / `shadow-md` / `shadow-lg`** — they emit nothing.
   Use `shadow-raised-*` / `shadow-overlay-*`
3. **Do not add a component library or a CSS-in-JS runtime**
4. **Do not touch `apps/marketing`**
5. **Never write the word "Plane"** in any user-facing string, comment or doc.
   The product is Keel. Existing SPDX copyright headers are the sole exception —
   leave those alone
6. **Both themes, every screen.** Light and dark, checked
7. **Accessibility is not optional:** visible focus on every control, real
   button/link semantics (no `onClick` on a bare `<div>`), `aria-expanded` on
   disclosures, ≥4.5:1 text contrast
8. **Keep it green.** `pnpm check:types`, `pnpm check:lint` and `pnpm build`
   must all pass when you are done
9. If a string is user-visible it must go through `@keel/i18n`, be added to
   `packages/i18n/src/locales/en/*.json`, **and** be translated into all 18
   other locales — `pnpm --filter @keel/i18n run sync:check` must report 100%

## A warning about committing

A previous automated run committed 72 unrelated in-progress files under a
message that described only marketing changes. **Commit only the files you
actually changed, and describe them accurately.** Do not `git add -A`.

## Definition of done

- No `glass-*` utility has any consumer; the utilities are deleted
- No lucide import remains in `apps/web/core/components`
- Priority and state icons are bespoke, aligned, and legible at 14px
- The cycles page distinguishes empty-from-no-data and empty-from-filters
- Workspace-level chat is present in the sidebar
- Every screen verified in light and dark
- types, lint, build and i18n `sync:check` all pass
