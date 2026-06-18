# Catalog Bible

This bible defines the recognition-first catalog direction for designMe. It is intentionally data-first: the catalog should be curated before any new visual production pass.

## Product Principles

- Recognition over customization: users should pick what feels like them, not manually configure tiny parts.
- Vibe first: whole-look presets remain the default entry point because they reduce executive load.
- Stable ids: item ids should survive flat SVG, PNG concept references, and future 3D/iPad assets.
- Ordinary inclusion: assistive tools, hearing tech, AAC, skin features, and cultural expression belong in the same catalog language as fashion and accessories.
- Emotionally safe body controls: body and height stay simple, non-evaluative, and non-measurement-based.
- No hidden network dependency: generated PNGs are dev-only references, never browser runtime generation.
- No gendered menus: every item remains available to every avatar.
- No clinical framing: labels should feel like taste, identity, daily life, and self-expression.

## Category Hierarchy

1. Vibe / Start
2. Hair
3. Face
4. Skin
5. Body
6. Fit / Outfit
7. Color
8. Accessories / Tools

## Current Catalog Summary

The current `CAT` catalog has 30 arrays and 239 total catalog entries, including 18 vibes. It is strong enough to support a proof-of-concept, but it should be treated as a draft catalog generated around renderer capabilities rather than a curated product system.

Current priority gaps:

- Hair breadth is too narrow for the representation target.
- Reconciliation note: the live local `index.html` currently has 15 hair items. The 19-item hair list in the prior conversation summary appears to describe a later/alternate target state, not the current local file.
- Vibe filters now include Creative and Comfort, but those groups need fuller vibe coverage.
- The main `dmFigure` renderer ignores several exposed face, tool, and expression categories.
- Some ids and labels are generated or underspecified.
- Some renderer-only features are not exposed as catalog items.
- The current `braid` asset uses a PNG reference path and should be rebuilt as inline SVG/renderer logic before production.

## Keep / Rename / Add / Cut Decisions

Keep:

- Skin tone range, body range, height range, outfit base attributes, garment colors, palettes, glasses, hearing tech, AAC, mobility, shoes, carry, and vibe-first flow.
- Current ids where the concept survives. Rename labels before renaming ids.

Rename decisions applied as label-only catalog cleanup:

- `asymKnit` label `Asym knit` -> `Asymmetric knit`.
- `curtain` label `Bangs` -> `Curtain bangs`.
- `bob` label `Bob` -> `French bob`.
- `halfUp` label `Half-up` -> `Half-up waves`.
- `highBun` label `High bun` -> `Top bun`.
- `pigtails` label `Dutch braids` -> `Twin braids` if the asset is broadened.
- `v_ribbon` label `Ribbon Soft` -> `Ballet Soft`.
- `v_softwrap` label `Soft Wrap` -> `Gentle Movement`.
- `v_prep` label `Prep` -> `Campus Prep`.
- `v_metallic` label `Metallic Night` -> `Concert Night`.
- `street` filter label `Streetwear` -> `Street`.

Add:

- Creative and Comfort vibe filters.
- Hair breadth for short, textured, coily, braided, loc, puff, fade, and clip styles.
- More shoes, carry items, headwear, headphones, sensory tools, walker, medical bracelet, rings, watch, and headscarf.
- More life-context vibes such as Bookstore Soft, Interview Ready, Airport Fit, Family Party, and Creative Studio.

Cut or defer from MVP:

- `crownBraid`: defer unless the asset is redesigned as a high-quality recognizable crown braid.
- Current facial piercings: defer to P2 until main renderer parity is solved.
- `aura`: keep as an emotional/background idea, but defer from MVP if it competes with avatar recognition.
- Renderer-only `heel`: do not expose as-is; replace with more recognizable shoes such as Ballet flat, Chelsea boot, or Classic sneaker.

## Asset Status Values

