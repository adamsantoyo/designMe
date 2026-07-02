# Catalog Audit

Source audited: `index.html`, main `CAT` catalog block.

## Executive Summary

The current catalog is structurally sound: all current vibe presets reference existing catalog ids, all category arrays are present, and the catalog already covers identity, fashion, assistive tools, and a recognition-first vibe entry point.

The main issue is not missing ids. The main issue is renderer split-brain:

- The current pinned avatar and vibe cards render through `dmFigure`.
- Several panels and old previews still render through the older `renderAvatar` / `avatarMarkup` engine.
- Many exposed catalog choices are fully supported by the older engine but ignored or simplified by `dmFigure`.

This means a user can tap choices that appear to work in swatches, but those choices may not appear on the main avatar. That is a product-quality issue for recognition-first use because the user needs immediate, trustworthy visual feedback.

Current catalog counts:

| Category | Count |
| - | -: |
| skin | 14 |
| feature | 6 |
| faceShape | 6 |
| brow | 5 |
| eye | 5 |
| eyeColor | 6 |
| nose | 5 |
| lip | 5 |
| makeup | 8 |
| makeupColor | 10 |
| hair | 15 |
| hairColor | 18 |
| body | 5 |
| height | 5 |
| top | 16 |
| bottom | 11 |
| texture | 4 |
| garmentColor | 16 |
| palette | 8 |
| vibeFilters | 9 |
| vibe | 18 |
| glasses | 4 |
| mobility | 3 |
| aac | 5 |
| shoe | 6 |
| carry | 6 |
| piercing | 5 |
| jewelry | 5 |
| hearing | 4 |
| aura | 6 |

## Category Inventory

### skin (14)

| id | label | render-driving attributes |
| - | - | - |
| s1 | Deep espresso | base:#3b2a21 |
| s2 | Deep cocoa | base:#4a3328 |
| s3 | Rich umber | base:#5c3f30 |
| s4 | Warm walnut | base:#6d4733 |
| s5 | Chestnut | base:#7c5a45 |
| s6 | Russet | base:#8a5a3f |
| s7 | Amber bronze | base:#9c6f4e |
| s8 | Warm caramel | base:#a87c58 |
| s9 | Golden tan | base:#bd8a5f |
| s10 | Honey | base:#c99a6e |
| s11 | Olive beige | base:#bca079 |
| s12 | Soft sand | base:#d3b48f |
| s13 | Warm ivory | base:#e3c4a2 |
| s14 | Light peach | base:#efd4b8 |

### feature (6)

| id | label | render-driving attributes |
| - | - | - |
| none | None | - |
| freckles | Freckles | - |
| vitiligo | Vitiligo | - |
| birthmark | Birthmark | - |
| scar | Scar | - |
| blush | Rosy cheeks | - |

### faceShape (6)

| id | label | render-driving attributes |
| - | - | - |
| round | Round | m:top 48, cheek 53, jaw 47, ry 56, chin 0.46 |
| oval | Oval | m:top 46, cheek 49, jaw 40, ry 61, chin 0.54 |
| square | Square | m:top 51, cheek 53, jaw 51, ry 56, chin 0.30 |
| heart | Heart | m:top 53, cheek 52, jaw 35, ry 58, chin 0.60 |
| long | Long | m:top 44, cheek 45, jaw 41, ry 65, chin 0.54 |
| diamond | Diamond | m:top 42, cheek 54, jaw 39, ry 60, chin 0.52 |

### brow (5)

| id | label | render-driving attributes |
| - | - | - |
| soft | Soft | renderer branch |
| straight | Straight | renderer branch |
| arched | Arched | renderer branch |
| thick | Bold | renderer branch |
| thin | Fine | renderer branch |

### eye (5)

| id | label | render-driving attributes |
| - | - | - |
| round | Round | renderer branch |
| almond | Almond | renderer branch |
| monolid | Monolid | renderer branch |
| hooded | Hooded | renderer branch |
| wide | Wide-set | renderer branch |

### eyeColor (6)

| id | label | render-driving attributes |
| - | - | - |
| e_brown | Brown | v:#47321e; d:#2e1c0d |
| e_hazel | Hazel | v:#705436; d:#453018 |
| e_green | Green | v:#4b6348; d:#233621 |
| e_blue | Blue | v:#608694; d:#2e4854 |
| e_gray | Gray | v:#7c858a; d:#464c4f |
| e_amy | Amethyst | v:#644b7a; d:#352445 |

