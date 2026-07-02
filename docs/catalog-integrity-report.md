# Catalog Integrity Report

Source audited: `index.html`.

## Result Summary

Catalog data integrity is mostly healthy. Product/rendering integrity is not.

Passed:

- All `CAT` category arrays are present.
- No duplicate ids were found within audited categories.
- No duplicate labels were found within a category.
- Every current vibe preset references existing ids for top, bottom, texture, makeup, makeupColor, shoe, and carry when those keys are present.
- Every current vibe mood maps to an existing vibe filter.
- Every current top has the minimum renderer contract fields: `id`, `label`, `sleeve`, `len`, `neck`, and `fit`.
- Every current bottom has the minimum renderer contract fields: `id`, `label`, and `type`.
- Every current catalog item has non-rendering metadata fields for category, group, tags, status, flat asset status, 3D status, notes, and priority.

Failed or risky:

- The main avatar renderer does not consume many visible catalog categories.
- Some current item attributes do not match the renderer branch names used by `dmFigure`.
- Some renderer features are not exposed in `CAT`.
- The `braid` item currently depends on an external PNG path.

## Vibe Reference Integrity

No broken vibe references were found.

Validated references:

| Vibe set key | Target category | Result |
| - | - | - |
| top | `CAT.top` | pass |
| bottom | `CAT.bottom` | pass |
| texture | `CAT.texture` | pass |
| makeup | `CAT.makeup` | pass |
| makeupColor | `CAT.makeupColor` | pass |
| shoe | `CAT.shoe` | pass |
| carry | `CAT.carry` | pass |
| moods | `CAT.vibeFilters` | pass |

Note: `topColor` and `bottomColor` are hex values, not catalog ids. Several vibe colors are not present in `CAT.garmentColor`, which is acceptable today but should become explicit if the future schema wants all colors addressable by id.

## Awkward Generated Expressions

The following look generated or implementation-led rather than product-curated:

- `e_amy`: likely means amethyst, but the id is not clear.
- `wavyM`: encodes implementation/length shorthand rather than product language.
- `straightL`: encodes implementation/length shorthand rather than product language.
- `button`: top id is ambiguous because `button` also exists as a nose id.
- `drapedShirt`: id does not match label `Open overshirt`.
- `a_forest`: id does not match label `Breeze`.
- Phase 4 label cleanup resolved the safest user-facing label issues: `Asymmetric knit`, `Ballet Soft`, `Gentle Movement`, `Campus Prep`, `Concert Night`, `Curtain bangs`, `French bob`, `Top bun`, `Twin braids`, `Street`, and `Trail jacket`.
- The live hair renderer still lacks several high-identity styles; metadata now tracks this as roadmap work before renderer expansion.

## Duplicate or Overlapping Concepts

No duplicate labels were found within individual categories.

Intentional cross-category overlaps:

- `None` appears in many categories and is intentional.
- `Soft` appears as a lip label and a texture label; category context disambiguates it.
- `Round` appears in face/eye/glasses contexts; category context disambiguates it.

Possible concept overlap to resolve:

- `cardigan` / future `wrapTop` / `asymKnit`: all could read as soft wrap-like tops unless visual silhouettes are clearly separated.
- `trackPant` / future `joggers` / `parachute`: all need distinct cuffs, leg volume, and waist treatment.
- `tote` / future `canvasTote`: should be separated by structure and material, not just color.
- `studs` / `hoops` in `dmFigure`: both collapse to generic earrings today.
- `ha_r` / `ha_l` in `dmFigure`: both collapse to generic hearing aid today.

## Remaining ID/Label Friction

| Category | id | Current label | Issue | Recommended action |
| - | - | - | - | - |
| top | button | Relaxed shirt | Id is generic/ambiguous | Keep id for now, consider future alias |
| top | drapedShirt | Open overshirt | Id and label differ | Keep label; consider future alias |
| aura | a_forest | Breeze | Id and label differ | Rename id only in a migration, or relabel to Forest breeze |
| eyeColor | e_amy | Amethyst | Id is unclear shorthand | Keep id for now, consider future alias |

## Attributes That Do Not Match Labels

| Category | id | Label | Current attributes | Integrity issue |
| - | - | - | - | - |
| bottom | trackPant | Track pant | `type:"wide"`, `track:true` | `dmFigure` checks `type === "track"`, so main renderer misses track-specific treatment |
| bottom | parachute | Parachute pant | `type:"wide"`, `ruched:true` | `dmFigure` checks `type === "parachute"`, so main renderer misses parachute-specific treatment |
| top | jersey | Graphic jersey | `jersey:true` | Older renderer uses `jersey`; `dmFigure` does not |
| top | drapedShirt | Open overshirt | `layered:true` | Older renderer uses `layered`; `dmFigure` does not expose open overshirt behavior through top flags |
| top | utility | Utility vest | `pockets:true` | Older renderer uses `pockets`; `dmFigure` does not |
| top | shell | Trail jacket | `panels:true` | Older renderer uses `panels`; `dmFigure` does not |
| hearing | ha_r | Hearing aid (R) | id side-specific | `dmFigure` maps both sides to generic `ha` |
| hearing | ha_l | Hearing aid (L) | id side-specific | `dmFigure` maps both sides to generic `ha` |