- `current-renderer`: exists in current catalog and has at least basic production rendering.
- `needs-svg`: concept exists or is current but needs clean inline SVG/renderer support.
- `needs-png-concept`: needs dev-only concept exploration before production SVG.
- `future`: not needed for MVP or depends on later native/3D work.

## Ultimate MVP Item List

### Hair

| id | label | category | group | tags | status | flatAssetStatus | threeDStatus | priority | promptNotes | svgNotes |
| - | - | - | - | - | - | - | - | - | - | - |
| shortCrop | Short crop | hair | short | short, easy, low-maintenance | add | needs-png-concept | not-started | P1 | Short textured crop, soft edges | Simple cap plus small texture cuts |
| buzzCut | Buzz cut | hair | short | buzz, low-maintenance | add | needs-png-concept | not-started | P1 | Even close buzz, visible hairline | Scalp-following stipple or soft shadow |
| shaved | Shaved | hair | short | shaved, minimal | keep | current-renderer | not-started | P0 | Very close shaved head | Keep current cap shadow, polish edge |
| pixie | Pixie cut | hair | short | pixie, playful, short | add | needs-png-concept | not-started | P1 | Short pixie with recognizable side shape | Layered cap with side points |
| taperFade | Taper fade | hair | short | fade, tapered | add | needs-png-concept | not-started | P1 | Tapered sides, fuller top | Separate side fade and top volume |
| curlyFade | Curly fade | hair | textured | curly, fade | add | needs-png-concept | not-started | P0 | Tight curls on top with faded sides | Curl marks clipped to top silhouette |
| bald | Bald | hair | short | bald, no hair | keep | current-renderer | not-started | P0 | Clean bald head | Ensure head shape still dignified |
| bob | French bob | hair | bob | bob, short, polished | rename | current-renderer | not-started | P1 | Chin-length bob with soft curve | Refine current bob proportions |
| curtain | Curtain bangs | hair | bangs | bangs, face-framing | rename | current-renderer | not-started | P0 | Parted bangs framing face | Make bang split clear at small size |
| straightL | Straight long | hair | long | straight, long | rename | current-renderer | not-started | P0 | Long straight hair | Keep silhouette, simplify generated path |
| layers | Long layers | hair | long | layered, long | keep | current-renderer | not-started | P0 | Long layered hair | Keep layer read, reduce path noise |
| wavyM | Loose waves | hair | long | waves, soft | keep | current-renderer | not-started | P0 | Loose waves, shoulder to chest | Keep wave rhythm recognizable |
| bigBlowout | Big blowout | hair | volume | volume, polished | add | needs-png-concept | not-started | P1 | Rounded high-volume blowout | Big outer silhouette with inner sweep lines |
| halfUp | Half-up waves | hair | updo | half-up, waves | rename | current-renderer | not-started | P0 | Half-up with waves down | Keep tie/bump visible |
| clawClip | Claw clip | hair | updo | clip, casual | add | needs-png-concept | not-started | P1 | Hair twisted up with claw clip | Add clip teeth as ordinary accessory shape |
| lowPony | Low ponytail | hair | ponytail | ponytail, low | keep | current-renderer | not-started | P0 | Low ponytail at nape | Keep tail visible behind shoulder |
| highPony | High ponytail | hair | ponytail | ponytail, high | keep | current-renderer | not-started | P0 | High ponytail with volume | Keep tie point readable |
| messyBun | Messy bun | hair | bun | bun, soft, casual | add | needs-png-concept | not-started | P1 | Loose bun with flyaway feel | Bun plus a few controlled wisps |
| sleekBun | Sleek bun | hair | bun | bun, sleek, polished | add | needs-png-concept | not-started | P1 | Smooth low or mid bun | Clean cap, tight bun ellipse |
| lowBun | Low bun | hair | bun | bun, low | keep | current-renderer | not-started | P0 | Low bun at nape | Polish current bun scale |
| highBun | Top bun | hair | bun | bun, top | rename | current-renderer | not-started | P0 | Top bun above crown | Keep current high bun, rename for clarity |
| braid | Side braid | hair | braid | braid, side | needs-redesign | needs-svg | not-started | P0 | Side braid reference exists | Rebuild PNG reference as inline SVG |
| pigtails | Twin braids | hair | braid | braids, twin | rename | current-renderer | not-started | P0 | Two braids, one each side | Decide if Dutch detail remains |
| boxBraids | Box braids | hair | protective | braids, protective | add | needs-png-concept | not-started | P0 | Medium box braids, natural fall | Repeat braid units, avoid noisy grid |
| cornrows | Cornrows | hair | protective | cornrows, protective | add | needs-png-concept | not-started | P0 | Neat cornrows following scalp | Scalp curves plus braid rows |
| locs | Locs | hair | protective | locs, textured | add | needs-png-concept | not-started | P0 | Shoulder locs or tied locs | Grouped loc strands with clean silhouette |
| afro | Afro | hair | coily | afro, coily, volume | add | needs-png-concept | not-started | P0 | Rounded afro with soft edge | Scalloped silhouette, minimal inner marks |
| puff | Puff | hair | coily | puff, coily | add | needs-png-concept | not-started | P0 | Single high puff | Puff sphere plus hairline cap |
| twoPuffs | Two puffs | hair | coily | puffs, coily | add | needs-png-concept | not-started | P0 | Two side puffs | Symmetric puffs, clear ties |
| definedCurls | Defined curls | hair | curly | curls, defined | add | needs-png-concept | not-started | P0 | Defined curls around face | Curl clusters, not random spirals |

