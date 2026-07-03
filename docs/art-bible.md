# designMe — Art Bible (Asset Generation Spec)

The single source of truth for **how every avatar/catalog asset is generated** so the look is identical across hundreds of items. This document is the *law*; ChatGPT (image generation) is the *artist that follows it*; the Expo/React-Native engine is the *gallery that composes the parts*.

**How to use it:** start with **§0** below for exactly what to do — or jump straight to the companion worksheet **`art-prompts.md`**, where every item's prompt is already written for you. Sections §1–§9 here are the *reference spec* behind those prompts (and what Claude Code reads); you rarely touch them by hand.

## 0. How you'll actually do this  *(start here)*

Your whole job: turn each catalog item into **one transparent PNG named by its id**, then hand the folder to Claude Code, which stacks them into avatars. You never write a prompt from scratch and never glue sections together — `art-prompts.md` has all ~150 prompts pre-built.

**The move that makes it scale — set the style once, then feed one-liners:**

- **Manual (ChatGPT app):** Open one chat. Paste the style block (the `PREFIX` in `art-prompts.md`) as the first message and attach your locked exemplars — this *primes* the chat. Then for each item, just send its short one-line prompt from the worksheet. ChatGPT holds the style across the whole conversation, so item #150 still matches item #1. Save each image as the filename shown.
- **Auto (true scale):** the worksheet doubles as a manifest — Claude Code can run a short script that sends every line through an image-generation API (e.g. OpenAI's image API) and writes all the files named by id. You just review the grid and re-roll rejects.

**The loop, either way:**

1. **Prime once** — paste the style block + your 3 exemplars (make the 3 exemplars first; they define "correct").
2. **Generate** one item's one-liner.
3. **QA** — recognizable small? on-palette? clean transparent edges? (full checklist in §8).
4. **Save** as `category/id.png`, tick it off, next item.

**Two reminders that shrink the work:** generate color-driven parts in **one neutral tone** (the app recolors them — one hairstyle, not 18), and do **P0 first** (hair → face/skin/body → tops/bottoms → shoes/tools).

> **Supersedes the old constraints.** Earlier docs (`catalog-bible.md`, `catalog-integrity-report.md`) assumed "inline SVG only, PNGs dev-reference only, one self-contained file." That direction is retired. Raster parts generated to this spec **are** the production assets, composited at runtime by the engine on web and iPad. Determinism, recognition, dignity, and calm still hold — the file/format constraints do not.

> **Technique update (2026-07-03, verified in production runs — supersedes the per-category "item only" templates in §7):**
> 1. **Worn parts are generated on the figure, not in isolation.** Prompting a lone part ("hair only, no body") reliably breaks registration — the model centers and oversizes it. The pipeline (`tools/art-gen/generate.mjs`) instead renders the item WORN on the canonical base figure with the figure painted solid chroma-green; `key.py` strips the green deterministically, leaving the part pixel-registered. Face features come from ONE complete-face render split into layers (`face-split.py`).
> 2. **Everything is full-frame 1024×1536.** The §4 bust scope (1024×1024) is retired until the runtime engine has a head-box transform — it currently draws every layer full-frame.
> 3. **Hair renders as a full wig in front of the figure** (nothing occluded behind the head/back), because occluded strands are lost with the keyed mannequin. Consequence: the engine has a single front hair slot; the §4 hair-back layer waits for a back-slot + back-capture technique.

---

## 1. Non-negotiables (read before generating anything)

- **Generate parts, never whole looks.** One hairstyle, one top, one shoe — isolated. The product is mix-and-match; a baked "outfit" image destroys it. Assets = layers, not scenes.
- **Consistency is engineered, not hoped for.** Every prompt carries the *same* style preamble, the *same* palette lock, the *same* canvas + pose reference. Sameness in = sameness out.
- **Recognition over detail.** Each item must read instantly at small size. When detail and recognizability conflict, simplify.
- **Dignity + ordinary inclusion.** Assistive tech (wheelchair, cane, walker, AAC, hearing aids, cochlear implants) is drawn with the exact same warmth, palette, and care as fashion. Never clinical, never alarmist, never an afterthought.
- **Emotionally safe.** Bodies are non-evaluative. Crop/baby/corset tops stay tasteful and never sexualized. No "flattering/unflattering" framing anywhere.
- **Deterministic layering.** Every asset is a transparent, registered layer that drops onto a fixed skeleton (§4). Same inputs → same composition.

---

## 2. The Locked Style Preamble (paste at the top of EVERY prompt)

> **Lane LOCKED (2026-06-26): two-tone handcrafted.** Pure-flat and richer/rendered are both rejected (see CLAUDE.md decision #5). Every shape = flat base + one warm shadow + one soft highlight, kept as separate low-opacity layers so multiply-recolor preserves the shading. Do not drift toward gradients/3D (breaks recolor) or single-fill flat (reads clinical).

> Flat vector illustration in a warm, handcrafted, premium-calm style. Soft rounded forms, clean confident silhouette. Each shape is a flat base color shaded with **two** soft, low-contrast tones — a gentle warm shadow and a soft highlight — for a little handcrafted depth (matte, never glossy or 3D), plus a few minimal interior lines for read — **no** hard black outlines, **no** gradients, **no** airbrushing, **no** rendering or 3D, **no** photorealism, **no** texture noise. Even, soft lighting from above-center. Muted, earthy, low-arousal palette. Calm and dignified, never loud, never clinical, never busy. Centered subject, fully visible, not cropped. **Transparent background.** Single subject only. No text, no logos, no watermark, no ground shadow, no scene.

Keep this paragraph **byte-identical** across every generation. Changing wording is the #1 cause of style drift.

**Style anchors (one-liners that must stay true):** warm paper world · sage + terracotta accents · soft warm-brown shadow · generous rounding · "dignity through desirability" · all-ages, timeless (not childish, not teen-trendy).

---

## 3. Palette Lock

Assets use **only** these values. Paste the relevant block into the prompt. Hexes are the catalog's render-driving values — match them exactly so generated art and any engine tinting agree.

**Paper / brand (world + UI, rarely on parts):** bg `#ece7dc` · surface `#fbf8f2` · ink `#2f2823` · ink-soft `#6b5f53` · sage (primary) `#6f8f6a` · sage-deep `#3f5c3b` · terracotta (action) `#bd7a4f` · terracotta-deep `#8a5430`.

**Skin — 14 tones (never a light default; full range is required):**
`s1 #3b2a21` · `s2 #4a3328` · `s3 #5c3f30` · `s4 #6d4733` · `s5 #7c5a45` · `s6 #8a5a3f` · `s7 #9c6f4e` · `s8 #a87c58` · `s9 #bd8a5f` · `s10 #c99a6e` · `s11 #bca079` · `s12 #d3b48f` · `s13 #e3c4a2` · `s14 #efd4b8`

**Hair — 18 colors:**
`h1 #211c1a` · `h2 #2e221b` · `h3 #3f2b1f` · `h4 #5a3b27` · `h5 #6f4a2f` · `h6 #8a5a34` · `h7 #a87f4e` · `h8 #c8a968` · `h9 #dcc07a` · `h10 #e7ddc4` · `h11 #9a958d` · `h12 #cfcac3` · `h13 #9a4a36` · `h14 #c0673a` · `h15 #6f4a72` · `h16 #3f6f8a` · `h17 #3f8a78` · `h18 #c0708f`

**Garment — 16 colors:**
`oat #e6dcc6` · `clay #c08457` · `rust #a8553a` · `olive #7d8254` · `sage #8aa382` · `pine #46604b` · `teal #3f8a86` · `sky #8aa7bd` · `denim #5a6f8c` · `plum #7a5570` · `rose #d39aa3` · `mustard #cda14e` · `cocoa #5e4334` · `charcoal #3c3a38` · `cream #f1e9d8` · `terracotta #bd6f4f`

**Eyes — 6:** `brown #47321e` · `hazel #705436` · `green #4b6348` · `blue #608694` · `gray #7c858a` · `amethyst #644b7a`

**Makeup — 10:** `rose #c4607a` · `red #b23b43` · `berry #8a3a5e` · `coral #d9745e` · `nude #b07b66` · `plum #6f4a72` · `bronze #a86b3f` · `teal #3f8a86` · `violet #7a5fb0` · `gold #cda14e`

**Coordinated palettes (top / bottom pairings, for vibe reference only):** oat+graphite `#f1e9d8`/`#3c3a38` · moss+denim `#8aa382`/`#5a6f8c` · cocoa tonal `#a9764f`/`#5e4334` · cherry `#b23b43`/`#3c3a38` · silver `#cfcac3`/`#7a6f60` · washed blue `#8aa7bd`/`#3f6f7a` · plum smoke `#84647f`/`#3c3a47` · honey black `#cda14e`/`#29231f`

### 3a. The recolor rule (critical — read this)

The engine applies color *parametrically*: one shape, any of the palette values. So **generate the shape once as a tintable base**, not once per color:

- Generate color-driven parts (hair, tops, bottoms, skin, bags) as a **flat near-white/neutral master** (`#ece7dc`-ish) with the soft shadow and highlight as **separate low-opacity layers**. The engine tints the base to the chosen palette value and keeps the two-tone shading. → 1 hair master serves all 18 hair colors.
- Only **bake per-color** when tinting looks wrong (multi-tone items, denim wash, metallics). Bake just the colors that item actually needs.
- Parts whose color is *not* user-chosen (most assistive tech, glasses frames, default shoe trims) may be generated in their fixed palette value directly.

---

## 4. Composition, canvas & registration

Parts only stack correctly if they're drawn on a shared frame. Two scopes:

| Scope | Use | Canvas | Anchor |
|---|---|---|---|
| **Full figure** (`dmFigure`) | the studio avatar, vibes | **1024 × 1536** (2:3 portrait) | standing, centered on x=512; feet baseline at y≈1460; head crown at y≈110; one fixed neutral pose |
| **Bust** (`dmAvatar`) | small face/hair previews | **1024 × 1024** | head centered; shoulders meet bottom edge |

**Registration technique (do this, or parts won't line up):**

1. Keep one **canonical pose reference** image — the bare base figure in the fixed pose (neutral stand, arms slightly away from body, front-facing, relaxed). Generate it once; reuse it as a reference/ghost on *every* subsequent prompt so each part lands in the right place.
2. Generate each part **on the full canvas at its true position**, everything else transparent — e.g. a top occupies only the torso region; the rest of the 1024×1536 frame is empty. Do **not** generate the part centered-and-cropped; generate it where it lives.
3. Front-facing, symmetrical, neutral pose only. No dynamic poses, no perspective, no foreshortening.

**Layer z-order (back → front).** The engine composites in this order; generate each asset to sit cleanly in its slot:

1. Aura / background glow *(deferred — see §7)*
2. Mobility, behind-body (wheelchair rear frame & wheels; walker rear legs)
3. Body + skin (torso, arms, legs, neck)
4. Bottoms
5. Shoes (+ socks)
6. Top (base garment)
7. Outer layer (jacket / cardigan / open overshirt)
8. Carry (crossbody strap, backpack straps, handheld bag)
9. Neck jewelry (chain)
10. Hair — back layer
11. Head + ears (skin)
12. Skin features (freckles, vitiligo, birthmark, scar, blush)
13. Face: brows → eyes (+iris color) → nose → lips → makeup
14. Ear level: earrings, hearing aids, cochlear implants
15. Hair — front / fringe
16. Headwear (beanie, cap, bucket, **headscarf/hijab covers all hair**)
17. Glasses
18. Handheld: AAC tablet / board / letter board / iPad / cane (in hand, front)
19. Mobility, front (wheelchair front wheel & seat frame)

---

## 5. Output spec

- **Format:** PNG, transparent (straight alpha), sRGB. Export `@2x` (2048 × 3072 / 2048²) masters; downscale for runtime.
- **One subject. No background. No baked ground shadow** (contact shadow, if any, is a separate optional layer).
- **No text** anywhere — **except** AAC tablet, AAC board, and letter board, where simple generic communication symbols/letters are the point (use neutral pictograms and plain letters, never real-brand app UI).
- **Naming = catalog ids**, so the engine and prompts agree:
  `assets/parts/{category}/{id}.png` — e.g. `hair/braid.png`, `top/hoodie.png`, `aac/letterboard.png`.
  Per-color bakes: `{id}__{colorId}.png` (e.g. `bottom/barrelJean__denim.png`).
- Keep ChatGPT source/exploration outputs under `tools/art/_concepts/` (not shipped); shipped masters under `assets/parts/`.

---

## 6. Universal negative prompt (append to every prompt)

> No photorealism, no 3D render, no gradients, no airbrush, no hard black outlines, no texture noise, no background, no scene, no ground/drop shadow, no text or letters (except AAC items), no logos or brand marks, no multiple subjects, no cropping at frame edges, no harsh or high-contrast lighting, no clinical/medical styling, no sexualization, no exaggerated cartoon proportions, no neon or high-saturation color.

---

## 7. Per-category generation guides

Each guide = an **anchor rule**, a **color rule**, a **template** (prepend §2, append §6), and the **item list** (id · label · prompt seed). Generate **P0 first** (highest identity impact), then P1, then P2.

### Hair  *(scope: bust + full; tintable base, 18 colors)*
**Anchor:** sits on the canonical head; back mass behind head/shoulders, fringe over forehead. Leave the ear zone readable unless the style covers it. Must coexist with hearing tech and headwear — generate hair *without* hats. **Color:** tintable neutral master. **Template:** `[STYLE] A {label} hairstyle: {seed}. Clean flat silhouette, soft two-tone shading, a few recognizable strand lines, no face, no body — hair only. Centered on the canonical head. [canvas]. [NEGATIVE]`

> *The active hair list lives in `art-prompts.md`.*

| id | label | seed | pri |
|---|---|---|---|
| shaved | Shaved | very close shaved head, soft scalp shadow | P0 |
| bald | Bald | clean bald head, dignified shape | P0 |
| straightL | Straight long | long straight hair, simple silhouette | P0 |
| layers | Long layers | long layered hair, soft layer read | P0 |
| wavyM | Loose waves | loose waves, shoulder-to-chest | P0 |
| curtain | Curtain bangs | center-parted bangs framing the face | P0 |
| halfUp | Half-up waves | half-up tie with waves down | P0 |
| lowPony | Low ponytail | low ponytail at the nape | P0 |
| highPony | High ponytail | high ponytail with volume | P0 |
| lowBun | Low bun | smooth low bun at the nape | P0 |
| highBun | Top bun | bun high above the crown | P0 |
| braid | Side braid | one braid over the shoulder (rebuild the old PNG) | P0 |
| pigtails | Twin braids | two braids, one each side | P0 |
| definedCurls | Defined curls | defined curl clusters around the face | P0 |
| shortCrop | Short crop | short textured crop, soft edges | P1 |
| buzzCut | Buzz cut | even close buzz, visible hairline | P1 |
| pixie | Pixie cut | short pixie with side shape | P1 |
| taperFade | Taper fade | tapered sides, fuller top | P1 |
| bob | French bob | chin-length bob, soft curve | P1 |
| bigBlowout | Big blowout | rounded high-volume blowout | P1 |
| clawClip | Claw clip | hair twisted up in a claw clip | P1 |
| messyBun | Messy bun | loose bun with a few wisps | P1 |
| sleekBun | Sleek bun | smooth low/mid bun | P1 |

### Skin (body + face base)  *(scope: full + bust; tintable, 14 tones)*
**Anchor:** the canonical body & head fill. **Color:** generate one neutral master; engine tints to s1–s14. Add a single soft warm shadow on neck/under-chin/limb edges. **Template:** `[STYLE] The base figure body and head in a neutral front-facing stand, flat single-fill skin with one soft warm shadow, no clothing, no hair, no facial features — skin base only. [canvas]. [NEGATIVE]`
Always preview across the **full s1–s14 range**; never ship a light-skin default.

### Skin features  *(face overlays; scope: bust)*
**Anchor:** transparent overlay on the face/cheeks. **Color:** subtle, tone-aware. **Template:** `[STYLE] A subtle {label} overlay for the face: {seed}. Soft, low-contrast, dignified, transparent elsewhere — feature only. [NEGATIVE]`

| id | label | seed |
|---|---|---|
| freckles | Freckles | scattered soft freckles across nose & cheeks |
| vitiligo | Vitiligo | gentle de-pigmented patches, soft edges |
| birthmark | Birthmark | one soft natural birthmark |
| scar | Scar | one small understated scar |
| blush | Rosy cheeks | soft warm cheek blush |

### Face — shape · brows · eyes · nose · lips · makeup  *(scope: bust)*
**Anchor:** all face parts register to the canonical face box; generate each as an isolated overlay. **Color:** eyes use the eye palette; makeup uses the makeup palette; brows tint to hair color. **Template:** `[STYLE] A {label} {part}, front-facing, flat and soft, calm neutral expression, isolated on transparent — {part} only. [NEGATIVE]`

- **faceShape:** round · oval · square · heart · long · diamond *(these reshape the head silhouette; generate as head-shape masters)*
- **brow:** soft · straight · arched · bold · fine
- **eye:** round · almond · monolid · hooded · wide-set *(+ iris color: brown, hazel, green, blue, gray, amethyst)*
- **nose:** button · rounded · wide · narrow · long
- **lip:** full · wide · petite · bow · soft
- **makeup:** none · natural · eyeliner · smoky eye · bold lip · full glam · graphic liner · lashes *(tint with makeup palette)*

> Keep every expression **calm and neutral** by default — no forced big smile. Friendly, low-arousal.

### Body & height  *(scope: full; tintable skin)*
**Anchor:** the canonical pose; vary silhouette only. **Template:** `[STYLE] The base figure with a {label} build, neutral front stand, flat skin base, no clothing/hair/face — body silhouette only. [NEGATIVE]`

- **body:** lean · balanced · broad · curves · full  *(non-evaluative; all dignified, equal care)*
- **height:** shorter · short · medium · tall · taller  *(scale the same figure; keep proportions natural, not stretched)*

### Tops  *(scope: full; tintable garment color)*
**Anchor:** torso of the canonical figure; sleeves follow the arms; outer layers (cardigan, overshirt, jackets) sit in the *outer* slot over a base top. **Color:** tintable master. **Template:** `[STYLE] A {label} on the canonical torso: {seed}. Clean garment silhouette, soft fold shading, fabric only on the body — no head, no legs. [canvas]. [NEGATIVE]`

| id | label | seed | pri |
|---|---|---|---|
| plainTee | Plain tee | plain crew tee, no graphic | P0 |
| boxyTee | Boxy tee | relaxed boxy tee | P0 |
| longSleeveTee | Long sleeve tee | plain long-sleeve crew | P0 |
| ribTank | Rib tank | ribbed tank | P0 |
| sweater | Chunky knit | chunky knit sweater, soft rows | P0 |
| cardigan | Soft cardigan | soft open cardigan over a base | P0 |
| button | Relaxed shirt | relaxed button-up shirt | P0 |
| drapedShirt | Open overshirt | open overshirt over an inner layer | P0 |
| hoodie | Oversized hoodie | oversized hoodie, hood + pocket | P0 |
| sweatshirt | Oversized sweatshirt | oversized crew sweatshirt | P0 |
| babyTee | Baby tee | fitted baby tee (tasteful, never sexualized) | P1 |
| jersey | Graphic jersey | sport jersey, number/stripe | P1 |
| meshLayer | Mesh layer | sheer mesh layer, subtle | P1 |
| cropCorset | Crop corset | structured corset crop (tasteful) | P1 |
| asymKnit | Asymmetric knit | asymmetric one-shoulder knit | P1 |
| buttonCardigan | Button cardigan | button cardigan, placket + buttons | P1 |
| flannel | Flannel | soft plaid flannel | P1 |
| bomber | Bomber jacket | bomber, rib hem + zip | P1 |
| denimJacket | Denim jacket | classic denim jacket | P1 |
| blazer | Blazer | soft tailored blazer | P1 |
| utility | Utility vest | utility vest with pockets | P1 |
| shell | Trail jacket | lightweight trail/rain jacket | P1 |
| slipDress | Slip dress | satin slip dress (whole-piece top) | P1 |
| wrapTop | Wrap top | gentle diagonal wrap top | P1 |

### Bottoms  *(scope: full; tintable garment color)*
**Anchor:** waist-to-ankle on the canonical legs; skirts hang from the waist. **Template:** `[STYLE] A {label} on the canonical lower body: {seed}. Clean silhouette, soft fold shading, garment only — no torso, no shoes. [canvas]. [NEGATIVE]`

| id | label | seed | pri |
|---|---|---|---|
| straightJean | Straight-leg jeans | straight-leg denim, pockets + stitch | P0 |
| barrelJean | Barrel denim | curved barrel-leg denim | P0 |
| wideDenim | Wide-leg denim | wide-leg denim | P0 |
| wideTrouser | Wide trouser | clean wide trouser, soft crease | P0 |
| cargo | Cargo pant | cargo pants, readable pockets | P0 |
| joggers | Joggers | soft cuffed joggers | P0 |
| leggings | Leggings | simple fitted leggings | P0 |
| shorts | Relaxed shorts | relaxed soft shorts | P0 |
| midiSkirt | Midi skirt | soft-drape midi skirt | P0 |
| parachute | Parachute pant | ruched parachute pant | P1 |
| trackPant | Track pant | track pant, side stripe | P1 |
| bikeShorts | Bike shorts | fitted mid-thigh bike shorts | P1 |
| jorts | Baggy jorts | baggy denim shorts | P1 |
| miniSkirt | Mini skirt | simple clean mini skirt (tasteful) | P1 |
| pleatedSkirt | Pleated skirt | pleated skirt, few clear pleats | P1 |
| slipSkirt | Slip skirt | satin slip skirt, soft column | P1 |
| cargoMaxi | Cargo maxi | cargo maxi skirt, restrained pockets | P1 |
| maxiSkirt | Maxi skirt | plain long maxi skirt | P1 |
| dressPants | Dress pants | clean creased dress pants | P1 |
| chinos | Chinos | casual relaxed chinos | P2 |

### Shoes  *(scope: full; mostly fixed/per-color)*
**Anchor:** on the feet at the baseline, side-3/4 readable. **Template:** `[STYLE] A pair of {label}: {seed}. Clean flat shoe silhouette, soft sole shading, shoes only. [NEGATIVE]`

| id | label | seed | pri |
|---|---|---|---|
| classicSneaker | Classic sneaker | neutral white classic sneaker | P0 |
| sneaker | Color sneaker | colorful casual sneaker | P0 |
| runner | Chunky runner | chunky running shoe | P0 |
| loafer | Soft loafer | soft slip-on loafer | P0 |
| mary | Mary Jane | mary jane with strap | P0 |
| slide | Cloud slide | cushioned slide sandal | P0 |
| skateShoe | Skate shoe | low flat skate shoe | P1 |
| boot | Platform boot | chunky platform boot | P1 |
| combatBoot | Combat boot | lace-up combat boot | P1 |
| chelseaBoot | Chelsea boot | sleek chelsea boot, elastic panel | P1 |
| balletFlat | Ballet flat | simple ballet flat | P1 |
| hikingShoe | Hiking shoe | rugged hiking shoe | P1 |

### Carry / bags  *(scope: full; distinct silhouettes — do not differ by color alone)*
**Anchor:** worn on the body — crossbody strap diagonal, backpack straps over shoulders, totes/handhelds at the side. **Template:** `[STYLE] A {label}: {seed}. Distinct recognizable bag silhouette, soft shading, bag (+ strap) only. [NEGATIVE]`

| id | label | seed | pri |
|---|---|---|---|
| crossbody | Crossbody | small crossbody on a diagonal strap | P0 |
| tote | Soft tote | soft slouchy tote at the side | P0 |
| backpack | Backpack | rounded backpack, shoulder straps | P0 |
| canvasTote | Canvas tote | square canvas tote | P1 |
| mini | Mini bag | small structured mini bag | P1 |
| beltbag | Belt bag | compact belt bag across the body | P1 |
| messenger | Messenger bag | rectangular messenger + strap | P1 |
| laptopBag | Laptop bag | structured laptop bag with handle | P2 |
| gymBag | Gym bag | soft rounded duffel, carried low | P2 |

### Headwear  *(scope: bust; sits over hair)*
**Anchor:** over the crown/hair. **Headscarf/hijab covers all hair** (generate as full coverage). **Template:** `[STYLE] A {label}: {seed}. Sits naturally over the head, soft shading, headwear only. [NEGATIVE]`

| id | label | seed | pri |
|---|---|---|---|
| headscarf | Headscarf / hijab | respectful full hair coverage, soft drape, several wrap variants | P0 |
| beanie | Beanie | soft folded beanie | P1 |
| baseballCap | Baseball cap | curved-brim cap | P1 |
| bucketHat | Bucket hat | soft down-brim bucket hat | P1 |

### Glasses  *(scope: bust; fixed frame palette)*
**Anchor:** over the eyes, bridging the nose, arms to the ears. **Template:** `[STYLE] A pair of {label}: {seed}. Thin clean frame, lenses transparent, eyewear only. [NEGATIVE]`

| id | label | seed | pri |
|---|---|---|---|
| round | Round glasses | round frames | P0 |
| rect | Rectangle glasses | rectangular frames | P0 |
| cat | Cat-eye glasses | cat-eye frames | P1 |
| thickFrame | Thick frame glasses | heavier bold frames | P1 |
| tinted | Tinted lenses | soft tinted lenses, accessible contrast | P2 |

### Jewelry  *(scope: bust; studs vs hoops must be visually distinct)*
**Template:** `[STYLE] {label}: {seed}. Small, tasteful, soft metallic, jewelry only. [NEGATIVE]`

| id | label | seed | pri |
|---|---|---|---|
| studs | Ear studs | small ear studs | P1 |
| hoops | Hoop earrings | clean hoop earrings | P1 |
| chain | Gold chain | simple gold neck chain | P1 |
| pearl | Pearl drop | pearl drop earrings | P2 |
| rings | Rings | a few simple finger rings | P2 |
| watch | Watch | wristwatch, band + face | P2 |

### Hearing & assistive ear tech  *(scope: bust; ordinary, never clinical; side-specific)*
**Anchor:** on/behind the ear. Generate **L and R separately** — sides carry meaning. **Template:** `[STYLE] A {label}: {seed}. Modern, neat, ordinary — like a small everyday device. Ear tech only. [NEGATIVE]`

| id | label | seed | pri |
|---|---|---|---|
| ha_r | Hearing aid (R) | behind-the-ear hearing aid, right ear | P0 |
| ha_l | Hearing aid (L) | behind-the-ear hearing aid, left ear | P0 |
| ci_both | Cochlear implants | cochlear implant + coil, both sides | P0 |

### Sensory tools  *(scope: bust)*
| id | label | seed | pri |
|---|---|---|---|
| noiseHeadphones | Noise-reducing headphones | over-ear headphones, calm everyday style | P0 |
| headphones | Headphones | over-ear headphones, headband + cups | P1 |

### Mobility  *(scope: full; ordinary, dignified; spans behind+front layers)*
**Anchor:** wheelchair = the figure seated (needs a **seated pose** variant of the base body); cane in one hand; walker in front. Split wheelchair into **rear** (behind body) and **front** (over lower body) layers per §4. **Template:** `[STYLE] A {label}: {seed}. Clean modern equipment, warm and ordinary — never medical or alarmist. Equipment only (note seated-pose dependency for the chair). [NEGATIVE]`

| id | label | seed | pri |
|---|---|---|---|
| wheelchair | Wheelchair | everyday manual wheelchair (rear + front layers; seated base body) | P0 |
| cane | Cane | simple walking cane held at the side | P0 |
| walker | Walker | modern walker/rollator in front of the figure | P0 |

### AAC / communication  *(scope: full; held in hand — text/symbols ALLOWED here)*
**Anchor:** held in front at chest/hand level. **Template:** `[STYLE] A {label}: {seed}. Held naturally; simple generic communication symbols/letters (no real app UI, no brand). Device only. [NEGATIVE — but allow plain symbols/letters]`

| id | label | seed | pri |
|---|---|---|---|
| tablet | AAC tablet | speech tablet with a simple symbol grid | P0 |
| board | AAC board | low-tech board with picture symbols | P0 |
| letterboard | Letter board | letter board with plain A–Z grid | P0 |
| ipad | iPad | plain consumer tablet, neutral screen | P1 |
| medicalBracelet | Medical bracelet | simple wrist medical-ID band, not alarmist | P2 |

### Vibes  *(composite REFERENCE only — never a single baked asset)*
Vibes are **recipes**, not images: the engine assembles existing part assets. Use these only as *style-direction references* when generating the underlying parts, and (optionally) to render a thumbnail by composing real layers. P0 vibes: Weekend Easy, Cozy Knit, Linen Calm, Gentle Movement, Quiet Tailoring, Soft Street, Utility Street, Skate Easy, Creative Studio, Athleisure, Trail Utility, Airport Fit. *(Full recipes live in `catalog-bible.md` / `catalog-audit.md`.)*

### Fabric texture  *(garment finish — subtle, not a standalone asset)*
A light surface treatment on tops/bottoms: `soft` · `smooth` · `breathable` · `cozy`. Bake as a **very subtle** hint into the tintable garment master (faint knit/weave), or skip it — keep low-arousal, never noisy. Do not generate separate texture assets.

### Piercings  *(deferred — P2)*
`nostril` · `septum` · `eyebrow` · `snakebites`. Per the catalog bible, defer until main-renderer parity is solved. When built: tiny, tasteful, transparent face overlays, treated like jewelry.

### Aura  *(deferred)*
Background glow tints (`a_sun #f9e7c3`, `a_forest #d2dfd6`, `a_lilac #e4d5ea`, `a_sky #d5e5ea`, `a_rose #ead5d8`). Per the catalog bible, **defer from MVP** — only build if it never competes with avatar recognition. If built: a single soft radial wash behind the figure, nothing more.

---

## 8. Workflow: exemplars → generate → QA

1. **Lock 3 exemplars first.** Before mass production, generate 3 finished hero parts you love (e.g. `definedCurls`, `hoodie`, `wheelchair`). These define "correct." Save them and **attach them as style references** on every later prompt. Re-lock if drift creeps in.
2. **Generate by priority** (P0 → P1 → P2) and by category, reusing preamble + palette + pose reference verbatim.
3. **QA checklist — every asset must pass:**
   - Recognizable at ~64px? (the recognition test)
   - Dignified, calm, non-clinical, non-sexualized?
   - On-palette (only §3 values)?
   - Layers cleanly: transparent bg, correct registration on the canonical frame, sits in its z-slot?
   - Consistent line/fill/shadow weight with its siblings? (hold it next to an exemplar)
   - Tintable master (or correct per-color bake)?
   - Filename = catalog id?
4. **Iterate against the exemplar**, not against words — if it drifts, regenerate with the exemplar reference, don't hand-tune prompts.

## 9. Catalog-specific watch-outs (from the audit)

- `braid` was a PNG hack routed to `_art/sideBraid_cut.png` — regenerate it properly to this spec.
- Studs vs hoops, and the carry bags, must be **distinct silhouettes** — the old engine collapsed them.
- Hearing aids are **side-specific** (L/R) — generate both, don't merge.
- Bodies non-evaluative; baby tee / crop / corset tasteful — never sexualized.
- AAC + letter board are the **only** items that may show text/symbols.
- Keep new ids **semantic** (`sideBraid`, `classicSneaker`), not implementation shorthand.
- Generation order that maximizes payoff: **hair → skin/body/face → tops/bottoms → shoes/carry/tools → vibes**, since hair and face drive recognition most.
