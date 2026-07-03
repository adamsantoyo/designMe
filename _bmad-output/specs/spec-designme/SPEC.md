---
id: SPEC-designme
companions:
  - ../../../CLAUDE.md
  - ../../../docs/art-bible.md
  - ../../../docs/art-prompts.md
  - ../../../docs/avatar-engine.md
  - ../../../docs/catalog-bible.md
  - ../../../docs/firefly-workflow.md
  - ../../project-context.md
sources:
  - ../../../docs/build-kickoff.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability only — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# designMe — recognition-first avatar + style explorer

## Why

A vision to realize and a pain to solve: autistic people, AAC/multimodal communicators, and others who benefit from communication support often cannot *tell* you what they like — but can *show* you. Existing AAC-adjacent tools are clinical, and the clinical look IS the stigma. designMe is a no-typing avatar creator and personal-style explorer built for self-expression and autonomy — made so someone like the maker's sister can use it with pride ("not just another AAC app"). When any design decision is ambiguous, choose more independence, more dignity, less pressure.

## Capabilities

- **CAP-1 Avatar Studio (avatar-is-the-menu)**
  - **intent:** User changes any part of their avatar by tapping the avatar region itself (hair, face, top, bottom, shoes, tools), which opens a contextual tray of large visual tiles that live-swap with a soft settle — plus shuffle, save, and undo.
  - **success:** Every catalog category is reachable through region taps with zero menu-tree navigation and zero text input; a swap renders instantly; undo restores the prior state exactly. States covered: default, tray-open, saved-confirmation, first-run, undo.

- **CAP-2 This-or-that second door ("Find my vibe")**
  - **intent:** User who cannot or does not want to point at what they want reacts to pairs of proposed looks; a few rounds converge on a starting style.
  - **success:** A switch-scanning user can complete the full flow with binary choices only, ending at a "your starting style" result applied to their avatar.

- **CAP-3 Lookbook**
  - **intent:** User saves looks to a calm gallery and taps a saved look to wear it again — the "something to show" artifact.
  - **success:** Saved looks survive app restart and crash (local persistence); re-wearing one reproduces the saved look pixel-identically. States: populated and empty.

- **CAP-4 Randomized non-default start**
  - **intent:** A brand-new user lands directly in play with a randomized, non-default avatar — no tutorial, no sign-up, no gate of any kind.
  - **success:** First launch to interactive Studio with no interstitial; repeated fresh launches produce varied (never light-skin-default) starting avatars.

- **CAP-5 Deterministic layered avatar engine**
  - **intent:** The app composites transparent PNG parts in the fixed z-order (art-bible §4), recoloring neutral masters at runtime via multiply tint (per-color bakes for hard cases), as a pure function of avatar state + catalog.
  - **success:** Same state → same pixels, verifiable by harness (`tools/engine-smoke.mjs`, `visual:matrix`); a missing asset renders a neutral placeholder silhouette so the app runs before art exists.

- **CAP-6 Representative curated catalog**
  - **intent:** User picks from a palette-locked catalog (14 skin tones, 18 hair colors, 16 garment colors) where assistive tech, skin features, and cultural expression are ordinary options alongside fashion, and vibes are whole-look recipes assembled from parts.
  - **success:** Catalog data matches `docs/catalog-bible.md` ids exactly (`tools/check-art-ids.mjs` passes); every item is available to every avatar; vibes render by composing real part layers, never a baked image.

- **CAP-7 Art generation pipeline (build-time)**
  - **intent:** Operator turns each catalog item into one transparent, full-frame, registered PNG named by its id — via the primed-worksheet flow (`docs/art-prompts.md`) or the Firefly flow (`docs/firefly-workflow.md`) — and ingests it (`tools/art-lab/ingest.py`) into the parts registry.
  - **success:** An ingested part passes art-bible §8 QA (recognizable at ~64px, on-palette, registered, tintable, dignified) and appears in the app with a one-line registry addition.