### Tops

| id | label | category | group | tags | status | flatAssetStatus | threeDStatus | priority | promptNotes | svgNotes |
| - | - | - | - | - | - | - | - | - | - | - |
| plainTee | Plain tee | top | tee | everyday, simple | add | needs-svg | not-started | P0 | Plain crew tee | Base tee with no graphic |
| boxyTee | Boxy tee | top | tee | oversized, casual | keep | current-renderer | not-started | P0 | Boxy tee, relaxed | Keep graphic optional, allow plain variant |
| babyTee | Baby tee | top | tee | fitted, cropped | keep | current-renderer | not-started | P1 | Fitted baby tee | Keep crop safe, not oversexualized |
| jersey | Graphic jersey | top | sporty | jersey, graphic | needs-redesign | needs-svg | not-started | P1 | Sport jersey with number/stripe | `dmFigure` needs jersey flag support |
| longSleeveTee | Long sleeve tee | top | tee | long-sleeve, simple | add | needs-svg | not-started | P0 | Plain long sleeve | Long sleeves, crew neck |
| ribTank | Rib tank | top | tank | tank, ribbed | keep | current-renderer | not-started | P0 | Ribbed tank | Current rib lines acceptable |
| meshLayer | Mesh layer | top | layer | mesh, expressive | keep | current-renderer | not-started | P1 | Sheer mesh layer | Keep mesh subtle for sensory calm |
| cropCorset | Crop corset | top | fitted | corset, night | keep | current-renderer | not-started | P1 | Structured corset crop | Keep seams clear but not overdone |
| asymKnit | Asymmetric knit | top | knit | asym, knit | rename | current-renderer | not-started | P1 | Asymmetric knit top | Rename label, keep asym neckline |
| sweater | Chunky knit | top | knit | chunky, cozy | keep | current-renderer | not-started | P0 | Chunky knit sweater | Keep knit rows soft |
| cardigan | Soft cardigan | top | knit | cardigan, soft | keep | current-renderer | not-started | P0 | Soft open/closed cardigan | Clarify cardigan vs wrap top |
| buttonCardigan | Button cardigan | top | knit | cardigan, buttons | add | needs-svg | not-started | P1 | Button cardigan | Placket and buttons as clear detail |
| button | Relaxed shirt | top | shirt | button-up, relaxed | keep | current-renderer | not-started | P0 | Relaxed button-up shirt | Consider future id alias `relaxedShirt` |
| drapedShirt | Open overshirt | top | layer | overshirt, open | needs-redesign | needs-svg | not-started | P0 | Open overshirt over inner layer | `dmFigure` needs open-layer support |
| flannel | Flannel | top | shirt | plaid, cozy | add | needs-svg | not-started | P1 | Soft plaid flannel | Use pattern plaid renderer path |
| hoodie | Oversized hoodie | top | comfort | hoodie, oversized | keep | current-renderer | not-started | P0 | Oversized hoodie | Keep pocket and hood |
| sweatshirt | Oversized sweatshirt | top | comfort | sweatshirt, oversized | add | needs-svg | not-started | P0 | Oversized crew sweatshirt | Hoodie without hood/pocket or with rib |
| bomber | Bomber jacket | top | jacket | bomber, sporty | keep | current-renderer | not-started | P1 | Bomber jacket | Keep rib and zip |
| denimJacket | Denim jacket | top | jacket | denim, jacket | add | needs-svg | not-started | P1 | Denim jacket | Could use renderer outer layer |
| blazer | Blazer | top | jacket | blazer, polished | add | needs-svg | not-started | P1 | Soft blazer | Could use renderer outer layer |
| utility | Utility vest | top | utility | vest, pockets | needs-redesign | needs-svg | not-started | P1 | Utility vest with pockets | `dmFigure` needs pockets flag support |
| shell | Trail jacket | top | active | trail, rain, shell | rename | needs-svg | not-started | P1 | Lightweight trail/rain jacket | Rename and sync panels in `dmFigure` |
| slipDress | Slip dress | top | dress | dress, satin | keep | current-renderer | not-started | P1 | Satin slip dress | Keep as whole-piece top for now |
| wrapTop | Wrap top | top | soft | wrap, gentle | add | needs-svg | not-started | P1 | Wrap top, gentle diagonal line | Distinct from asym knit |