## Renderer Functions Supporting Items Not Exposed in CAT

| Renderer area | Supported but not cataloged | Notes |
| - | - | - |
| `dmFigure.drawShoes()` | `heel` | Do not expose as-is; replace with curated shoe options if needed |
| `dmFigure.drawTop()` | `top.pattern === "stripe"` | No current top sets `pattern:"stripe"` |
| `dmFigure.drawTop()` | `top.pattern === "plaid"` | Future `flannel` could use this |
| `dmFigure.drawOuter()` | `layer.style:"denim"` | No catalog layer category exists |
| `dmFigure.drawOuter()` | `layer.style:"puffer"` | No catalog layer category exists |
| `dmFigure.drawOuter()` | `layer.style:"blazer"` | No catalog layer category exists |
| `dmFigure.drawOuter()` | `layer.style:"overshirt"` | No catalog layer category exists |
| `dmFigure` expression | `calm`, `soft` | No expression category exists; current state hardcodes smile |

## CAT Items With No or Partial Main-Renderer Support

The table below focuses on the current pinned avatar path, not the older preview renderer.

| Category | Items affected | Main-renderer support |
| - | - | - |
| faceShape | all | ignored by `stateToFigureOpts` / `dmFigure` |
| brow | all | ignored by `stateToFigureOpts` / `dmFigure` |
| eye | all | ignored by `stateToFigureOpts` / `dmFigure` |
| eyeColor | all | ignored by `stateToFigureOpts` / `dmFigure` |
| nose | all | ignored by `stateToFigureOpts` / `dmFigure` |
| lip | all | ignored by `stateToFigureOpts` / `dmFigure` |
| makeup | all | ignored by `stateToFigureOpts` / `dmFigure` |
| makeupColor | all | ignored by `stateToFigureOpts` / `dmFigure` |
| piercing | all | ignored by `stateToFigureOpts` / `dmFigure` |
| mobility | wheelchair, cane | ignored by `stateToFigureOpts` / `dmFigure` |
| aac | tablet, board, ipad, letterboard | ignored by `stateToFigureOpts` / `dmFigure` |
| aura | all non-none | ignored by `stateToFigureOpts` / `dmFigure` |
| feature | birthmark, scar, blush | not supported in `dmFigure`; supported in old renderer |
| hearing | ha_r, ha_l | side-specific ids collapse to generic hearing aid |
| jewelry | studs, hoops | both collapse to generic earrings |
| carry | tote, beltbag, mini, backpack | collapse or differ from old renderer in `dmFigure` |
| bottom | trackPant, parachute | main renderer misses intended special treatments |
| top | jersey, drapedShirt, utility, shell | key detail flags not consumed by `dmFigure` |

## Inconsistent Naming Conventions

Current style:

- Mixed camelCase ids: `straightL`, `wavyM`, `cropCorset`, `wideTrouser`, `trackPant`.
- Short numeric ids for tones/colors: `s1`, `h1`, `m_rose`, `e_brown`.
- Some ids are semantic (`barrelJean`), some are renderer shorthand (`wavyM`), some are ambiguous (`button`).

Recommendation:

- Preserve current ids until migration is planned.
- For new catalog items, use stable semantic camelCase ids.
- Avoid implementation shorthand in new ids.
- If a current id is weak but already used, add an alias/migration layer rather than a silent rename.

## Self-Contained Asset Integrity

Current `HAIR_IMG` routes `braid` to `_art/sideBraid_cut.png`.

Risk:

- The product brief requires one self-contained file and inline SVG for production avatar assets.
- The PNG is appropriate as concept/reference art, not as a production dependency.

Recommended action:

- Keep the PNG as dev/reference input.
- Rebuild `braid` as clean inline SVG or deterministic renderer logic before production.
- Add validation or a release check that flags `<image href="_art/...">` in the production app.

## Recommended Integrity Gates

P0 gates:

- Unique ids per category.
- Non-empty labels.
- No duplicate labels within category unless allowlisted.
- All vibe `set` ids resolve.
- All vibe moods resolve.
- Top/bottom required renderer attributes exist.
- Production build has no avatar `<image href>` dependencies unless explicitly allowlisted.

P1 gates:

- Warn when a catalog item has detail flags ignored by the main renderer.
- Warn when a renderer branch is not reachable from `CAT`.
- Warn when labels and ids are materially mismatched.
- Warn when main renderer ignores an exposed category.

P2 gates:

- Validate future asset manifest fields.
- Validate 3D anchor/slot metadata for native iPad work.
