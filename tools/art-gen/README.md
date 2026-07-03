# art-gen — batch art pipeline (OpenAI Images API)

The "Auto (at scale)" mode `docs/art-prompts.md` describes: PREFIX + item line +
SUFFIX per catalog item → `gpt-image-1` → transparent PNG named by id. Nothing here
touches `app/assets/` directly — every image goes through staging, programmatic QA,
and a human contact-sheet review first.

## The flow

```
export OPENAI_API_KEY=sk-...

# 0. Preview the plan + exact prompts + cost — no API calls, no key needed
node tools/art-gen/generate.mjs --dry-run

# 1. Registration master first (everything else aligns to it)
node tools/art-gen/generate.mjs --only skin/base

# 2. QA it, eyeball it, and when you love it, make it the style anchor:
tools/art-lab/.venv/bin/python tools/art-gen/qa.py
cp _art_staging/skin/base.png tools/art-gen/refs/

# 3. The three ★ exemplars (now generated WITH the base as reference)
node tools/art-gen/generate.mjs --exemplars
#    → QA → pick the ones you love → copy them into tools/art-gen/refs/ too

# 4. The batch (P0 by default; add --priority all for P1/P2)
node tools/art-gen/generate.mjs

# 5. QA + review + ingest
tools/art-lab/.venv/bin/python tools/art-gen/qa.py
node tools/art-gen/contact-sheet.mjs        # open _art_staging/contact-sheet.html
#    approve/reject → Export approvals.json → save into _art_staging/
node tools/art-gen/ingest-approved.mjs      # registers into app/assets/parts/
```

Rejected parts: `node tools/art-gen/generate.mjs --force --only <cat/id,...>` — the
QA script prints this command for its failures.

## How worn parts are generated (the greenscreen technique)

Text alone cannot make `gpt-image-1` draw a lone part at true position/scale on the
1024×1536 frame (shakedown 2026-07-02: hoodie 2× too big, hair at torso height). What
it CAN do flawlessly is dress a figure. So for worn categories (hair, tops, bottoms,
shoes, headwear, bags, tools, AAC, mobility) the generator:

1. sends `refs/base.png` to the **edits** endpoint: *dress this exact figure in
   the item; paint the figure itself solid chroma green, no outline*;
2. `key.py` deterministically removes every green-dominant pixel — the part keeps
   pixel-exact registration because it literally is the worn render's pixels;
3. `key.py` first measures the green mannequin against the base figure and
   REJECTS the render (auto-retry) if the model zoomed or cropped the body.

Non-worn items (skin, body shapes) and bust items generate directly.

**Recolor proof (2026-07-03): multiply tint HOLDS on deep tones** — jet-black hair
keeps curl definition, charcoal/denim/forest hoodie keeps stitch detail. No per-color
bakes needed for knits/hair; revisit only for true denim wash + metallics.

## Guardrails built in

- **Id gate** — refuses to run while `tools/check-art-ids.mjs` fails.
- **skin/base first** — refuses to batch until the registration master exists.
- **Style anchoring** — `gpt-image-1` has no seed; once `tools/art-gen/refs/` has the
  approved base + exemplars, every call switches to the edits endpoint with those
  attached, so the whole catalog inherits one look. Re-rolling refs re-rolls the look.
- **Idempotent** — skips anything already staged or approved unless `--force`.
- **QA is code, not vibes** — canvas size, real alpha, coverage (catches baked
  backgrounds), transparent borders (catches cropped-to-item), neutral-master
  saturation (catches un-tintable "recolor" parts), centering drift.

## Cost (gpt-image-1)

| quality | full-figure 1024×1536 | bust 1024×1024 |
|---|---|---|
| high (default) | ~$0.25 | ~$0.17 |
| medium | ~$0.06 | ~$0.04 |
| low (drafts) | ~$0.02 | ~$0.01 |

Full P0+P1+P2 worksheet (~160 items, high): ≈ $35. Use `--quality low` for cheap
style experiments before committing.

## Flags

`--dry-run` `--exemplars` `--only cat/id,...` `--category hair` `--priority P0|P1|P2|all`
`--quality high|medium|low` `--limit N` `--concurrency 2` `--retries 2` `--force`