### Bottoms

| id | label | category | group | tags | status | flatAssetStatus | threeDStatus | priority | promptNotes | svgNotes |
| - | - | - | - | - | - | - | - | - | - | - |
| straightJean | Straight-leg jeans | bottom | denim | straight, denim | add | needs-svg | not-started | P0 | Straight-leg jeans | Denim pockets and stitch |
| barrelJean | Barrel denim | bottom | denim | barrel, denim | keep | current-renderer | not-started | P0 | Barrel denim | Keep curved leg read |
| wideDenim | Wide-leg denim | bottom | denim | wide, denim | add | needs-svg | not-started | P0 | Wide-leg denim | Wide type plus denim details |
| wideTrouser | Wide trouser | bottom | trouser | wide, polished | keep | current-renderer | not-started | P0 | Wide trouser | Keep clean crease |
| cargo | Cargo pant | bottom | utility | cargo, pockets | keep | current-renderer | not-started | P0 | Cargo pants with pockets | Keep pocket placement readable |
| parachute | Parachute pant | bottom | utility | parachute, ruched | needs-redesign | needs-svg | not-started | P1 | Parachute pant | Change renderer contract to real type or support flag |
| trackPant | Track pant | bottom | active | track, sporty | needs-redesign | needs-svg | not-started | P1 | Track pant with side stripe | Change renderer contract to real type or support flag |
| joggers | Joggers | bottom | comfort | jogger, cuff | add | needs-svg | not-started | P0 | Soft joggers | Cuffed ankle, relaxed thigh |
| leggings | Leggings | bottom | active | leggings, fitted | keep | current-renderer | not-started | P0 | Simple leggings | Keep fitted and neutral |
| bikeShorts | Bike shorts | bottom | active | shorts, fitted | add | needs-svg | not-started | P1 | Bike shorts | Fitted mid-thigh length |
| shorts | Relaxed shorts | bottom | shorts | relaxed, shorts | keep | current-renderer | not-started | P0 | Relaxed soft shorts | Keep comfortable read |
| jorts | Baggy jorts | bottom | denim | jorts, baggy | keep | current-renderer | not-started | P1 | Baggy denim shorts | Add denim stitch if possible |
| miniSkirt | Mini skirt | bottom | skirt | mini, skirt | add | needs-svg | not-started | P1 | Simple mini skirt | Keep non-sexual, clean shape |
| midiSkirt | Midi skirt | bottom | skirt | midi, skirt | keep | current-renderer | not-started | P0 | Midi skirt | Keep soft drape |
| pleatedSkirt | Pleated skirt | bottom | skirt | pleated, skirt | keep | current-renderer | not-started | P1 | Pleated skirt | Keep pleats fewer and clearer |
| slipSkirt | Slip skirt | bottom | skirt | satin, slip | add | needs-svg | not-started | P1 | Satin slip skirt | Add sheen, soft column |
| cargoMaxi | Cargo maxi | bottom | skirt | cargo, maxi | keep | current-renderer | not-started | P1 | Cargo maxi skirt | Keep pockets but reduce clutter |
| maxiSkirt | Maxi skirt | bottom | skirt | maxi, skirt | add | needs-svg | not-started | P1 | Plain maxi skirt | Long skirt without cargo |
| chinos | Chinos | bottom | trouser | chinos, everyday | add | needs-svg | not-started | P2 | Casual chinos | Straight relaxed trouser with pockets |
| dressPants | Dress pants | bottom | trouser | polished, formal | add | needs-svg | not-started | P1 | Clean dress pants | Crease and sharper waistband |

