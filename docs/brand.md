# Brand

Keel — project management, deployed at `keel.ostenmark.com`.

## The name

A keel is the structural backbone running the length of a hull. It is what keeps a ship steady and holds its course. The name sits alongside the parent brand Ostenmark, which reads Nordic (_osten_, east + _mark_, land).

Short, lowercase-safe, and one syllable — which matters practically, because the name has to work as `@keel/ui`, `keel-api`, and a Docker tag.

## The mark

A keel line carrying three ribs. It reads as a ship's frame and, simultaneously, as bars on a roadmap — the product's own subject.

```
█
██████████
█
█████████████
█
███████
█
```

Source: `packages/propel/src/icons/brand/keel-logo.tsx`

### Construction

- 48 × 48 viewBox
- Spine at x=14, from y=7 to y=41
- Ribs at y=15 (to x=33), y=24 (to x=41), y=33 (to x=27)
- Stroke width 5.5, round caps

The differing rib lengths are load-bearing, not decoration — they are what produces the roadmap reading. Keep them.

## Components

| Component      | File                | Use                                                    |
| -------------- | ------------------- | ------------------------------------------------------ |
| `KeelLogo`     | `keel-logo.tsx`     | The mark alone — favicons, avatars, tight spaces       |
| `KeelWordmark` | `keel-wordmark.tsx` | The name alone                                         |
| `KeelLockup`   | `keel-lockup.tsx`   | Mark and wordmark together — headers, login, marketing |

All three take `color` defaulting to `currentColor`, matching the `ISvgIcons` contract in `packages/propel/src/icons/type.ts`.

## Rules

**Everything inherits `currentColor`.** The mark is stroked, never filled, and carries no color of its own. This is why there are no light and dark variants — and why none should be added. A mark with theme variants is a mark whose two versions eventually drift.

**Minimum size 16 px.** The mark was tested at 48/32/24/16; below 16 the ribs merge.

**Clear space** equal to the spine's stroke weight on all sides.

**Don't:** recolor per-theme, fill the strokes, change rib lengths to equal, add a container shape, or set the wordmark in a different weight than 600.

## Wordmark

Set in live text rather than outlined paths, so it stays crisp at any size and inherits theme color. Weight 600, letter-spacing `-1.2` at 34px.

If a fixed wordmark is ever needed outside the app — favicon files, an OG image, print — it must be converted to outlines against a chosen typeface. That decision has not been made yet.

## Colour

The identity is currently monochrome by design: the mark takes the color of whatever surrounds it. A palette for the UI restyle is a separate exercise and belongs with the design tokens in `packages/ui` and `packages/propel`, not here.

## Outstanding

- **Some raster assets are still upstream artwork.** The PWA icons, `keel-takeoff.png`, and `keel-instance-not-ready.webp` were renamed but their pixels are unchanged. They need regenerating from the SVG.
- **Illustrations** should follow the mark: same stroke weight, round caps, `currentColor`, so artwork and icons read as one system.
