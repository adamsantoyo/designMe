---
stepsCompleted: [1, 2, 3, 4]
inputDocuments:
  - specs/spec-designme/SPEC.md
  - project-context.md
  - architecture.md
  - ../CLAUDE.md
---

# designMe - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for designMe, decomposing the requirements from the SPEC (PRD-equivalent), project-context, and Architecture into implementable stories. Extraction accounts for verified-done state as of 2026-07-03: the art pipeline (tools/art-gen), the first lovable slice (12 parts), and the in-app PNG render are built and verified — stories cover what remains.

## Requirements Inventory

### Functional Requirements

FR1: Tapping any avatar region (hair, face, top, bottom, shoes, tools) opens a contextual tray of large visual tiles that live-swap the part with a soft settle; shuffle, save, and undo are one tap each. Every catalog category is reachable with zero menu-tree navigation and zero text input. (CAP-1)

FR2: A "Find my vibe" this-or-that flow proposes two looks per round; a few rounds converge on a starting style applied to the avatar. The entire flow is completable with binary choices only (switch-scanning compatible). (CAP-2)

FR3: Users save looks to a Lookbook gallery and tap a saved look to wear it again; saved looks survive app restart and crash, and re-wearing reproduces the look pixel-identically. Populated and empty states exist. (CAP-3)

FR4: First launch lands directly in an interactive Studio with a randomized, non-default avatar — no interstitial, tutorial, sign-up, or gate; repeated fresh launches produce varied starts that are never the light-skin default. (CAP-4)

FR5: The avatar engine composites transparent PNG parts in the fixed manifest z-order, recoloring neutral masters at runtime via multiply tint, as a pure function of avatar state + catalog; a missing asset renders the deterministic SVG fallback (complete figure, never a partial PNG stack). (CAP-5)

FR6: The catalog is palette-locked (14 skins / 18 hair / 16 garment colors) with assistive tech, skin features, and cultural expression as ordinary options; ids match catalog-bible/worksheet exactly (checker-gated); every item is available to every avatar; vibes compose real part layers, never baked images. (CAP-6)

FR7: The operator turns every remaining catalog item into approved, registered PNG art via the verified pipeline: batch generate → programmatic QA → contact-sheet approval → ingest → registry. (CAP-7, pipeline itself DONE — remaining work is running it to catalog completion and art-direction iteration)

### NonFunctional Requirements

NFR1: Recognition over recall — never: required text input, sign-up/caregiver gates, modal/tutorial walls, scores, streaks, timers, flashing, autoplay audio, infinite scroll, per-tap latency. The app never initiates; the user does.

NFR2: Accessibility — WCAG AA contrast; touch targets ≥48px (primary ≥64px); full keyboard operation with visible focus; every interactive element has accessibilityRole + label; honor reduced motion; lean on native iPadOS assistive tech (Switch Control, Guided Access) rather than reinventing.

NFR3: Representation — never a light-skin default; gender-expansive (no gendered menus, every item every avatar); bodies non-evaluative; assistive tech drawn warm, never clinical.

NFR4: Determinism — same state → same pixels; randomness only in shuffle (writes state); no AI/network on the interaction hot path.

NFR5: Platform — one Expo codebase shipping web + iPad; web-only verification is not verification; Skia requires an Expo dev build (accepted).

NFR6: Persistence safety — catalog ids and the Av shape are additive-only (or explicit migration); a broken saved look breaks the core product promise.

