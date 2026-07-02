# Avatar parts — drop your ChatGPT PNGs here

This is the art that the **PNG compositor** stacks to build the avatar. The shipped
SVG engine (`src/engine/dmFigure.js`) stays as a placeholder until these fill in; flip
the **PNG** toggle in the Studio header to see this pipeline.

## How to add a part

1. Generate the PNG in ChatGPT per `docs/art-prompts.md` (full-figure parts on the
   **1024×1536** canvas, face-level parts on **1024×1024** — full-frame, transparent,
   the piece in its true position, **not** centered-and-cropped).
2. Save it here as `{category}/{id}.png` — the filename **must** equal the catalog id
   from `src/dm.ts`. Examples:
   - `body/balanced.png`, `body/curvy.png`
   - `hair/waves.png`, `hair/sideBraid.png`
   - `top/hoodie.png`, `bottom/barrelJean.png`, `shoe/sneaker.png`
3. Register it: add one line to `src/parts/registry.ts` (Metro can't see files unless
   they're `require()`d). The file tells you the exact line to copy.

That's it — it shows up on the avatar, and tintable parts (hair, body, garments)
recolor automatically.

## What's tintable

`body` (skin tone), `hair` (hair color), `top`/`bottom`/`layer` (garment color) are
**neutral masters** — draw them flat warm near-white with soft two-tone shading; the
app multiplies the chosen color over them. Fixed-color parts (`shoe`, `glasses`,
`hearing`, `jewelry`, `carry`, `feature`) ship as drawn — no tint.

> First file to make: **`body/balanced.png`** (the base body). Everything else is
> generated *on top of it* as an alignment reference. See `docs/art-prompts.md`.
