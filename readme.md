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

No build step, no dependencies. Open the product directly:

```
open index.html
```

`index.html` is fully self-contained — it runs from `file://` with no server, no network, and no install.

## What's in this repo

| Path | What it is |
|---|---|
| **`index.html`** | **The product.** One self-contained file — open it and you're running the app. |
| `feel-prototype.html` | A throwaway experiment testing a different interaction paradigm. Not the product. |
| `design-system/` | Design reference from a later design pass — tokens, guidelines, React components, and a React **mockup** of this screen (`ui_kits/avatar-studio/`). A style spec; **not** what ships. See `design-system/SKILL.md`. |
| `CLAUDE.md` | Project brief, north star, and hard constraints. |

> The product is `index.html` and nothing else. Everything under `design-system/` is reference material — the app loads none of it.

## Architecture (the product)

`index.html`, three layers:

| Layer | What it does |
|---|---|
| **Catalog** (`CAT.*`) | Pure data — every style option and how to render it |
| **Render engine** | `renderAvatar(state)` → deterministic inline SVG |
| **UI shell** | Thin DOM layer — pinned avatar, tappable panels, history/undo |

No external dependencies, no network requests, **no storage** (state is memory-only by design — a clean slate on every reload, safe for shared devices), no frameworks.

## Deploying updates

```
git add -A
git commit -m "your message"
git push
```

GitHub Pages publishes from `main` root automatically.
