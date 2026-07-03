# designMe — Art Prompt Worksheet

Every catalog item, pre-written. This is the file you *work from*. (The full rules live in `art-bible.md`; you don't need them open to do this.)

## How to run it

**Manual (ChatGPT app):** paste **PREFIX** (below) as the first message in a fresh chat (and, once you've made them, attach your 3 exemplars as references) → then send each item line one at a time → save each result as the `filename` shown. The PREFIX holds the style + standing rules, so you only send the short line each time.

**Auto (at scale):** hand this file to Claude Code → it appends PREFIX + line + SUFFIX for every item, calls an image API, and writes all files named by id. You just QA the output.

**Rules of thumb:** do the ★ exemplars first. Do P0 before P1/P2. "neutral tone" = generate once in a flat warm near-white so the app recolors it (don't make one per color). Transparent background, single subject, no scene — always. **Full-frame at true position, never cropped to the item** (see Canvas & size below) — this is what lets the app stack parts with no nudging.

---

## PREFIX  — paste once to prime the chat

```
Flat vector illustration in a warm, handcrafted, premium-calm style. Soft rounded
forms, clean confident silhouette. Each shape is a flat base color shaded with two
soft, low-contrast tones — a warm shadow and a soft highlight — for gentle handcrafted
depth (matte, never glossy or 3D), plus a few minimal interior lines. No hard outlines,
no gradients beyond those two tones, no photorealism, no texture noise. Even soft lighting
from above. Muted, earthy, low-arousal palette (warm paper, sage, terracotta). Calm
and dignified, never loud, clinical, or busy. Single isolated subject, drawn at the
position it occupies on the figure (see Canvas, below) — not centered in its own box.
Export as a PNG with real alpha transparency. Outside the subject must be
transparent alpha only — no checkerboard pattern, no white/paper background, no colored
background, no scene, no shadow, no glow, no text, no logos.

I'll send items one at a time — generate each as its own image. Standing rules for
every item unless I say otherwise: it's a single isolated piece on a fully transparent
background (just that part — no person, face, or body, unless the item itself is a face
or skin part); render hair, clothing, and bags in one flat neutral warm tone so they
can be recolored later; render objects (shoes, glasses, devices, mobility aids) in the
muted color I name or a warm-muted default. Keep this exact style on every image.

Canvas: render on a 1024×1536 transparent portrait frame, one fixed neutral
front-facing standing pose, subject centered on the vertical midline (x≈512), head
crown near y≈110, feet near y≈1460. Place each part exactly where it sits on that
figure — a top fills only the torso region, shoes sit at the feet — and leave the
entire rest of the frame transparent. Do not center-and-crop the part. For the
face-level items I mark "bust" (face, glasses, jewelry, hearing), use a 1024×1024
frame instead, head centered, shoulders meeting the bottom edge.
```

## SUFFIX — only for Auto mode (a primed manual chat already has this)

```
Avoid: photorealism, 3D, gradients, airbrush, hard outlines, background, drop shadow,
text/logos (except AAC items), multiple subjects, cropping, harsh lighting, neon or
high-saturation color, anything clinical or sexualized.
```

---

## Canvas & size — the two frames, paste-ready

Two sizes, both **native ChatGPT output** (no resizing). Every part is the **full canvas size, never cropped to the item** — a part is mostly transparent with the piece in its true spot. That's what lets the app stack them with zero per-piece nudging.

| Scope | Size | Use for |
|---|---|---|
| **Full figure** | **1024 × 1536** (portrait) | the avatar + everything worn on the body: skin/body base, hair, tops, bottoms, shoes, bags, mobility, headwear |
| **Bust** | **1024 × 1024** (square) | face-level detail: face shapes, brows, eyes, nose, lips, makeup, skin features, glasses, earrings, hearing aids |

Drop the matching block in wherever a template says `[canvas]`:

**Full-figure `[canvas]`:**
```
On a 1024×1536 transparent portrait canvas. One fixed, neutral, front-facing
standing pose. Subject centered on the vertical midline (x=512), head crown near
y=110, feet near y=1460. Draw the part exactly where it sits on a full standing
figure; the entire rest of the frame is transparent alpha.
```

**Bust `[canvas]`:**
```
On a 1024×1024 transparent canvas. Head centered, shoulders meeting the bottom
edge, same fixed front-facing pose. Draw only this part in its true position;
the rest of the frame is transparent alpha.
```

**Scaling:** 1024×1536 is the master; the app only ever scales it *down* (thumbnails → full iPad), so it stays crisp everywhere. Don't make separate thumbnails. For razor-sharp 3× retina at full size, upscale finished masters to **2048×3072** (a batch step — ask and I'll script it).

**Generate in this order** (so parts register to a shared skeleton): **`skin/base.png` first**, then attach it as a reference for the 3 exemplars and everything after — "place this on the body, keep the body invisible, output only the part at the same size and position." The face-level *bust* items can wait until the base body exists, so we can measure the head box.

---

## Exemplars — make these 3 first

Before anything else, generate the three ★ items below — **defined curls** (`hair/definedCurls.png`), **hoodie** (`top/hoodie.png`), and **wheelchair** (`mobility/wheelchair.png`). They lock the three hardest cases: organic hair, draped fabric, and a warm-not-clinical object. Make them exactly like every other item — PREFIX once, then send the short line — then pick the versions you love and **attach them to the chat as reference images** so everything after inherits the look.

> If your sister has a signature hairstyle, make **that** the hair exemplar instead — it's the one we should nail first. And the wheelchair short line says "whole chair" only to lock the style; the rear/front layer split + seated-body alignment come later when you produce it for real.

---

## Items

Format: `- [ ] filename — one-line prompt` · `(P1)`/`(P2)` marks lower priority · `★` = make first as an exemplar.

### Hair  *(neutral tone for recoloring · hair only, no face/body)*

- [ ] `hair/definedCurls.png` — ★ defined curls framing the face, soft and springy
- [ ] `hair/longCurly.png` — long curly hair falling past the shoulders
- [ ] `hair/wavyM.png` — loose waves falling shoulder-to-chest
- [ ] `hair/straightL.png` — long straight hair, simple silhouette
- [ ] `hair/layers.png` — long layered hair with a soft layer read
- [ ] `hair/bigBlowout.png` — a rounded high-volume blowout
- [ ] `hair/curtain.png` — center-parted curtain bangs framing the face
- [ ] `hair/halfUp.png` — a half-up tie with waves down
- [ ] `hair/lowPony.png` — a relaxed ponytail tied low behind the head, tail resting over one shoulder
- [ ] `hair/highPony.png` — a high ponytail with volume
- [ ] `hair/lowBun.png` — a smooth low bun at the nape
- [ ] `hair/highBun.png` — a bun high above the crown
- [ ] `hair/sleekBun.png` — a smooth sleek low/mid bun
- [ ] `hair/messyBun.png` — a loose messy bun with a few wisps
- [ ] `hair/braid.png` — one braid resting over the shoulder
- [ ] `hair/pigtails.png` — two braids, one on each side
- [ ] `hair/clawClip.png` — hair twisted up in a claw clip
- [ ] `hair/bob.png` — a chin-length bob with a soft curve
- [ ] `hair/shaved.png` — (P1) a very close shaved head with soft scalp shadow
- [ ] `hair/bald.png` — (P1) a clean, dignified bald head
- [ ] `hair/shortCrop.png` — (P1) a short textured crop with soft edges
- [ ] `hair/buzzCut.png` — (P1) an even close buzz with a visible hairline
- [ ] `hair/pixie.png` — (P1) a short pixie with a clear side shape
- [ ] `hair/taperFade.png` — (P1) tapered sides with a fuller top

### Skin & body  *(neutral tone for recoloring · base figure, no clothing/hair/face)*

- [ ] `skin/base.png` — the base figure: a friendly, dignified adult mannequin (body + head), neutral front stand; ONE flat warm near-white paper tone over the whole figure (recolor master — not a realistic skin color) plus only the two soft shading tones; smooth simplified surface, no anatomical detail (no chest/nipple/navel/muscle marks); completely blank face — no eyes, brows, nose, mouth, or ears drawn (facial features are separate overlay parts); die-cut sticker edge: the silhouette outline is crisp and the surrounding transparency is 100% empty — absolutely no soft outer glow, bloom, halo, backlight, vignette, or light rays around the figure (override any soft-lighting instruction for this item)
- [ ] `body/lean.png` — base figure with a lean build
- [ ] `body/balanced.png` — base figure with a balanced build
- [ ] `body/broad.png` — base figure with a broad build
- [ ] `body/curves.png` — base figure with a soft, gently rounded silhouette — an abstract friendly mannequin build, smooth simplified surface, no anatomical detail
- [ ] `body/full.png` — base figure with a full build
- [ ] `body/seated.png` — base figure seated upright (needed for the wheelchair)
- [ ] `height/_note` — height = scale the base figure (shorter→taller); no separate asset

### Face  *(bust scope · isolated overlays on the canonical face · calm neutral expression)*

- [ ] `faceShape/oval.png` — soft oval head-shape master
- [ ] `faceShape/round.png` — round head-shape master
- [ ] `faceShape/square.png` — square head-shape master
- [ ] `faceShape/heart.png` — heart head-shape master
- [ ] `faceShape/long.png` — long head-shape master
- [ ] `faceShape/diamond.png` — diamond head-shape master
- [ ] `brow/soft.png` — soft brow shape, tint to hair color
- [ ] `brow/straight.png` — straight brow shape, tint to hair color
- [ ] `brow/arched.png` — arched brow shape, tint to hair color
- [ ] `brow/bold.png` — bold brow shape, tint to hair color
- [ ] `brow/fine.png` — fine brow shape, tint to hair color
- [ ] `eye/almond.png` — almond eye shape; iris recolored to brown/hazel/green/blue/gray/amethyst
- [ ] `eye/round.png` — round eye shape; iris recolored to brown/hazel/green/blue/gray/amethyst
- [ ] `eye/monolid.png` — monolid eye shape; iris recolored to brown/hazel/green/blue/gray/amethyst
- [ ] `eye/hooded.png` — hooded eye shape; iris recolored to brown/hazel/green/blue/gray/amethyst
- [ ] `eye/wide.png` — wide eye shape; iris recolored to brown/hazel/green/blue/gray/amethyst
- [ ] `nose/rounded.png` — rounded nose shape
- [ ] `nose/button.png` — button nose shape
- [ ] `nose/wide.png` — wide nose shape
- [ ] `nose/narrow.png` — narrow nose shape
- [ ] `nose/long.png` — long nose shape
- [ ] `lip/soft.png` — soft lip shape, skin-toned
- [ ] `lip/full.png` — full lip shape, skin-toned
- [ ] `lip/wide.png` — wide lip shape, skin-toned
- [ ] `lip/petite.png` — petite lip shape, skin-toned
- [ ] `lip/bow.png` — bow lip shape, skin-toned
- [ ] `makeup/natural.png` — natural makeup overlay, tint to the makeup colors
- [ ] `makeup/liner.png` — liner makeup overlay, tint to the makeup colors
- [ ] `makeup/smoky.png` — smoky makeup overlay, tint to the makeup colors
- [ ] `makeup/bold.png` — bold makeup overlay, tint to the makeup colors
- [ ] `makeup/glam.png` — glam makeup overlay, tint to the makeup colors
- [ ] `makeup/graphic.png` — graphic makeup overlay, tint to the makeup colors
- [ ] `makeup/lashes.png` — lashes makeup overlay, tint to the makeup colors

### Skin features  *(subtle, dignified, transparent face overlays)*

- [ ] `feature/freckles.png` — soft freckles scattered across nose & cheeks
- [ ] `feature/vitiligo.png` — gentle de-pigmented patches with soft edges
- [ ] `feature/birthmark.png` — one soft, natural birthmark
- [ ] `feature/scar.png` — one small, understated scar
- [ ] `feature/blush.png` — soft warm cheek blush

### Tops  *(neutral tone for recoloring · ghost-mannequin — worn on an invisible figure, torso only, no head/legs)*

- [ ] `top/hoodie.png` — ★ an oversized hoodie with hood and pocket
- [ ] `top/plainTee.png` — a plain crew tee, no graphic
- [ ] `top/boxyTee.png` — a relaxed boxy tee
- [ ] `top/longSleeveTee.png` — a plain long-sleeve crew
- [ ] `top/ribTank.png` — a ribbed tank
- [ ] `top/sweater.png` — a chunky knit sweater with soft rows
- [ ] `top/cardigan.png` — a soft open cardigan over a base layer
- [ ] `top/button.png` — a relaxed button-up shirt
- [ ] `top/drapedShirt.png` — an open overshirt over an inner layer
- [ ] `top/sweatshirt.png` — an oversized crew sweatshirt
- [ ] `top/babyTee.png` — (P1) a fitted baby tee, tasteful
- [ ] `top/jersey.png` — (P1) a sport jersey with a number/stripe
- [ ] `top/meshLayer.png` — (P1) a subtle sheer mesh layer
- [ ] `top/cropCorset.png` — (P1) a structured corset crop, tasteful
- [ ] `top/asymKnit.png` — (P1) an asymmetric one-shoulder knit
- [ ] `top/buttonCardigan.png` — (P1) a button cardigan with placket + buttons
- [ ] `top/flannel.png` — (P1) a soft plaid flannel
- [ ] `top/bomber.png` — (P1) a bomber jacket, rib hem + zip
- [ ] `top/denimJacket.png` — (P1) a classic denim jacket
- [ ] `top/blazer.png` — (P1) a soft tailored blazer
- [ ] `top/utility.png` — (P1) a utility vest with pockets
- [ ] `top/shell.png` — (P1) a lightweight trail/rain jacket
- [ ] `top/slipDress.png` — (P1) a satin slip dress (whole-piece)
- [ ] `top/wrapTop.png` — (P1) a gentle diagonal wrap top

### Bottoms  *(neutral tone for recoloring · ghost-mannequin — worn on invisible legs, lower body only, no torso/shoes)*

- [ ] `bottom/straightJean.png` — straight-leg denim with pockets + stitch
- [ ] `bottom/barrelJean.png` — curved barrel-leg denim
- [ ] `bottom/wideDenim.png` — wide-leg denim
- [ ] `bottom/wideTrouser.png` — a clean wide trouser with a soft crease
- [ ] `bottom/cargo.png` — cargo pants with readable pockets
- [ ] `bottom/joggers.png` — soft cuffed joggers
- [ ] `bottom/leggings.png` — simple fitted leggings
- [ ] `bottom/shorts.png` — relaxed soft shorts
- [ ] `bottom/midiSkirt.png` — a soft-drape midi skirt
- [ ] `bottom/parachute.png` — (P1) a ruched parachute pant
- [ ] `bottom/trackPant.png` — (P1) a track pant with a side stripe
- [ ] `bottom/bikeShorts.png` — (P1) fitted mid-thigh bike shorts
- [ ] `bottom/jorts.png` — (P1) baggy denim shorts
- [ ] `bottom/miniSkirt.png` — (P1) a simple clean mini skirt, tasteful
- [ ] `bottom/pleatedSkirt.png` — (P1) a pleated skirt, few clear pleats
- [ ] `bottom/slipSkirt.png` — (P1) a satin slip skirt, soft column
- [ ] `bottom/cargoMaxi.png` — (P1) a cargo maxi skirt, restrained pockets
- [ ] `bottom/maxiSkirt.png` — (P1) a plain long maxi skirt
- [ ] `bottom/dressPants.png` — (P1) clean creased dress pants
- [ ] `bottom/chinos.png` — (P2) casual relaxed chinos

### Shoes  *(generate in shown color · pair, on the feet)*

- [ ] `shoe/classicSneaker.png` — a neutral white classic sneaker
- [ ] `shoe/sneaker.png` — a colorful casual sneaker
- [ ] `shoe/runner.png` — a chunky running shoe
- [ ] `shoe/loafer.png` — a soft slip-on loafer
- [ ] `shoe/mary.png` — a Mary Jane with a strap
- [ ] `shoe/slide.png` — a cushioned slide sandal
- [ ] `shoe/skateShoe.png` — (P1) a low flat skate shoe
- [ ] `shoe/boot.png` — (P1) a chunky platform boot
- [ ] `shoe/combatBoot.png` — (P1) a lace-up combat boot
- [ ] `shoe/chelseaBoot.png` — (P1) a sleek Chelsea boot with elastic panel
- [ ] `shoe/balletFlat.png` — (P1) a simple ballet flat
- [ ] `shoe/hikingShoe.png` — (P1) a rugged hiking shoe

### Carry / bags  *(distinct silhouettes — never differ by color alone · with strap)*

- [ ] `carry/crossbody.png` — a small crossbody on a diagonal strap
- [ ] `carry/tote.png` — a soft slouchy tote at the side
- [ ] `carry/backpack.png` — a rounded backpack with shoulder straps
- [ ] `carry/canvasTote.png` — (P1) a square canvas tote
- [ ] `carry/mini.png` — (P1) a small structured mini bag
- [ ] `carry/beltbag.png` — (P1) a compact belt bag across the body
- [ ] `carry/messenger.png` — (P1) a rectangular messenger bag with strap
- [ ] `carry/laptopBag.png` — (P2) a structured laptop bag with handle
- [ ] `carry/gymBag.png` — (P2) a soft rounded duffel carried low

### Headwear  *(over the hair · headscarf covers all hair)*

- [ ] `accessory/headscarf.png` — a respectful hijab/headscarf, full coverage, soft drape
- [ ] `accessory/beanie.png` — (P1) a soft folded beanie
- [ ] `accessory/baseballCap.png` — (P1) a curved-brim baseball cap
- [ ] `accessory/bucketHat.png` — (P1) a soft down-brim bucket hat

### Glasses  *(thin clean frame, lenses transparent)*

- [ ] `glasses/round.png` — round glasses
- [ ] `glasses/rect.png` — rectangle glasses
- [ ] `glasses/cat.png` — (P1) cat-eye glasses
- [ ] `glasses/thickFrame.png` — (P1) thick bold-frame glasses
- [ ] `glasses/tinted.png` — (P2) soft tinted lenses, accessible contrast

### Jewelry  *(small, tasteful, soft metallic)*

- [ ] `jewelry/studs.png` — (P1) small ear studs
- [ ] `jewelry/hoops.png` — (P1) clean hoop earrings
- [ ] `jewelry/chain.png` — (P1) a simple gold neck chain
- [ ] `jewelry/pearl.png` — (P2) pearl drop earrings
- [ ] `jewelry/rings.png` — (P2) a few simple finger rings
- [ ] `jewelry/watch.png` — (P2) a wristwatch, band + face

### Hearing & assistive ear  *(ordinary, modern, never clinical · L and R separate)*

- [ ] `hearing/ha_r.png` — a behind-the-ear hearing aid, right ear
- [ ] `hearing/ha_l.png` — a behind-the-ear hearing aid, left ear
- [ ] `hearing/ci_both.png` — a cochlear implant with coil, both sides

### Sensory tools

- [ ] `tool/noiseHeadphones.png` — over-ear noise-reducing headphones, calm everyday style
- [ ] `tool/headphones.png` — (P1) over-ear headphones, headband + cups

### Mobility  *(ordinary & dignified, never alarmist)*

- [ ] `mobility/wheelchair.png` — ★ an everyday manual wheelchair — modern and friendly, like a warm consumer product, not medical (whole chair for the exemplar; later split rear + front, needs `body/seated`)
- [ ] `mobility/cane.png` — a simple walking cane held at the side
- [ ] `mobility/walker.png` — a modern walker/rollator in front of the figure

### AAC / communication  *(held in hand · simple generic symbols/letters ARE allowed here — no real app UI/brand)*

- [ ] `aac/tablet.png` — a speech tablet showing a simple symbol grid
- [ ] `aac/board.png` — a low-tech board with picture symbols
- [ ] `aac/letterboard.png` — a letter board with a plain A–Z grid
- [ ] `aac/ipad.png` — (P1) a plain consumer tablet, neutral screen
- [ ] `tool/medicalBracelet.png` — (P2) a simple wrist medical-ID band, not alarmist

---

## Not generated here

- **Vibes** = recipes the engine assembles from the parts above (see `catalog-bible.md`); no single image.
- **Per-color bakes** — only if a tinted neutral looks wrong (denim wash, metallics): repeat the item as `id__colorId.png`.
- **Texture, aura, piercings** — deferred per `art-bible.md`.