### Shoes

| id | label | category | group | tags | status | flatAssetStatus | threeDStatus | priority | promptNotes | svgNotes |
| - | - | - | - | - | - | - | - | - | - | - |
| sneaker | Color sneaker | shoe | sneaker | colorful, casual | keep | current-renderer | not-started | P0 | Color sneaker | Keep current sneaker branch |
| classicSneaker | Classic sneaker | shoe | sneaker | classic, simple | add | needs-svg | not-started | P0 | White or neutral classic sneaker | Reuse sneaker shape, calmer palette |
| runner | Chunky runner | shoe | sneaker | runner, chunky | keep | current-renderer | not-started | P0 | Chunky runner | Current branch works |
| skateShoe | Skate shoe | shoe | sneaker | skate, flat | add | needs-svg | not-started | P1 | Low skate shoe | Flatter sole, wider toe |
| boot | Platform boot | shoe | boot | platform, night | keep | current-renderer | not-started | P1 | Platform boot | Current boot branch works |
| combatBoot | Combat boot | shoe | boot | combat, lace | add | needs-svg | not-started | P1 | Lace-up combat boot | Boot branch plus lace marks |
| chelseaBoot | Chelsea boot | shoe | boot | chelsea, polished | add | needs-svg | not-started | P1 | Sleek Chelsea boot | Smooth boot, elastic panel |
| loafer | Soft loafer | shoe | flat | loafer, soft | keep | current-renderer | not-started | P0 | Soft loafer | Current branch works |
| mary | Mary Jane | shoe | flat | mary-jane, soft | keep | current-renderer | not-started | P0 | Mary Jane | Current strap branch works |
| balletFlat | Ballet flat | shoe | flat | ballet, flat | add | needs-svg | not-started | P1 | Simple ballet flat | Low shoe, small bow optional |
| slide | Cloud slide | shoe | sandal | slide, comfort | keep | current-renderer | not-started | P0 | Cloud slide | Current branch works |
| hikingShoe | Hiking shoe | shoe | outdoor | hiking, trail | add | needs-svg | not-started | P1 | Hiking shoe | Rugged sneaker/boot hybrid |

### Carry

