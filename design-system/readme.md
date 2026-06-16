# designMe — Design System (REFERENCE ONLY)

> **This is not the product.** The product is `../index.html` (one self-contained file).
> Everything here is design reference from a later design pass — tokens, guidelines,
> React components, and a React **mockup** of the product screen. The shipping app
> loads none of it.

## What's here

- `tokens/` — CSS design tokens (colors, type, spacing) — the canonical design language.
- `guidelines/` — HTML design-language docs (brand, color, type, garments).
- `styles.css` — entry point that `@import`s the tokens.
- `components/` — inline-style React components (Button, Swatch, VibeCard, …).
- `_ds_bundle.js` / `_ds_manifest.json` — compiled component bundle (generated output).
- `assets/` — `avatar.js` (`dmAvatar` bust) and `figure.js` (`dmFigure` full figure) preview engines.
- `ui_kits/avatar-studio/` — a React **mockup** of the product screen. Cosmetic recreation on a
  CDN-React + in-browser-Babel stack. **Not shippable** under the product's hard constraints
  (self-contained, no framework, no network). Uses a *subset* catalog.
- `SKILL.md` — packages this bundle as a Claude design skill.

## How it relates to the product

The product (`../index.html`) is the source of truth for behavior and the full catalog
(including assistive tech, skin features, and the texture axis the mockup drops). This folder
is the **visual spec** — use it to keep the product's look consistent, not as code to ship.
