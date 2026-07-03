---
status: final
updated: 2026-07-03
project: designMe
sources:
  - ../../../CLAUDE.md
  - ../../../_bmad-output/specs/spec-designme/SPEC.md
  - ../../../app/src/theme.ts
  - ../../../docs/art-bible.md
colors:
  bg: "#ece7dc"
  bg2: "#dcd4c5"
  surface: "#fbf8f2"
  surface2: "#f4eee4"
  surface3: "#efe7d9"
  ink: "#2f2823"
  inkSoft: "#6b5f53"
  inkFaint: "#978a7b"
  line: "#ddd0bd"
  line2: "#cabfa9"
  sage: "#6f8f6a"
  sageDeep: "#3f5c3b"
  sageWash: "#eef3ea"
  terra: "#bd7a4f"
  terraDeep: "#8a5430"
  onAccent: "#ffffff"
  selected: "#355c39"
  focus: "#1f4d2c"
  danger: "#b23b43"
typography:
  sans: 'Nunito, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", sans-serif'
  serif: 'Newsreader, Georgia, "Times New Roman", serif'
  scale:
    xs: 11
    sm: 12
    md: 13
    base: 15
    body: 16
    lg: 18
    xl: 25
    display: 30
rounded:
  sm: 12
  md: 18
  lg: 22
  xl: 26
  xxl: 30
  mat: 36
  pill: 999
spacing:
  base: 4
  tap: 48
  tapLg: 66
components:
  - OptionTile
  - RegionHotspot
  - Tray
  - ActionRow
  - LookCard
  - Toast
  - EyebrowLabel
---

# designMe — DESIGN.md

The visual identity contract. Token values are canonical in `app/src/theme.ts`
(this file mirrors it — a change lands in both or neither). The avatar/catalog
*art* has its own law in `docs/art-bible.md`; this spine covers the product
chrome around that art.

## Brand & Style

**Premium-calm, warm & handcrafted.** The strategic thesis is *dignity through
desirability*: designMe must feel like something anyone would want to use, so
using it carries taste, not diagnosis. The clinical look IS the stigma — nothing
here may read as medical, educational, or "special needs."

- Warm paper world: every surface is warm off-white/beige, never pure white or gray.
- Editorial pride-spark reserved for the moments that carry it: the serif wordmark
  and the avatar/lookbook art. Everything else is quiet.
- Apple-minimal discipline: generous whitespace, few elements, high legibility.
- All-ages and timeless — never childish, never teen-trendy.
- Voice in one line: a calm, proud gallery — not an app that talks.

## Colors

All values in frontmatter `colors`; consumed only via `theme.color.*` — never
hardcoded hexes in components.

| Role | Token | Notes |
|---|---|---|
| World background | {colors.bg} / {colors.bg2} | warm paper; bg2 for wells/recesses |
| Cards & sheets | {colors.surface} → {colors.surface3} | stepped warm surfaces, no pure white |
| Text | {colors.ink} / {colors.inkSoft} / {colors.inkFaint} | warm near-black ramp |
| Primary (calm) | {colors.sage} / {colors.sageDeep} / {colors.sageWash} | selection, affirmation |
| Action (warm) | {colors.terra} / {colors.terraDeep} | the one warm CTA (Save) |
| Selected state | {colors.selected} | deep green ring/fill, AA on paper |
| Focus ring | {colors.focus} | darkest green, always visible, never removed |
| Danger | {colors.danger} | rare; destructive confirm only, never alarmist |

**Avatar/catalog palettes** (14 skins · 18 hair · 16 garment · 6 eye · 10 makeup)
are art data, locked in `docs/art-bible.md` §3 and `app/src/dm.ts` — they are not
UI colors and never leak into chrome.

**Hard rules:** no pure black, no pure gray, no neon, no high saturation. Shadows
are warm brown ({components → Elevation}), never gray/black.

## Typography