| id | label | category | group | tags | status | flatAssetStatus | threeDStatus | priority | promptNotes | svgNotes |
| - | - | - | - | - | - | - | - | - | - | - |
| none | None | carry | none | none | keep | current-renderer | not-started | P0 | No carry item | No render |
| crossbody | Crossbody | carry | bag | crossbody, daily | keep | current-renderer | not-started | P0 | Crossbody bag | Main renderer supports custom shape |
| tote | Soft tote | carry | bag | tote, soft | keep | current-renderer | not-started | P0 | Soft tote | Needs distinct main-renderer shape |
| canvasTote | Canvas tote | carry | bag | canvas, tote | add | needs-svg | not-started | P1 | Canvas tote | Light tote with square body |
| mini | Mini bag | carry | bag | mini, occasion | keep | needs-svg | not-started | P1 | Small mini bag | Needs distinct main-renderer shape |
| backpack | Backpack | carry | bag | backpack, school | keep | needs-svg | not-started | P0 | Backpack | Needs main-renderer parity |
| beltbag | Belt bag | carry | bag | belt, compact | keep | needs-svg | not-started | P1 | Belt bag | Needs main-renderer parity |
| messenger | Messenger bag | carry | bag | messenger, school | add | needs-svg | not-started | P1 | Messenger bag | Strap and rectangular body |
| laptopBag | Laptop bag | carry | bag | laptop, work | add | needs-svg | not-started | P2 | Laptop bag | Structured rectangle with handle |
| gymBag | Gym bag | carry | bag | gym, active | add | needs-svg | not-started | P2 | Soft gym duffel | Rounded duffel carried low |

### Accessories / Tools

| id | label | category | group | tags | status | flatAssetStatus | threeDStatus | priority | promptNotes | svgNotes |
| - | - | - | - | - | - | - | - | - | - | - |
| round | Round glasses | glasses | eyewear | round, glasses | keep | current-renderer | not-started | P0 | Round glasses | Keep current branch |
| rect | Rectangle glasses | glasses | eyewear | rectangle, glasses | keep | current-renderer | not-started | P0 | Rectangle glasses | Keep current branch |
| cat | Cat-eye glasses | glasses | eyewear | cat-eye, glasses | keep | current-renderer | not-started | P1 | Cat-eye glasses | Keep current branch |
| thickFrame | Thick frame glasses | glasses | eyewear | thick, glasses | add | needs-svg | not-started | P1 | Thick frames | Heavier stroke rectangle/round hybrid |
| tinted | Tinted lenses | glasses | eyewear | tinted, lenses | add | needs-svg | not-started | P2 | Tinted lenses | Glass fill color, accessible contrast |
| studs | Ear studs | jewelry | jewelry | studs, earrings | keep | current-renderer | not-started | P1 | Small studs | Preserve from generic earrings |
| hoops | Hoop earrings | jewelry | jewelry | hoops, earrings | keep | current-renderer | not-started | P1 | Hoop earrings | Preserve from generic earrings |
| chain | Gold chain | jewelry | jewelry | chain, necklace | keep | current-renderer | not-started | P1 | Gold chain | Current branch works |
| pearl | Pearl drop | jewelry | jewelry | pearl, earrings | keep | current-renderer | not-started | P2 | Pearl drop earrings | Preserve from generic pearl |
| rings | Rings | jewelry | jewelry | rings, hands | add | needs-svg | not-started | P2 | Simple rings | Hand-level detail may be too small |
| watch | Watch | jewelry | jewelry | watch, wrist | add | needs-svg | not-started | P2 | Wrist watch | Wrist band and face |
| beanie | Beanie | accessory | headwear | beanie, cozy | add | needs-png-concept | not-started | P1 | Soft beanie | Needs hair/head layering rules |
| baseballCap | Baseball cap | accessory | headwear | cap, casual | add | needs-png-concept | not-started | P1 | Baseball cap | Brim, crown, hair compatibility |
| bucketHat | Bucket hat | accessory | headwear | bucket, hat | add | needs-png-concept | not-started | P1 | Bucket hat | Soft brim over hair |
| headscarf | Headscarf | accessory | cultural | headscarf, expression | add | needs-png-concept | not-started | P0 | Headscarf/hijab option | Needs respectful fit and variants |
| headphones | Headphones | accessory | audio | headphones | add | needs-svg | not-started | P1 | Over-ear headphones | Headband and cups |
| noiseHeadphones | Noise-reducing headphones | tool | sensory | sensory, headphones | add | needs-svg | not-started | P0 | Noise-reducing headphones | Treat as ordinary style/tool option |
| ha_r | Hearing aid R | hearing | hearing | hearing-aid, right | keep | current-renderer | not-started | P0 | Right hearing aid | Main renderer should preserve side |
| ha_l | Hearing aid L | hearing | hearing | hearing-aid, left | keep | current-renderer | not-started | P0 | Left hearing aid | Main renderer should preserve side |
| ci_both | Cochlear implants | hearing | hearing | cochlear, implants | keep | current-renderer | not-started | P0 | Cochlear implants | Current generic support exists |
| cane | Cane | mobility | mobility | cane | keep | needs-svg | not-started | P0 | Cane | Main renderer parity required |
| wheelchair | Wheelchair | mobility | mobility | wheelchair | keep | needs-svg | not-started | P0 | Wheelchair | Main renderer parity required |
| walker | Walker | mobility | mobility | walker | add | needs-png-concept | not-started | P0 | Walker | Requires body/pose layout decision |
| tablet | AAC tablet | aac | communication | AAC, tablet | keep | needs-svg | not-started | P0 | AAC tablet with symbol grid | Main renderer parity required |
| board | AAC board | aac | communication | AAC, board | keep | needs-svg | not-started | P0 | Low-tech AAC board | Main renderer parity required |
| letterboard | Letter board | aac | communication | letterboard | keep | needs-svg | not-started | P0 | Letter board | Current old-renderer branch exists |
| ipad | iPad | aac | communication | iPad, tablet | keep | needs-svg | not-started | P1 | Consumer tablet | Main renderer parity required |
| medicalBracelet | Medical bracelet | tool | medical | bracelet, safety | add | needs-svg | not-started | P2 | Medical bracelet | Ordinary wrist accessory, not alarmist |

