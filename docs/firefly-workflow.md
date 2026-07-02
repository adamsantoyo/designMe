# designMe — Adobe Firefly workflow (complete avatar + outfit)

The Firefly-specific companion to `art-prompts.md`. **Do not paste the ChatGPT PREFIX
into Firefly** — Firefly works differently: short descriptive prompts + UI controls
(style reference, composition reference, effects) carry the style, not prose.
Verified against the Firefly web app, July 2026.

## The three controls that make this work

| Firefly control | What it does for us |
|---|---|
| **Composition → Reference** (upload + Strength) | Registration. Upload the canonical body; every part lands in position. Strength ~80. |
| **Styles → Reference** (upload + Strength) | Consistency. Upload your locked exemplar; item #40 matches item #1. Strength ~60. |
| **Transparent background** (Remove background toggle, or "isolated on transparent background" in the prompt) | Clean alpha for layering. Always on. |

**Fixed settings for every generation:** Model = newest Firefly Image model ·
Aspect ratio = the tallest **portrait** option, the SAME one every time ·
Styles → Effects = **Flat design** (or nearest flat/vector-look preset) ·
Visual intensity = low-medium. Consistency of settings matters more than the
specific choices — never vary them between parts.

## One-time setup

```
python3 -m venv tools/art-lab/.venv
tools/art-lab/.venv/bin/pip install pillow vtracer
```

Every downloaded image goes through the ingest tool (cleans halos, registers onto the
1024×1536 canvas, drops it into the app, prints the registry line):

```
tools/art-lab/.venv/bin/python tools/art-lab/ingest.py ~/Downloads/Firefly.png hair/waves
```

## Build order (each step ~2–5 minutes + re-rolls)

> Filenames below use the **current app catalog ids** (`app/src/dm.ts`), so parts show
> up in the app immediately. Run `node tools/check-art-ids.mjs` before any mass batch —
> the catalog↔worksheet rename is still pending.

### Step 0 — the canonical body (`body/balanced`)
> **The undressed state is a designed state.** You (and QA) will see the bare figure
> constantly during development. It must read as a friendly, simplified mannequin —
> never as an unclothed person. That means: rounded simplified silhouette, smooth
> shapes, NO anatomical definition (no navel, no chest/muscle lines, no detailed
> feet/hands), adult-neutral proportions (av2 skews young — replace it).

> Full-body front-facing standing figure, gently stylized and simplified, adult
> proportions with a soft rounded silhouette, smooth simple shapes, arms relaxed
> slightly away from the body, simplified rounded hands, flat matte illustration in
> pale warm ivory with one very soft warm-gray shadow, minimal interior detail, no
> anatomical definition, no navel, no chest or muscle lines, no facial features, no
> hair, no clothing, isolated on transparent background

No references on this one. Re-roll until it reads "friendly mannequin" — this single
image sets the tone for everything stacked on it and becomes the composition reference
for every other part, so it is worth ten re-rolls. Download PNG (transparent), ingest
as `body/balanced`.

### Step 1 — face overlays (`face/smile`, `face/soft`, `face/calm`) — BEFORE anything else
**Hard rule: never evaluate, screenshot, or share a composite without a face.** A
faceless figure is uncanny; judging in-progress stacks that way poisons every art
decision. Faces come immediately after the body, before hair or garments.

Same full-figure frame (the compositor stacks everything on one canvas — never use a
square/bust frame). Composition ref: canonical body (90).

> Minimal facial features only, floating at head height of a standing figure: two
> simple dark-brown oval eyes, thin soft eyebrows, a small curved nose line, and a
> gentle closed-mouth smile, flat matte style, no head outline, no skin, no hair,
> isolated on transparent background

For `soft`: "…a small relaxed nearly-flat mouth with the softest upturn…" ·
For `calm`: "…a small neutral resting mouth, peaceful expression…"
Keep expressions low-arousal — no big grins.

### Step 2 — hair (`hair/waves`, the sister set's loose waves)
Composition ref: canonical body (80). Style ref: `_art/wavy_transp.png` (the master you love).

