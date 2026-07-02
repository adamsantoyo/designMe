# designMe — Avatar Engine Spec

For Claude Code. How the avatar renders: composite transparent PNG part images in a fixed back-to-front z-order, tint the neutral parts to the chosen palette colors at runtime, on **web + iPad from one Expo codebase**. Deterministic — same state always produces the same image.

## Recommended tech

- **`@shopify/react-native-skia`** for the avatar canvas. It composites images with blend modes (multiply — tint that *preserves shading*), color filters, and clipping; runs on iOS + web (CanvasKit); and is fast enough to re-render on every tap. Needs an Expo **dev build** (config plugin), not Expo Go. Confirm the current API at build time.
- Fallback / quick MVP: plain `<Image>` stacking with `tintColor`. But `tintColor` flattens to one flat color and **loses the two-tone shading**, so treat it as a stopgap only — Skia is the real target.

## Data model

- **Catalog** (port from `index.html`'s `CAT` object / `docs/catalog-bible.md`): per slot, a list of items `{ id, label, category, colorMode }`, plus the palettes (skin, hair, garment, eye — exact hexes in `art-bible.md` §3).
- **Avatar state** — a plain object mapping each slot → selection, e.g.
  `{ skin:'s8', body:'balanced', height:'medium', hair:{id:'definedCurls', colorId:'h3'}, top:{id:'hoodie', colorId:'sage'}, bottom:{...}, shoes:{...}, tools:[...] }`
- **Render is a pure function of state + catalog.** No randomness in the renderer. `shuffle` writes random *state*; the renderer then draws it deterministically (this is what makes undo, save/restore, and repeatable shuffles work).

## Render pipeline

1. From state, resolve each active slot → asset path `assets/parts/{category}/{id}.png` and its target color (hex from the palette via `colorId`).
2. Build the layer list in the **z-order** below.
3. Draw each layer as a Skia `<Image>`. For neutral-master (color-driven) parts, apply a **multiply color filter** with the target hex — the near-white base becomes the color while the soft shadow + highlight survive. Fixed-color parts draw as authored.
4. Parts are generated full-frame on the canonical canvas (`art-bible.md` §4), so they composite by simple stacking — no per-part offset math.

## Z-order (back → front)

1. Aura / background glow *(deferred)*
2. Mobility, behind-body (wheelchair rear frame & wheels; walker rear legs)
3. Body + skin
4. Bottoms
5. Shoes (+ socks)
6. Top (base garment)
7. Outer layer (jacket / cardigan / open overshirt)
8. Carry (crossbody strap, backpack straps, handheld bag)
9. Neck jewelry (chain)
10. Hair — back layer
11. Head + ears (skin)
12. Skin features (freckles, vitiligo, birthmark, scar, blush)
13. Face: brows → eyes (+ iris color) → nose → lips → makeup
14. Ear level: earrings, hearing aids, cochlear implants
15. Hair — front / fringe
16. Headwear (beanie, cap, bucket; headscarf covers all hair)
17. Glasses
18. Handheld: AAC tablet / board / letter board / iPad / cane (front)
19. Mobility, front (wheelchair front wheel & seat frame)

## Recolor

- **Neutral masters** (hair, tops, bottoms, skin, bags): tint = `ColorFilter` blend **multiply** with the target hex. (Skia: `Skia.ColorFilter.MakeBlend(color, BlendMode.Multiply)`.)
- **Skin**: same approach, tint to the chosen `s1`–`s14` hex.
- **Fixed-color parts** (hearing aids, AAC devices, glasses frames, mobility aids, default shoe trims): draw the asset as authored — no tint.
- **Per-color bakes** (denim wash, metallics, anything that tints badly): load `assets/parts/{category}/{id}__{colorId}.png` instead of tinting.

## Canvas & registration

- Full-figure canvas **1024×1536** (Studio); bust **1024×1024** (tray thumbnails / small previews). Parts are pre-registered to these frames, so stacking aligns them automatically; the engine just scales the whole canvas to fit the layout.
- Two scopes: most slots render on the full figure; face/hair previews can use the bust.

## Assets & loading

- Path: `assets/parts/{category}/{id}.png` (+ `__{colorId}` for bakes). **Filenames = catalog ids.**
- Preload the current look's parts; lazy-load the rest.
- Missing asset → a neutral placeholder silhouette, so the app runs before all art exists (you'll start with just the 3 exemplars).

## Tray thumbnails

- Each option tile = that part rendered on a neutral chip (bust scope) or a tiny composited avatar — generate from the **same engine** at small size. Don't author separate thumbnail assets.

## Performance & determinism

- Memoize the resolved layer list; re-render only layers whose state changed.
- Same state → same pixels. This guarantees undo, save/restore, and consistent shuffle results, and keeps AI off the interaction hot path (all art is pre-generated).

## Build order

1. A Skia canvas that stacks a hardcoded set of parts in z-order (use the 3 exemplars).
2. Wire state → render; add the multiply recolor.
3. Connect the catalog so trays drive state.
4. Shuffle (random state) → undo (state history) → save (state → lookbook).
