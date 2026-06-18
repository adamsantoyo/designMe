# designMe — hairstyle art brief (hybrid: illustrated hair, recolored in-file)

**Approach (decided):** keep the SVG body/clothing/assistive-tech engine. Make **hair** a
flat *illustrated image* layer, recolored to all 18 hair colors at runtime by an in-file SVG
filter (proven working), embedded as a data-URI. **No tracing.** Bar = **clean & dignified
flat illustration**, NOT painterly. Adam generates the art; Claude composites + recolors +
aligns + wires it in. **Prove ONE style end-to-end first, then batch.**

## What the recolor engine needs (this is why the spec is what it is)
The image is recolored by mapping its **brightness** to a dark→light ramp of the chosen hair
color. So the art must be **grayscale with real light-to-dark shading** (a few clean tone
steps). That's it. Flat illustration tints cleanly; photoreal/gradient art does not.

## Art spec
1. **Hair only.** No face, no head, no skin — just the hairstyle shape, isolated. (If the tool
   insists on a head, a plain flat background is OK — Claude can knock it out — but hair-only
   on transparent is ideal.)
2. **Transparent background, PNG.** ~1024px.
3. **Front-facing, perfectly symmetrical, centered.** Our avatar faces forward — no 3/4, no
   profile, no tilt.
4. **Grayscale shading**, light highlights → dark shadows, in a few clean tone steps. Clean
   crisp vector-style edges. NOT photorealistic, no fine strand texture.
5. **Sized to frame our head**, same scale for every style. Reference: open the app → Hair →
   **Bald**, screenshot the head, and match that head size/position.

## Prompt template (fill in [STYLE])
> A **[STYLE]** hairstyle drawn as a flat vector illustration, front-facing and perfectly
> symmetrical, shown on its own with **no face and no head — just the hair shape** — on a
> transparent background. **Grayscale** shading from light highlights to dark shadows in a few
> clean tone steps (not photorealistic, no fine strands). Clean crisp edges, centered, sized to
> frame a head. Modern minimal illustration style. PNG with transparency.

**Avoid:** color (keep it grayscale), 3/4 or side angles, photorealism, smooth airbrushed
gradients, busy backgrounds, a visible face/skin, multiple subjects.

**Tool:** ChatGPT / DALL·E (handles "isolated, no face, transparent background" well). Upload
the bald-head screenshot as a size/placement reference.

## Style list (the sister's catalog, front-facing)
sleek long · loose waves · long layers · bob · bangs · half-up · high ponytail · low ponytail ·
high bun · low bun (chignon) · crown braid · side braid (swept over one shoulder) · Dutch /
pigtail braids

## Workflow
1. Generate **ONE** style first (suggest **side braid** or **high ponytail**).
2. Save the PNG into `_art/` in this project and tell Claude the filename.
3. Claude: embed it, composite it as the hair layer, recolor across all 18 colors, align to the
   head, add to the catalog. We review *that one* on the real avatar.
4. If it's good → generate the rest → Claude batch-integrates.

## Status
- ✅ Recolor engine proven (1 grayscale source → 18 colors, in-file SVG filter, deterministic).
- ⬜ First real hairstyle image (waiting on Adam).