### Vibes

| id | label | category | group | tags | status | flatAssetStatus | threeDStatus | priority | promptNotes | svgNotes |
| - | - | - | - | - | - | - | - | - | - | - |
| v_weekend | Weekend Easy | vibe | Everyday | casual, low-pressure | keep | current-renderer | not-started | P0 | Soft tee, denim, sneakers | Uses existing pieces |
| v_cozyknit | Cozy Knit | vibe | Comfort | cozy, knit | keep | current-renderer | not-started | P0 | Chunky knit, denim, loafers | Add Comfort mood |
| v_linen | Linen Calm | vibe | Everyday | calm, airy | keep | current-renderer | not-started | P0 | Relaxed shirt, shorts, slides | Keep concrete note |
| v_bookstore | Bookstore Soft | vibe | Soft | bookish, soft | add | needs-svg | not-started | P1 | Cardigan, soft trouser/skirt, tote | Needs final item recipe |
| v_romantic | Soft Romantic | vibe | Soft | romantic, soft | keep | current-renderer | not-started | P1 | Cardigan, midi skirt | Keep concrete |
| v_ribbon | Ballet Soft | vibe | Soft | ballet, wrap, gentle | rename | current-renderer | not-started | P1 | Corset/wrap lines, pleated skirt | Rename away from ribbon trend word |
| v_softwrap | Gentle Movement | vibe | Comfort | movement, soft | rename | current-renderer | not-started | P0 | Asymmetric knit, leggings | Add Comfort mood |
| v_tailoring | Quiet Tailoring | vibe | Polished | tailoring, neutral | keep | current-renderer | not-started | P0 | Relaxed shirt, wide trouser | Keep |
| v_office | Office Casual | vibe | Polished | office, casual | add | needs-svg | not-started | P1 | Relaxed shirt/blazer, trousers | Needs blazer or shirt recipe |
| v_interview | Interview Ready | vibe | Polished | interview, confident | add | needs-svg | not-started | P1 | Blazer, dress pants, loafer | Life-context name |
| v_prep | Campus Prep | vibe | Polished | campus, prep | rename | current-renderer | not-started | P1 | Button-up, pleated skirt, backpack | Rename for context |
| v_mono | Monochrome Minimal | vibe | Polished | minimal, monochrome | keep | current-renderer | not-started | P1 | Boxy tee, wide trouser | Keep |
| v_softstreet | Soft Street | vibe | Street | hoodie, street | keep | current-renderer | not-started | P0 | Hoodie, barrel denim, sneakers | Keep |
| v_utility | Utility Street | vibe | Street | utility, cargo | keep | current-renderer | not-started | P0 | Bomber, cargo, boots | Keep |
| v_skate | Skate Easy | vibe | Street | skate, easy | keep | current-renderer | not-started | P0 | Boxy tee, jorts, sneakers | Keep |
| v_creative | Creative Studio | vibe | Creative | art, expressive | add | needs-svg | not-started | P0 | Colorful layer, wide pants, tote | New Creative group anchor |
| v_concert | Concert Night | vibe | Night | concert, night | rename | current-renderer | not-started | P1 | Shine top, dark trouser, boots | Can reuse `v_metallic` recipe |
| v_athleisure | Athleisure | vibe | Active | active, polished | keep | current-renderer | not-started | P0 | Bomber, track pant, runner | Fix trackPant render |
| v_trail | Trail Utility | vibe | Active | outdoor, utility | keep | current-renderer | not-started | P0 | Trail jacket, cargo, runners | Rename shell if needed |
| v_studiomove | Studio Move | vibe | Active | movement, studio | keep | current-renderer | not-started | P1 | Mesh layer, track pant | Fix trackPant render |
| v_airport | Airport Fit | vibe | Comfort | travel, comfort | add | needs-svg | not-started | P0 | Hoodie/sweatshirt, joggers, slide | Strong life-context recognition |
| v_satin | Satin Evening | vibe | Night | satin, evening | keep | current-renderer | not-started | P1 | Slip dress, trouser, warm glam | Keep |
| v_downtown | Downtown | vibe | Night | downtown, boots | keep | current-renderer | not-started | P1 | Corset, dark denim, boots | Keep |
| v_familyParty | Family Party | vibe | Night | party, family | add | needs-svg | not-started | P1 | Soft dressy, comfortable shoes | Life-context name |