NFR7: Art lane locked — two-tone handcrafted, neutral masters + multiply recolor; asset footprint target ~5MB full catalog (quantize/WebP pass in ingest, visually QA'd).

### Additional Requirements

- Metro cannot dynamic-require: every approved PNG needs a static registry line; registry carries ONLY contact-sheet-approved art.
- Coverage gate: PNG mode never presents a partial stack — SVG fallback until a state's every wanted slot has art.
- Gates before any art generation: check-art-ids.mjs green; skin/base exists; generation only via tools/art-gen (greenscreen-worn for worn categories, face-split for features).
- Face parts are full-frame 1024×1536 (bust frame retired until SkiaFigure has a head-box transform).
- dmFigureV2.ts ↔ dmFigureV2.runtime.js parity; visual:matrix diffs must be intentional.
- Theme tokens only (src/theme.ts); CalmBoundary stays wrapping the tree; deps only via npx expo install inside app/.
- Verification recipe per architecture §7 applies to every story's definition of done.

### UX Design Requirements

The UX design contract lives at `ux-designs/ux-designme-2026-07-03/` (DESIGN.md + EXPERIENCE.md, final 2026-07-03). It codifies rather than adds requirements — FR1–FR4 and NFR1–NFR3 remain the requirement source; the spines govern implementation detail (tokens, component behavior, state patterns, interaction primitives, Sofia/Rio journeys) and win over any mock on conflict.

### FR Coverage Map

| Requirement | Epic |
|---|---|
| FR7, NFR7 (catalog art to completion) | Epic 1 |
| FR5, NFR4, NFR5 (PNG engine to product default) | Epic 2 |
| FR2, NFR1, NFR2 (second door) | Epic 3 |
| FR3, NFR6 (lookbook + persistence) | Epic 4 |
| FR4, FR1, NFR1–NFR3 (first-run + studio polish + a11y audit) | Epic 5 (FR1's interaction shell is brownfield-done; 1.4 verifies tray reachability per batch, 5.2 audits operability) |
| NFR5 (ship both targets) | Epic 6 |
| FR6 | Cross-cutting: gated in Epics 1–2 stories via check-art-ids/validate-catalog |

## Epic List

- **Epic 1 — A full closet:** every catalog item has approved, registered art (P0 batch → review loop → P1/P2), with the art-direction fixes the slice exposed and an asset-size pass so the catalog ships at ~5MB.
- **Epic 2 — PNG is the product:** grow the PNG engine from lab slice to product default — full slot coverage, height/crop behavior, crossfade, retina decision, and the flip from SVG-default to PNG-default with SVG as fallback only.
- **Epic 3 — The second door works for switch users:** this-or-that completes end-to-end with binary-only input, converges on a starting style, and applies it.
- **Epic 4 — Looks that survive:** lookbook save/re-wear is pixel-faithful across restart, crash, and app update (id/shape migration safety).
- **Epic 5 — Calm first minute:** randomized non-default start verified, studio interaction complete for every category, and a full accessibility pass (AA contrast, keyboard, reduced motion, labels).
- **Epic 6 — On real glass:** the app runs verified on iPad (dev build) and deployed web, with the verification recipe automated where possible.

## Epic 1: A full closet

Every remaining catalog item becomes approved, registered art through the verified pipeline, so the trays are real instead of placeholders.

### Story 1.1: Art-direction fixes from the slice review

As an operator (Adam),
I want the three defects the first slice exposed fixed in the generation prompts,
So that the P0 batch doesn't reproduce them ~90 times.

**Acceptance Criteria:**

**Given** the worn-prompt template in tools/art-gen/generate.mjs
**When** hair items are generated
**Then** prompts demand eyes-clear framing (fringe may touch the brow line, never cover both eyes) and a re-rolled definedCurls/wavyM pass QA + contact-sheet review
**And** shoe prompts demand the shoe fully covers the base foot silhouette
**And** the faceShape panel is generated to end at the jaw/chin with no chest spill, eliminating the visible seam.

### Story 1.2: Asset optimization in ingest

As a user on a slow connection,
I want part assets small,
So that the app loads instantly and the full catalog stays ~5MB.

**Acceptance Criteria:**

**Given** tools/art-lab/ingest.py
**When** a part is ingested
**Then** fully-transparent pixels are RGB-scrubbed and the output is quantized/WebP-encoded behind a flag
**And** a before/after toggle appears on the contact sheet for visual QA
**And** the slice's 13 parts re-ingest with no visible quality loss and ≥70% size reduction.

### Story 1.3: P0 batch generated and reviewed

As the product's first user (the sister),
I want every P0 catalog item to have real art,
So that every tray offers her actual choices.

**Acceptance Criteria:**

**Given** gates green (check-art-ids, skin/base, refs)
**When** the operator runs the P0 batch (~90 items)
**Then** every item stages with QA green or an auto-retry/flagged failure list
**And** the contact sheet presents all candidates with QA badges
**And** rejected items re-roll via --force --only until approved or explicitly deferred
**And** approved items ingest + register, with check-art-ids and typecheck green.

### Story 1.4: P1/P2 breadth batch

As a user exploring style,
I want the lower-priority items (boots, bags, jewelry, headwear, P1 hair),
So that the catalog reaches its curated breadth.

**Acceptance Criteria:**

**Given** the P0 batch is approved and lessons captured in prompts
**When** the operator runs --priority all for remaining items
**Then** the same QA→review→ingest loop completes
**And** every registered id appears in a Studio tray on both targets.

## Epic 2: PNG is the product

The PNG engine graduates from dev-toggle lab to the product's default renderer, with SVG as the deterministic fallback only.

### Story 2.1: Full slot coverage in the manifest

As a user,
I want every catalog category to render in PNG mode,
So that no selection silently downgrades my avatar to a different art style.

**Acceptance Criteria:**

**Given** approved art exists for a category (from Epic 1)
**When** its manifest entries are added (slot, z, tintMode per architecture §5)
**Then** resolveLayers stacks it correctly on both targets
**And** coverage() reflects it and the PNG_SLICE restriction widens accordingly
**And** eye tinting policy (fixed) and recolor-master policies are honored per category.

### Story 2.2: Height, crop, and tray-tile behavior in PNG mode

As a user,
I want region-zoomed tray tiles and height variation to work in PNG mode,
So that direct manipulation feels identical in both engines.

**Acceptance Criteria:**

**Given** PNG mode active
**When** a tray opens with region crop tiles
**Then** SkiaFigure's crop mapping matches the SVG engine's regions visually
**And** heightScaleY renders without seam artifacts at all five heights
**And** crossfade soft-swap works (or reduced-motion snaps) on part change.

### Story 2.3: Default-engine flip

As the product owner,
I want PNG to become the default renderer once coverage crosses the product bar,
So that users see the premium art by default.

**Acceptance Criteria:**

**Given** Epic 1 approved catalog + stories 2.1–2.2 done
**When** engineMode defaults to "png"
**Then** any state with partial coverage still renders the complete SVG fallback (never a partial stack)
**And** visual:matrix and both-target verification pass
**And** the dev toggle remains available in __DEV__ for lab work.

## Epic 3: The second door works for switch users

### Story 3.1: This-or-that end-to-end flow

As a switch-scanning user,
I want to react to two proposed looks per round and get a starting style,
So that I can express taste without pointing or navigating.

**Acceptance Criteria:**

**Given** the ThisOrThat door is opened
**When** the user completes the rounds using only two switch actions (next/select)
**Then** each round presents exactly two looks rendered by the product engine
**And** the flow converges to a "your starting style" result within a bounded number of rounds
**And** selecting the result applies it to the avatar and returns to the Studio
**And** no time pressure, scoring, or forced completion exists — exit is always available.

### Story 3.2: Second-door reachability and a11y

As a first-time user,
I want the this-or-that door discoverable from the Studio without reading,
So that the cold-start path is real.

**Acceptance Criteria:**

**Given** a fresh session
**When** the Studio renders
**Then** the second door is reachable via one labeled ≥64px control
**And** the full flow passes keyboard-only and VoiceOver walkthroughs
**And** every tile pair is distinguishable non-visually (labels) and at 64px.

## Epic 4: Looks that survive

### Story 4.1: Pixel-faithful re-wear

As a user,
I want a saved look to come back exactly,
So that what I made is mine and stays mine.

**Acceptance Criteria:**

**Given** a look saved in the Lookbook
**When** the app is killed and relaunched and the look is worn
**Then** the rendered avatar is pixel-identical (same state → same pixels, verified via engine harness on the saved Av)
**And** the Lookbook renders populated and empty states per design.

### Story 4.2: Persistence contract tests

As a future maintainer,
I want automated guards on the storage contract,
So that no refactor can silently break saved looks.

**Acceptance Criteria:**

**Given** the persisted keys (lookbook v3, currentAv v3, explored v1) and the Av shape
**When** contract tests run in CI/harness
**Then** removing/renaming an Av field or catalog id referenced by a stored fixture fails the test
**And** a documented migration path exists for any intentional change.

## Epic 5: Calm first minute

### Story 5.1: Randomized non-default start verified

As a brand-new user,
I want to land in play with an avatar that could be me,
So that the first minute is expression, not setup.

**Acceptance Criteria:**

**Given** fresh storage
**When** the app launches N times (harness)
**Then** starting avatars vary and are never the lightest skin tones as default
**And** launch → interactive Studio has no interstitial of any kind
**And** the start state always renders complete (SVG fallback rules apply).

### Story 5.2: Full accessibility audit pass

As a user of assistive tech,
I want the whole surface operable and calm,
So that independence is real, not aspirational.

**Acceptance Criteria:**

**Given** the complete Studio + doors + Lookbook
**When** audited against NFR2 (AA contrast, ≥48/64px targets, keyboard + focus ring, labels, reduced motion)
**Then** every violation is fixed or ticketed with rationale
**And** the audit runs on both web and iPad
**And** banned patterns (NFR1) are verified absent.

## Epic 6: On real glass

### Story 6.1: iPad dev build runs the slice

As the maker,
I want the app verified on an actual iPad with Skia,
So that "one codebase, two targets" is proven, not assumed.

**Acceptance Criteria:**

**Given** an Expo dev build on iPad
**When** the PNG slice renders and trays operate
**Then** rendering matches web (visual spot-check), touch targets measure ≥48/64px physically
**And** Guided Access session works full-bleed
**And** any platform divergence lands as a `.web.tsx`/`Platform.OS` fix with both siblings updated.

### Story 6.2: Web deploy target

As a caregiver or friend,
I want a URL that runs the product,
So that sharing designMe requires nothing installed.

**Acceptance Criteria:**

**Given** the Expo web build
**When** deployed to the chosen target (decision: GH Pages replacement vs alternative)
**Then** the deployed build passes the verification recipe's web checks
**And** assets load lazily with the optimized sizes from Story 1.2
**And** the legacy PoC remains archived, not served as the product.
