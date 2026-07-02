# designMe — agent brief

A no-typing, **recognition-first** avatar + style explorer for self-expression and
autonomy, built for autistic people, AAC / multimodal communicators, and others who
benefit from communication support (initial user: the maker's sister). The user
*reacts to* visual options instead of describing them. Warm, calm, premium — never
clinical. *"A tool for someone who may not be able to tell you what they like, but
can show you."*

> Authoritative project doc is **`CLAUDE.md`**; the build spec lives in **`docs/`**.
> This file is the short orientation for coding agents.

## What the product is now

The product is the **React Native + Expo app in `app/`** — one codebase shipping to
**web and iPad**. (The original `index.html` is a retired self-contained HTML PoC —
reference + catalog data source only, **not** the product. The earlier
"no AI / inline-SVG-only / single-file" constraints are retired.)

- **Avatar engine:** `app/src/engine/dmFigure.js` — the deterministic **dmFigure SVG
  engine** (`dmFigure(opts) → SVG string`), extracted verbatim from the Claude Design
  export. Pure, no external assets. Rendered through `app/src/SvgString.tsx`
  (native: react-native-svg `SvgXml`) / `SvgString.web.tsx` (web: a DOM `<div>` —
  react-native-svg's web build does **not** export `SvgXml`).
- **Catalog:** `app/src/dm.ts` (`window.DM` ported from the design) — items + palettes
  + `buildOpts(av, ov)` that resolves avatar state into engine options.
- **Main screen:** `app/src/AvatarStudio.tsx` — "the avatar is the menu": full-bleed
  stage, on-body tap-zones + floating chips → slide-up tray of region-cropped tiles,
  with shuffle / save / undo, a randomized non-default start, and a settle animation.
- **Tokens:** `app/src/theme.ts` (ported from `design-system/tokens`).

> A richer **layered-PNG + Skia** avatar pipeline is specified in `docs/art-bible.md`
> + `docs/avatar-engine.md` as a *future fidelity upgrade*. It is not what currently
> ships — the app runs on the SVG engine today, and no part PNGs exist yet.

## Running it

```
cd app
npm install
brew install watchman   # avoids macOS EMFILE file-watcher limit
npm run web             # or: npx expo start --web   → http://localhost:8081
```

## Values (hard requirements — do not violate)

- **Representation with real breadth:** wide skin-tone range (never a light default),
  broad hair incl. straight/wavy/curly/braided + shaved/bald, body + height range,
  assistive tech & skin features as **ordinary** options, cultural/religious
  expression. **Gender-expansive** — every item available to every avatar, no gendered
  menus. **Randomized non-default start.**
- **Accessibility:** WCAG AA contrast, touch targets ≥48px (primary ≥64px), full
  keyboard + visible focus, honor reduced motion. **No** flashing, autoplay audio,
  infinite scroll, per-tap latency, time pressure, scores/streaks.
- **Recognition-first & calm:** the avatar IS the menu (direct manipulation + trays),
  plus the this-or-that second door. **Never:** required text input, tutorial/modal
  walls, sign-up before play, caregiver gate, or "what flatters you" framing.
- **Determinism:** same avatar state → same render. Only *shuffle* adds randomness, and
  only to the state. No AI on the interaction hot path.

## Reference (not the product)

- `index.html` — retired PoC; source of catalog ids/hexes to port.
- `design-system/` — tokens, guidelines, and an earlier React studio mockup.
- `feel-prototype.html`, `_art/` — archived experiments.
