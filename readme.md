# designMe — Find Your Vibe

A no-typing, recognition-first avatar creator and style explorer built for
self-expression and autonomy.

---

## What it does

- Build a full-body avatar — skin tone, hair (style + color), face/expression, body
- Dress it: tops, bottoms, layers, shoes, and recolor any piece
- Add everyday extras — glasses, hearing tech, jewelry, bags
- Every choice is visual: **tap a part of the avatar → a tray of options → tap to try
  it on.** No text input required.
- Shuffle a fresh look, save to your lookbook, undo any change

## Who it's for

People who benefit from recognition-over-recall interaction — autistic people, AAC
users, multimodal communicators, and anyone who'd rather *show* what they like than
describe it. Representation is a core requirement: a wide skin-tone and hair range, and
assistive tech (hearing aids, cochlear implants, and more) presented as ordinary
options. Gender-expansive — every item is available to every avatar.

## The product

A **React Native + Expo** app — one codebase shipping to **web and iPad**. The avatar
is drawn by the deterministic **dmFigure** SVG engine (same state always renders the
same avatar); art is composited locally, with no AI on the interaction path.

### Run it locally

```
cd app
npm install
brew install watchman   # avoids the macOS EMFILE file-watcher limit
npm run web             # → http://localhost:8081  (or: npm run ios)
```

## What's in this repo

| Path | What it is |
|---|---|
| **`app/`** | **The product** — the Expo app (web + iPad). |
| `app/src/AvatarStudio.tsx` | The main "avatar is the menu" screen. |
| `app/src/engine/dmFigure.js` | The deterministic SVG avatar engine. |
| `app/src/dm.ts` | Catalog + palettes + engine option builder. |
| `docs/` | Build spec — `build-kickoff`, `art-bible`, `avatar-engine`, `catalog-bible`, audits. |
| `CLAUDE.md` / `AGENTS.md` | Project brief, north star, hard constraints, agent orientation. |
| `index.html` | Retired self-contained HTML PoC — **reference + catalog data source only**, not the product. |
| `design-system/` | Tokens, guidelines, and an earlier React studio mockup — reference. |

## Architecture (the app)

| Layer | What it does |
|---|---|
| **Catalog** (`dm.ts`) | Pure data — every option, palettes, and `buildOpts(state)` |
| **Engine** (`engine/dmFigure.js`) | `dmFigure(opts)` → deterministic SVG string |
| **Render** (`SvgString` / `.web`) | Draws the SVG: `SvgXml` on native, a DOM `<div>` on web |
| **Screen** (`AvatarStudio.tsx`) | Pinned avatar, on-body tap-zones + chips, slide-up trays, history/undo |

Front-end only for now — local state, no backend or accounts.