## Constraints

- **Recognition over recall:** no required typing, sign-up, caregiver gate, modal/tutorial walls, scores, streaks, timers, flashing, autoplay audio, infinite scroll, or per-tap latency. The app never initiates; the user does.
- **Accessibility:** WCAG AA contrast; touch targets ≥48px (primary ≥64px); full keyboard operation with visible focus; honor reduced motion; lean on native iPadOS assistive features (Switch Control, Guided Access) rather than reinventing them.
- **Representation:** never a light skin default; gender-expansive — no gendered menus; bodies non-evaluative; assistive tech drawn with the same warmth as fashion, never clinical or alarmist.
- **Determinism:** randomness exists only in shuffle, which writes state; the renderer is pure. No AI and no network on the interaction hot path. Front-end only; AsyncStorage is the only persistence.
- **Platform:** one Expo codebase shipping web + iPad. Skia canvas (Expo dev build) is the render target; plain `Image` tint is a stopgap that loses the two-tone shading.
- **Art lane LOCKED (2026-06-26): two-tone handcrafted** — flat base + one warm shadow + one soft highlight, neutral masters recolored by multiply, per-color bakes only where tint fails (denim, metallics). Re-rolling the lane re-rolls the whole catalog.
- **Palette lock:** assets use only art-bible §3 hexes. Parts are full-frame registered on 1024×1536 (bust 1024×1024); filenames = catalog ids.
- **Stable ids:** catalog ids are a persistence and 3D-forward contract — semantic, never renamed once shipped.
- **Art process:** the undressed state is a designed state (friendly mannequin, no anatomical definition); never evaluate or share a composite without a face; AAC tablet/board/letterboard are the only items permitted to show text/symbols.

## Non-goals

- No backend, accounts, or sync — local-only by design, not as a phase.
- No recommendation engine or feed; the "more like this" board, if ever built, is deterministic, user-pulled, small, and escapable (de-Pinterested). Deferred.
- No onboarding/tutorial and no sign-up screens — permanently, not "later."
- No runtime AI or image generation — all art is pre-generated.
- Deferred from MVP: aura backgrounds, piercings, fabric-texture assets, crownBraid, heels, 3D rendering (ids stay 3D-compatible; nothing more).
- Not chasing fashion micro-trends — timeless clothes, trend jargon demoted to small tag chips.

## Success signal

A brand-new user — no instructions, no typing — in about one minute (1) makes an avatar that resembles themselves and (2) dresses it in a vibe they like, then saves it; never told they're wrong, never made to wait. Demonstrable as a live first-session walkthrough on iPad and web.

## Assumptions

- Initial catalog scope is sister-focused (per CLAUDE.md): the active hair set in `art-prompts.md`/`firefly-workflow.md`; the broader breadth targets in `catalog-bible.md` apply later.
- Skia's Expo-dev-build requirement (no Expo Go) is an accepted distribution constraint.
- Vibes-first entry (catalog-bible) and Studio-first framing (build-kickoff) are complementary — vibes are content for trays/this-or-that, not a competing screen.
- `art-bible.md` §0 supersedes `catalog-bible.md`'s retired file/format constraints (inline-SVG-only, PNG-as-dev-reference-only); its values still hold.

## Open Questions

- **Id reconciliation:** `check-art-ids.mjs` reports 21/61 catalog↔worksheet mismatches. Which side is canonical — `app/src/dm.ts` ids or `art-prompts.md` filenames?
- **Primary art lane:** is the Firefly workflow (verified July 2026) now primary, demoting the ChatGPT PREFIX worksheet to fallback?
- **Deep-tone recolor:** multiply crushes shading on black hair and the deepest skins; given "never a light default," is the planned ramp/SVG runtime fix a ship-blocker or a post-MVP improvement?
- **Exemplar status:** are the 3 style exemplars (`definedCurls`, `hoodie`, `wheelchair`) and `skin/base` locked? Mass generation is gated on them (art-bible §8).
