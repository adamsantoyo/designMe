# designMe — Find Your Vibe

A no-typing, recognition-first avatar creator and style explorer built for self-expression and autonomy.

**Live:** https://adamsantoyo.github.io/designMe/

---

## What it does

- Build a full-body avatar (skin tone, face shape, hair, body, height)
- Dress it across 18 curated looks in 6 style worlds
- Every choice is visual — tap to try it on, no text input required
- Save looks to a personal lookbook (session memory only, nothing is stored)
- "Find my vibe" this-or-that discovery mode: react to two looks, get a style

## Who it's for

People who benefit from recognition-over-recall interaction — AAC users, multimodal communicators, and anyone who'd rather *show* what they like than describe it. Representation is a core requirement: 14 skin tones, wide hair range, assistive tech (wheelchair, cane, AAC tablet/board, iPad, letter board, hearing aids, cochlear implants) presented as ordinary options.

## Running locally

No build step. Open `index.html` directly in a browser:

```
open index.html
```

Or serve it:

```
python3 -m http.server 8080
```

## Architecture

Single self-contained HTML file. Three layers:

| Layer | What it does |
|---|---|
| **Catalog** (`CAT.*`) | Pure data — every style option and how to render it |
| **Render engine** | `renderAvatar(state)` → deterministic inline SVG |
| **UI shell** | Thin DOM layer — pinned avatar, tappable panels, history/undo |

No external dependencies, no network requests, no storage, no frameworks.

## Deploying updates

```
git add -A
git commit -m "your message"
git push
```

GitHub Pages publishes from `main` root automatically.