> Long loose wavy hair only, shoulder-to-chest length, center part, cut-paper flat
> illustration in pale warm ivory with soft warm-gray shadow shapes between the waves,
> an empty gap where the face would be, no head, no face, no body, floating in the
> position it would sit on a standing figure, isolated on transparent background

Ingest as `hair/waves`. Repeat with adjusted one-liners for the rest of the sister set
(`sleekPony`, `lowPony`, `bun`, `lowBun`, `sideBraid`, `doubleBraids`, `halfUp`,
`long`, `curly`) — change only the style description words, nothing else.

### Step 3 — top (`top/boxyTee`)
Composition ref: canonical body (80). Style ref: your best result so far.

> A relaxed boxy short-sleeve t-shirt worn by an invisible person, ghost mannequin
> style, crew neck, pale warm ivory fabric with soft warm-gray fold shadows, flat
> matte illustration, garment only floating at torso position of a standing figure,
> no body, no head, no arms, isolated on transparent background

### Step 4 — bottom (`bottom/barrelJean`)

> Barrel-leg jeans worn by an invisible person, ghost mannequin style, curved wide
> legs tapering at the ankle, pale warm ivory fabric with soft warm-gray fold shadows
> and a few simple stitch lines, flat matte illustration, garment only floating at leg
> position of a standing figure, no torso, no shoes, isolated on transparent background

### Step 5 — shoes (`shoe/sneaker`)
Shoes are fixed-color (not tinted) — generate in the real color, not ivory.

> A pair of simple low-top sneakers seen from the front, side by side at the feet
> position of a standing figure, soft rounded shapes, warm off-white with a muted
> warm-gray sole and soft shading, flat matte illustration, shoes only, isolated on
> transparent background

### Step 6 — wire and check
1. Paste each printed `require()` line into `app/src/parts/registry.ts`.
2. `cd app && npm run web` → tap the **SVG** chip → **PNG**: the full figure composes.
3. QA each part per `art-bible.md` §8: recognizable at 64px, on-palette, dignified,
   registered (no floating offsets), tintable.

## Re-roll rules

- Wrong position → raise Composition strength; make the "floating at … position of a
  standing figure" phrase the FIRST clause of the prompt.
- Style drift → re-attach the style reference, raise its strength; never rewrite the
  whole prompt — change only the noun phrases.
- Baked background / halo → confirm transparent output; ingest strips small halos,
  but a baked scene means re-roll.
- **Baked checkerboard** → partner models (GPT Image, Ideogram) may DRAW a fake
  transparency checkerboard instead of outputting real alpha. `ingest.py` detects
  missing alpha and refuses; rescue warm-toned subjects with `--key-checker`, or
  regenerate on the native Firefly model with transparent background. Verify every
  download: real transparency shows as the checker *changing* when you drag the file
  over different backgrounds.
- Garment drawn ON a body → strengthen "ghost mannequin style" + "invisible person",
  and re-roll; never accept a body baked into a garment.
- Composite looks off/uncanny → check the parts count first. In dev, PNG mode labels
  incomplete stacks ("3/6 parts") — an unlabeled judgement of a partial composite is
  how the faceless-nude-body scare happened. Complete body+face+top+bottom before
  judging the direction.

## The Vector module (optional, for garments)

Firefly web's **Vector module → Text to vector** (content type: *Subject*) downloads
native `.svg` — no trace step. The app can't consume SVG parts yet (PNG compositor);
until it can, ALSO download the PNG rendition for the app and keep the `.svg` in
`tools/art-lab/out/` for the upcoming vector runtime. Same prompts work.

## Known limits (honest)

- Composition reference is approximate, not pixel-exact — expect to re-roll ~1 in 3
  parts, and use the QA overlay (compare against `body/balanced` at 50% opacity).
- Deep-tone recolor still uses multiply in the app today (crushes shading on black
  hair / deepest skin — see `tools/art-lab/compare.html`). The ramp/SVG runtime fix
  is planned; generate masters correctly (near-white, two-tone) and they'll benefit
  automatically when it lands.