- **Sans ({typography.sans})** — everything functional: labels, controls, body.
  Rounded, friendly, high x-height.
- **Serif ({typography.serif})** — the `designMe` wordmark and rare editorial
  moments (lookbook headings) ONLY. Never body, never controls.
- Scale is fixed (frontmatter `typography.scale`); no ad-hoc sizes. `xs` pairs
  with the EyebrowLabel treatment (800 weight, +0.8px tracking, uppercase).
- Minimum text size on screen: `sm` (12) — and only for captions/tile labels.

## Layout & Spacing

- 4px base grid: `space(n) = n × 4`. Components use steps, not raw px.
- Touch targets: ≥ {spacing.tap}px every interactive element; ≥ {spacing.tapLg}px
  for primary actions (region hotspots, Save, this-or-that choices).
- One-screen calm: each surface has a single primary zone (the avatar, the pair,
  the gallery) with generous negative space. Never more than one sheet/tray open.
- The avatar canvas keeps a fixed 240:490 aspect stage; chrome floats around it,
  never crowds it.

## Elevation & Depth

Warm-brown shadows only (`#3e2a16` family) — the handcrafted material rule; gray
shadows read clinical/digital. Four steps (sm/md/lg/xl in `theme.shadow`): tiles
sit at sm, trays/sheets at lg, the stage mat at md, modals (rare) at xl. Android
elevation can't tint shadows — the gray fallback there is an accepted gap.

## Shapes

Soft and rounded everywhere: {rounded.sm}–{rounded.xxl} by component size, `mat`
(36) for the avatar stage, `pill` for chips/toggles/badges. No sharp corners; no
perfect circles except pills. Nothing vibrates visually — curves are gentle, not
bouncy.

## Components

Visual specs; behavior lives in EXPERIENCE.md → Component Patterns.

- **OptionTile** — the recognition unit: a large visual (avatar crop / part
  render) on {colors.surface}, radius {rounded.lg}, shadow sm; label `sm` under
  the visual; selected = 3px {colors.selected} ring + {colors.sageWash} fill;
  ≥ {spacing.tap} square, typically larger.
- **RegionHotspot** — circular ≥ {spacing.tapLg} translucent button anchored to
  an avatar region (hair/face/top/bottom/shoes/extras); icon in {colors.sage};
  gentle breathe animation (see Motion) on first-run only.
- **Tray** — bottom sheet, {colors.surface}, radius {rounded.mat} top corners,
  shadow lg; title `lg`; a single horizontal row of OptionTiles + color row;
  never taller than 40% of stage height.
- **ActionRow** — shuffle / undo / save cluster; save is the only terra button.
- **LookCard** — lookbook unit: the saved avatar full-bleed on {colors.surface2},
  radius {rounded.xl}; no metadata text required.
- **Toast** — one line, {colors.surface} on shadow lg, auto-dismiss, never stacks,
  never blocks. Confirmation only ("Saved to your looks") — no error scolding.
- **EyebrowLabel** — `xs`/800/+0.8px/uppercase in {colors.inkSoft}; section
  markers, never interactive.

**Motion** (signature system): one easing curve `cubic-bezier(0.22, 0.61, 0.36, 1)`,
three durations — fast 120ms (state flips), base 200ms (tray slide, crossfade),
slow 420ms (settle moments). Reduced motion: every animation snaps instantly —
no exceptions. No flashing, no autoplay, no parallax, no looping motion.

## Do's and Don'ts

- ✅ Do let the avatar art carry the color; keep chrome quiet paper.
- ✅ Do use warm shadows and warm neutrals for every new surface.
- ✅ Do keep the serif for pride moments only.
- ❌ Don't introduce pure white/black/gray, neon, or a new accent family.
- ❌ Don't use scores, streaks, badges, timers, progress pressure, or confetti.
- ❌ Don't add text the user must read to proceed — visuals first, labels assist.
- ❌ Don't ship any element without `accessibilityRole` + label and a visible focus state.