### nose (5)

| id | label | render-driving attributes |
| - | - | - |
| button | Button | renderer branch |
| round | Rounded | renderer branch |
| wide | Wide | renderer branch |
| narrow | Narrow | renderer branch |
| long | Long | renderer branch |

### lip (5)

| id | label | render-driving attributes |
| - | - | - |
| full | Full | default branch |
| wide | Wide | renderer branch |
| small | Petite | renderer branch |
| bow | Bow | renderer branch |
| neutral | Soft | renderer branch |

### makeup (8)

| id | label | render-driving attributes |
| - | - | - |
| none | None | none |
| natural | Natural | renderer branch |
| liner | Eyeliner | renderer branch |
| smoky | Smoky eye | renderer branch |
| bold | Bold lip | renderer branch |
| glam | Full glam | renderer branch |
| graphic | Graphic liner | renderer branch |
| mascara | Lashes | renderer branch |

### makeupColor (10)

| id | label | render-driving attributes |
| - | - | - |
| m_rose | Rose | v:#c4607a |
| m_red | Red | v:#b23b43 |
| m_berry | Berry | v:#8a3a5e |
| m_coral | Coral | v:#d9745e |
| m_nude | Nude | v:#b07b66 |
| m_plum | Plum | v:#6f4a72 |
| m_bronze | Bronze | v:#a86b3f |
| m_teal | Teal | v:#3f8a86 |
| m_violet | Violet | v:#7a5fb0 |
| m_gold | Gold | v:#cda14e |

### hair (15)

| id | label | render-driving attributes |
| - | - | - |
| straightL | Sleek long | texture:straight; Avataaars path |
| wavyM | Loose waves | texture:wavy; Avataaars path |
| layers | Long layers | texture:wavy; Avataaars path |
| bob | French bob | texture:straight; Avataaars path |
| curtain | Curtain bangs | texture:straight; Avataaars path |
| halfUp | Half-up waves | texture:wavy; hand-built hair |
| highPony | High ponytail | texture:straight; hand-built hair |
| lowPony | Low ponytail | texture:straight; hand-built hair |
| highBun | Top bun | texture:straight; hand-built hair |
| lowBun | Low bun | texture:straight; hand-built hair |
| crownBraid | Crown braid | texture:braid; hand-built hair |
| braid | Side braid | texture:braid; currently routed to `_art/sideBraid_cut.png` |
| pigtails | Twin braids | texture:braid; hand-built hair |
| shaved | Shaved | texture:shaved; cap shadow |
| bald | Bald | texture:none; no hair |

### hairColor (18)

| id | label | render-driving attributes |
| - | - | - |
| h1 | Soft black | v:#211c1a |
| h2 | Espresso | v:#2e221b |
| h3 | Dark brown | v:#3f2b1f |
| h4 | Chestnut | v:#5a3b27 |
| h5 | Warm brown | v:#6f4a2f |
| h6 | Light brown | v:#8a5a34 |
| h7 | Dark blonde | v:#a87f4e |
| h8 | Blonde | v:#c8a968 |
| h9 | Golden | v:#dcc07a |
| h10 | Platinum | v:#e7ddc4 |
| h11 | Ash | v:#9a958d |
| h12 | Silver | v:#cfcac3 |
| h13 | Auburn | v:#9a4a36 |
| h14 | Ginger | v:#c0673a |
| h15 | Plum | v:#6f4a72 |
| h16 | Ocean blue | v:#3f6f8a |
| h17 | Teal | v:#3f8a78 |
| h18 | Rose | v:#c0708f |

### body (5)

| id | label | render-driving attributes |
| - | - | - |
| slim | Lean | m:sh 41, ch 35, wa 31, hp 37, arm 10.5, leg 14 |
| average | Balanced | m:sh 46, ch 41, wa 37, hp 45, arm 12, leg 17 |
| athletic | Broad | m:sh 55, ch 48, wa 43, hp 48, arm 14.5, leg 19 |
| curvy | Curves | m:sh 46, ch 45, wa 41, hp 57, arm 13, leg 20.5 |
| plus | Full | m:sh 55, ch 57, wa 56, hp 61, arm 16.5, leg 23 |

### height (5)

