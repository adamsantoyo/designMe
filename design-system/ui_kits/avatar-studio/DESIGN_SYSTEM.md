# Avatar Studio — UI kit (MOCKUP, not the product)

> **This is a cosmetic React mockup for design exploration — NOT the shipping app.**
> The product is the repo-root `index.html` (self-contained, full catalog). This kit uses a
> *subset* catalog and a CDN-React + in-browser-Babel stack that violates the product's hard
> constraints. Judge look & layout here; ship from `index.html`.

An interactive, high-fidelity recreation of the **designMe** avatar studio (the root `index.html` product view), built from the system's own components.

Open `index.html`. You can:

- **Pick a vibe** — filter style worlds and tap a `VibeCard` to apply a look.
- **Find my vibe** — the warm `DiscoverHero` opens a this-or-that discovery flow (the second door for switch / eye-gaze users): tap the look you prefer, three rounds.
- **Dress your avatar** — Fit (garment color), Hair (style + color), Color (coordinated palettes), Face (expression), Body (skin tone + skin features), and **Tools** (glasses, hearing aids, cochlear implants — assistive tech presented as ordinary options). Every change updates the pinned avatar live with a gentle settle.
- **Shuffle** — one tap randomizes a fresh, non-default look.
- **Save look** — adds the current look to your lookbook (with a calm "Saved" confirmation); tap a saved look to wear it again.
- **Undo** — step back through changes.

## Files

- `index.html` — entry; loads React + the compiled bundle + `avatar.js` + the screen files.
- `catalog.js` — a compact subset of the product catalog (skins, hair, garment colors, palettes, vibes).
- `icons.jsx` — the Lucide-style icon set as React components (`window.Icons`).
- `AvatarStudio.jsx` — the screen, composed from `Button`, `IconButton`, `CategoryTile`, `Swatch`, `ColorDot`, `Chip`, `SubTab`, `VibeCard`, `DiscoverHero`, `Card`, `Toast`, `Badge`.

> This is a cosmetic recreation for design exploration — the real product (see the root README's GitHub link) has a far richer deterministic avatar engine and full catalog including assistive tech and skin features.
