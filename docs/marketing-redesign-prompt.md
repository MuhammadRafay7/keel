# Hand-off prompt — Keel marketing site redesign

Paste everything below the line into the design/build tool. It is written to be
self-contained: it does not assume the tool can see this repository.

---

## Brief

Redesign and rewrite the marketing site for **Keel**, a work-management product
for software teams. Both the visual design and the written content are in scope.
The current site is stale in substance, not just in styling — read the
"Positioning correction" section carefully, because most of the existing copy
makes claims that are no longer true.

## What Keel actually is

A work-management workspace for engineering teams. The shipped product has:

- **Work items** — issues with priority, state, assignees, labels, dates,
  estimates, sub-items and relations
- **Five views over the same data** — List, Board (kanban), Calendar, Table
  (spreadsheet), Timeline (gantt) — switchable per project, with saved filters
- **Cycles** — time-boxed sprints with burndown
- **Modules** — longer-running workstreams that group work items
- **Views** — saved, shareable filter sets
- **Pages** — a rich collaborative document editor living beside the work
- **Chat** — per-project conversation
- **AI** — bring-your-own API key across Anthropic, OpenAI, Google, xAI,
  Mistral, DeepSeek and Groq; drafts and improves work item titles and
  descriptions, and an agent panel that can act on the workspace
- **Theming** — light / dark / high-contrast, plus eight accent colours the user
  picks independently of light-vs-dark

## Positioning correction — the most important part of this brief

The existing site sells Keel as _"100% open source, air-gapped Docker ready,
zero telemetry lock-in"_ and repeats "Docker", "air-gapped" and "self-hosted"
throughout. **Do not carry any of that across.** Keel is a hosted product. Those
claims are left over from an earlier direction and are now simply wrong.

Rewrite from this position instead:

- Hosted, fast, and ready immediately — no infrastructure to run
- **Bring your own AI key.** Keel never resells model usage; the user's key goes
  to their provider. This is a genuine differentiator and deserves real space
- One workspace where issues, sprints, roadmap and docs are the same data seen
  five ways, not four products bolted together
- Built for engineers: keyboard-first, dense where density helps, quiet chrome

## Pricing — hard requirement

**Publish no prices. No figures, no per-seat rates, no comparison table with
numbers, no pricing page.** Every commercial call to action is
**"Talk to sales"** pointing at **sales@ostenmark.com**. The product quotes per
workspace. This rule is absolute; a plan-comparison grid is fine only if it
compares capabilities and never cost.

## Pages to deliver

`/` (home), `/features`, `/about`, `/contact`, `/docs`, `/changelog`,
`/privacy`, `/terms`. Home carries the argument; `/features` goes deep on the
five views, cycles, modules, pages and AI.

## Visual direction

Match the product, which was recently redesigned. It is **not** a loud
gradient-heavy SaaS page and **not** flat corporate minimalism:

- **Accent: violet.** The product ships violet as its default accent
- **Material:** soft translucent glass panels, hairline borders, generous
  padding, large corner radii (16–24px)
- **Elevation:** shadows are soft, wide and low-opacity — cast in near-black on
  dark backgrounds, in a slate tint on light. Never a hard drop shadow
- **Motion:** one easing curve everywhere — `cubic-bezier(0.16, 1, 0.3, 1)`,
  180–320ms. Nothing bounces. Respect `prefers-reduced-motion`
- **Type:** a geometric display face for headings, a neutral grotesque for body.
  Tight heading tracking (about `-0.015em`). Sentence case, never ALL CAPS for
  real words
- **Dark and light must both be first-class** and switchable

## Content rules

- Never use the word "Plane" anywhere. The product is Keel
- No fake logos, fake customer names, fake testimonials, or invented metrics.
  If a section needs social proof, leave a clearly-marked placeholder
- Write plainly. No "revolutionise", no "supercharge", no "10x"
- Every claim must be one the product list above supports

## Technical constraints

- Next.js App Router, TypeScript, React 18
- Responsive from 360px up; no horizontal scroll on the body at any width
- Accessible: real landmarks and heading order, visible keyboard focus on every
  interactive element, ≥4.5:1 text contrast in both themes, alt text on
  meaningful images and empty alt on decorative ones
- Fast: no heavy 3D on first paint. The current site loads Three.js on the home
  page — if a canvas effect is kept, defer it and gate it behind
  `prefers-reduced-motion`
- Self-contained assets; no external script or font CDNs beyond Google Fonts

## Deliverable

Complete page implementations plus the shared header, footer and section
components, with all copy written — no lorem ipsum, no `TODO`.