| id | label | render-driving attributes |
| - | - | - |
| h0 | Shorter | height step |
| h1 | Short | height step |
| h2 | Medium | height step |
| h3 | Tall | height step |
| h4 | Taller | height step |

### top (16)

| id | label | render-driving attributes |
| - | - | - |
| cropCorset | Crop corset | sleeve:tank; len:crop; neck:scoop; fit:fitted; corset:true |
| asymKnit | Asymmetric knit | sleeve:short; len:hip; neck:asym; fit:fitted; rib:true |
| jersey | Graphic jersey | sleeve:short; len:boxy; neck:v; fit:oversized; jersey:true |
| drapedShirt | Open overshirt | sleeve:long; len:long; neck:collar; fit:relaxed; layered:true |
| boxyTee | Boxy tee | sleeve:short; len:boxy; neck:crew; fit:oversized; graphic:true |
| babyTee | Baby tee | sleeve:short; len:crop; neck:crew; fit:fitted; graphic:true |
| ribTank | Rib tank | sleeve:tank; len:crop; neck:scoop; fit:fitted; rib:true |
| meshLayer | Mesh layer | sleeve:long; len:hip; neck:crew; fit:fitted; mesh:true |
| hoodie | Oversized hoodie | sleeve:long; len:long; neck:crew; fit:oversized; hood:true; pocket:true |
| bomber | Bomber jacket | sleeve:long; len:boxy; neck:crew; fit:oversized; zip:true; rib:true |
| cardigan | Soft cardigan | sleeve:long; len:hip; neck:v; fit:relaxed; placket:true; chunky:true |
| utility | Utility vest | sleeve:tank; len:hip; neck:crew; fit:boxy; pockets:true; zip:true |
| shell | Trail jacket | sleeve:long; len:hip; neck:high; fit:relaxed; zip:true; panels:true |
| button | Relaxed shirt | sleeve:long; len:long; neck:collar; fit:relaxed; placket:true |
| sweater | Chunky knit | sleeve:long; len:hip; neck:crew; fit:relaxed; chunky:true |
| slipDress | Slip dress | sleeve:strap; len:dress; neck:scoop; fit:drape; satin:true |

### bottom (11)

| id | label | render-driving attributes |
| - | - | - |
| jorts | Baggy jorts | type:jorts |
| cargoMaxi | Cargo maxi | type:skirt; maxi:true; cargo:true |
| trackPant | Track pant | type:wide; track:true |
| wideTrouser | Wide trouser | type:wide |
| barrelJean | Barrel denim | type:barrel |
| cargo | Cargo pant | type:cargo |
| parachute | Parachute pant | type:wide; ruched:true |
| leggings | Leggings | type:legg |
| pleatedSkirt | Pleated skirt | type:skirt; pleated:true |
| midiSkirt | Midi skirt | type:skirt; midi:true |
| shorts | Relaxed shorts | type:shorts |

### texture (4)

| id | label | render-driving attributes |
| - | - | - |
| soft | Soft | pat:tx-soft |
| smooth | Smooth | pat:tx-smooth |
| breathable | Breathable | pat:tx-breathable |
| cozy | Cozy | pat:tx-cozy |

### garmentColor (16)

| id | label | render-driving attributes |
| - | - | - |
| c_oat | Oat | v:#e6dcc6 |
| c_clay | Clay | v:#c08457 |
| c_rust | Rust | v:#a8553a |
| c_olive | Olive | v:#7d8254 |
| c_sage | Sage | v:#8aa382 |
| c_pine | Pine | v:#46604b |
| c_teal | Teal | v:#3f8a86 |
| c_sky | Sky | v:#8aa7bd |
| c_denim | Denim | v:#5a6f8c |
| c_plum | Plum | v:#7a5570 |
| c_rose | Rose | v:#d39aa3 |
| c_mustard | Mustard | v:#cda14e |
| c_choco | Cocoa | v:#5e4334 |
| c_charcoal | Charcoal | v:#3c3a38 |
| c_cream | Cream | v:#f1e9d8 |
| c_terracotta | Terracotta | v:#bd6f4f |

### palette (8)