## Future 3D Compatibility Notes

- Every catalog item should get a stable id before asset production.
- Add an eventual asset manifest with fields such as `id`, `category`, `flatSvg`, `pngConcept`, `threeDModel`, `materialSlots`, `rigSlots`, and `compatibility`.
- Avoid ids that encode current rendering implementation. Good: `boxBraids`, `classicSneaker`. Risky: `button`, `wavyM`, `e_amy`.
- Outfit items should keep semantic attributes that map to 3D garment slots: `sleeve`, `length`, `neckline`, `fit`, `layer`, `material`, `pattern`, and `coverage`.
- Hair items should define compatibility needs early: head coverage, ear visibility, hat compatibility, hearing-tech compatibility, and optional rig/physics behavior.
- Assistive tools need spatial anchors: hand-held, wrist, ear, head, seated pose, behind-body, front-body.
- The 3D app can use the same ids while swapping `flatAssetStatus` for 3D model readiness.

## Asset Pipeline Notes

1. Define the final item id, label, group, and tags first.
2. Generate PNG concept references only in dev tooling, never in the browser app.
3. Select the best concept based on recognition, dignity, calmness, and compatibility.
4. Rebuild the selected concept as clean inline SVG or renderer logic for the current website.
5. Add the item to `CAT` with the stable id and required renderer attributes.
6. Add validation coverage for any new references and required attributes.
7. Later map the same id to a 3D asset.

Dev-only concept art should live under `tools/` or a clearly ignored/reference-only art directory, with no API key or image generation call in `index.html`.