| id | label | render-driving attributes |
| - | - | - |
| p_oatgraphite | Oat + graphite | top:#f1e9d8; bottom:#3c3a38 |
| p_mossdenim | Moss + denim | top:#8aa382; bottom:#5a6f8c |
| p_cocoa | Cocoa tonal | top:#a9764f; bottom:#5e4334 |
| p_cherry | Cherry accent | top:#b23b43; bottom:#3c3a38 |
| p_silver | Silver soft | top:#cfcac3; bottom:#7a6f60 |
| p_sea | Washed blue | top:#8aa7bd; bottom:#3f6f7a |
| p_plum | Plum smoke | top:#84647f; bottom:#3c3a47 |
| p_gold | Honey black | top:#cda14e; bottom:#29231f |

### vibeFilters (7)

| id | label | render-driving attributes |
| - | - | - |
| all | All | special filter |
| everyday | Everyday | filters moods |
| soft | Soft | filters moods |
| polished | Polished | filters moods |
| street | Street | filters moods |
| active | Active | filters moods |
| night | Night | filters moods |
| creative | Creative | filters moods |
| comfort | Comfort | filters moods |

### glasses (4)

| id | label | render-driving attributes |
| - | - | - |
| none | None | none |
| round | Round | renderer branch |
| rect | Rectangle | renderer branch |
| cat | Cat-eye | renderer branch |

### mobility (3)

| id | label | render-driving attributes |
| - | - | - |
| none | None | none |
| wheelchair | Wheelchair | renderer branch in old engine |
| cane | Cane | renderer branch in old engine |

### aac (5)

| id | label | render-driving attributes |
| - | - | - |
| none | None | none |
| tablet | AAC tablet | renderer branch |
| board | AAC board | fallback board branch |
| ipad | iPad | renderer branch |
| letterboard | Letter board | renderer branch |

### shoe (6)

| id | label | render-driving attributes |
| - | - | - |
| runner | Chunky runner | color:#f1e9d8; sole:#29231f |
| boot | Platform boot | color:#29231f; sole:#1f1b18 |
| loafer | Soft loafer | color:#5e4334; sole:#29231f |
| mary | Mary Jane | color:#7a5570; sole:#29231f |
| slide | Cloud slide | color:#cfcac3; sole:#7a6f60 |
| sneaker | Color sneaker | color:#8aa7bd; sole:#f1e9d8 |

### carry (6)

| id | label | render-driving attributes |
| - | - | - |
| none | None | none |
| crossbody | Crossbody | color:#29231f |
| tote | Soft tote | color:#e6dcc6 |
| beltbag | Belt bag | color:#46604b |
| mini | Mini bag | color:#b23b43 |
| backpack | Backpack | color:#3f6f7a |

### piercing (5)

| id | label | render-driving attributes |
| - | - | - |
| none | None | none |
| nostril | Nostril ring | renderer branch in old engine |
| septum | Septum | renderer branch in old engine |
| eyebrow | Eyebrow | renderer branch in old engine |
| snake | Snakebites | renderer branch in old engine |

### jewelry (5)

| id | label | render-driving attributes |
| - | - | - |
| none | None | none |
| studs | Ear studs | old engine branch; mapped to earrings in `dmFigure` |
| hoops | Hoop earrings | old engine branch; mapped to earrings in `dmFigure` |
| chain | Gold chain | old engine branch; mapped to chain in `dmFigure` |
| pearl | Pearl drop | old engine branch; mapped to pearl in `dmFigure` |

### hearing (4)

| id | label | render-driving attributes |
| - | - | - |
| none | None | none |
| ha_r | Hearing aid (R) | old engine right side; mapped to generic `ha` in `dmFigure` |
| ha_l | Hearing aid (L) | old engine left side; mapped to generic `ha` in `dmFigure` |
| ci_both | Cochlear implants | old engine both sides; mapped to cochlear in `dmFigure` |

### aura (6)

| id | label | render-driving attributes |
| - | - | - |
| none | Clear | none |
| a_sun | Sunlight | c:#f9e7c3 |
| a_forest | Breeze | c:#d2dfd6 |
| a_lilac | Lilac | c:#e4d5ea |
| a_sky | Sky | c:#d5e5ea |
| a_rose | Rose | c:#ead5d8 |

## Vibe Inventory

| id | label | moods | tag | note | set |
| - | - | - | - | - | - |
| v_weekend | Weekend Easy | everyday, comfort | easy casual | soft tee, barrel denim, sneakers | top boxyTee; bottom barrelJean; texture soft; makeup natural; shoe sneaker; carry crossbody |
| v_cozyknit | Cozy Knit | everyday, soft, comfort | cozy neutral | chunky knit, denim, loafers | top sweater; bottom barrelJean; texture cozy; makeup none; shoe loafer; carry tote |
| v_linen | Linen Calm | everyday, polished, comfort | linen ease | relaxed shirt, soft shorts, airy | top button; bottom shorts; texture breathable; makeup natural; shoe slide; carry tote |
| v_romantic | Soft Romantic | soft | soft romantic | wrap cardigan, midi skirt | top cardigan; bottom midiSkirt; texture soft; makeup natural; makeupColor m_rose; shoe mary; carry mini |
| v_ribbon | Ballet Soft | soft | ballet soft | corset top, pleated skirt | top cropCorset; bottom pleatedSkirt; texture soft; makeup natural; makeupColor m_rose; shoe mary; carry mini |
| v_softwrap | Gentle Movement | soft, active, comfort | gentle movement | wrap knit, leggings, soft movement | top asymKnit; bottom leggings; texture soft; makeup natural; shoe mary; carry tote |
| v_tailoring | Quiet Tailoring | polished | refined neutral | relaxed shirt, wide trouser | top button; bottom wideTrouser; texture smooth; makeup none; shoe loafer; carry crossbody |
| v_mono | Monochrome Minimal | polished | monochrome | boxy tee, wide trouser, black + cream | top boxyTee; bottom wideTrouser; texture smooth; makeup none; shoe loafer; carry crossbody |
| v_prep | Campus Prep | polished | campus prep | button-up, pleated skirt, loafers | top button; bottom pleatedSkirt; texture smooth; makeup none; shoe loafer; carry backpack |
| v_softstreet | Soft Street | street | oversized | hoodie, barrel denim, sneakers | top hoodie; bottom barrelJean; texture soft; makeup liner; shoe sneaker; carry crossbody |
| v_utility | Utility Street | street | utility | bomber, cargo pant, boots | top bomber; bottom cargo; texture smooth; makeup liner; shoe boot; carry beltbag |
| v_skate | Skate Easy | street | loose + easy | boxy tee, jorts, sneakers | top boxyTee; bottom jorts; texture soft; makeup none; shoe sneaker; carry backpack |
| v_athleisure | Athleisure | active, polished | athleisure | bomber, track pant, runners | top bomber; bottom trackPant; texture breathable; makeup natural; shoe runner; carry beltbag |
| v_trail | Trail Utility | active | outdoor utility | tech shell, cargo, runners | top shell; bottom cargo; texture breathable; makeup none; shoe runner; carry backpack |
| v_studiomove | Studio Move | active | movement | mesh layer, track pant, compact bag | top meshLayer; bottom trackPant; texture breathable; makeup liner; shoe sneaker; carry beltbag |
| v_satin | Satin Evening | night, polished | evening | satin slip, trouser, warm glam | top slipDress; bottom wideTrouser; texture smooth; makeup glam; makeupColor m_red; shoe mary; carry mini |
| v_downtown | Downtown | night, street | downtown | corset, dark denim, boots, smoky eye | top cropCorset; bottom barrelJean; texture smooth; makeup smoky; makeupColor m_plum; shoe boot; carry mini |
| v_metallic | Concert Night | night, street, creative | night shine | shine top, black trouser, bold liner | top jersey; bottom wideTrouser; texture smooth; makeup graphic; makeupColor m_violet; shoe boot; carry crossbody |

## Broken References

No broken vibe references were found.

Checked references:

- Vibe `set.top` -> `CAT.top`
- Vibe `set.bottom` -> `CAT.bottom`
- Vibe `set.texture` -> `CAT.texture`
- Vibe `set.makeup` -> `CAT.makeup`
- Vibe `set.makeupColor` -> `CAT.makeupColor`
- Vibe `set.shoe` -> `CAT.shoe`
- Vibe `set.carry` -> `CAT.carry`
- Vibe `moods` -> `CAT.vibeFilters`

No duplicate ids were observed in the audited catalog.

## Renderer/Catalog Mismatches

### Main renderer ignores several exposed identity categories

`paintAvatar()` uses `dmFigure(stateToFigureOpts(App.state))`. `stateToFigureOpts()` currently passes only a subset of state into `dmFigure`.

Exposed categories that do not meaningfully affect the pinned main avatar through `dmFigure`:

- `faceShape`
- `brow`
- `eye`
- `eyeColor`
- `nose`
- `lip`
- `makeup`
- `makeupColor`
- `piercing`
- `mobility`
- `aac`
- `aura`

This is the highest-risk product issue because these categories are visible and tappable, but recognition feedback may not appear in the main avatar.

### Partial support in `dmFigure`

- `feature`: `dmFigure` supports freckles and vitiligo, but not birthmark, scar, or blush. The older renderer supports all current feature ids.
- `glasses`: `dmFigure` supports round, rect, and cat.
- `hearing`: `dmFigure` maps both left and right hearing aids to a generic `ha`, so side-specific ids lose meaning.
- `jewelry`: `dmFigure` maps studs and hoops to generic earrings, chain to chain, and pearl to pearl. It does not preserve the full old-renderer distinction.
- `carry`: `dmFigure` has a custom crossbody branch, then renders all other non-none carry items as the same handheld bag shape. The old renderer differentiates tote, beltbag, mini, and backpack.
- `shoe`: `dmFigure` contains an unexposed `heel` branch. Current `CAT.shoe` does not expose `heel`.
- `bottom`: `dmFigure` has special branches for `type:"track"` and `type:"parachute"`, but current catalog items use `trackPant: {type:"wide", track:true}` and `parachute: {type:"wide", ruched:true}`. The older renderer reads the `track` and `ruched` flags, so the two engines disagree.
- `top`: `dmFigure` supports `pattern:"stripe"` and `pattern:"plaid"`, but no current top exposes `pattern`.
- `outer layer`: `dmFigure` supports `o.layer.style` values including denim, puffer, blazer, and overshirt, but there is no catalog category that exposes this layer model.

### Hard-constraint concern

The `braid` hair item is currently routed through `HAIR_IMG` to `_art/sideBraid_cut.png`. That is useful as concept/reference art, but it conflicts with the stated production constraint that the website ship as one self-contained file with inline SVG/avatar logic only. If kept, the PNG should remain dev/reference-only until rebuilt as clean SVG or renderer logic.

## Naming and Taxonomy Issues

- Phase 4 label cleanup has applied the safest recognition-first label changes without changing ids or visuals.
- `Creative` and `Comfort` filters now exist, but Creative currently has only one mapped vibe and Comfort is still light.
- `pigtails` is now labeled `Twin braids`; the visual still needs a later decision on whether it should remain Dutch-braid-specific or broaden visually.
- `button` as a top id is ambiguous because `button` is also a nose id. It works technically because ids are scoped by category, but it is weak for future shared asset pipelines.
- `drapedShirt` as an id does not match the user-facing label `Open overshirt`.
- `a_forest` label `Breeze` does not match the id.
- `e_amy` appears to mean amethyst but uses a shortened/generated id.

## Product-Quality Concerns

- Hair is the highest identity-impact category but currently has 15 styles, with no defined curls, buzz, pixie, fade, or claw clip yet.
- The live hair renderer still lacks several high-identity styles, but the inline comment now frames that as roadmap work instead of an endpoint.
- Outfit categories are broad enough to work, but tops and bottoms are still renderer-attribute abstractions more than a curated wardrobe system.
- Vibes are a strong recognition-first entry point, but the current 18 vibes still need fuller Creative and Comfort coverage.
- Body labels are relatively safe, but should remain simple and non-evaluative. Avoid adding fine-grained measurements.
- Assistive tools are correctly presented as ordinary options, but `mobility` and `aac` not appearing in the main `dmFigure` path undermines that product principle.
- Color is currently mostly technical swatches and palettes. The next pass should make color more emotional/recognition-based without requiring typing.

## Recommended Next Steps

1. Freeze the current data ids long enough to create a stable item manifest.
2. Add catalog validation to catch broken ids, duplicate ids, duplicate labels, invalid vibe references, and top/bottom renderer-contract gaps.
3. Create the catalog bible before changing visuals.
4. Decide the production renderer contract: either move main rendering back to full state support, or upgrade `dmFigure` to consume every exposed state field.
5. Rebuild `braid` from the PNG reference into inline SVG/renderer logic before treating it as production.
6. Curate around 24 vibes with fuller Creative and Comfort coverage and life-context labels.
7. Expand hair first, then shoes/carry/tools, because hair drives recognition more than outfit detail.
8. Add future asset fields now: `flatAssetStatus`, `threeDStatus`, and stable ids that can point to SVG, PNG concept art, and future 3D assets.
