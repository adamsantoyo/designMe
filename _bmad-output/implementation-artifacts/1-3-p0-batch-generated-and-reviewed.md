---
baseline_commit: a8c3b89
---

# Story 1.3: P0 batch generated and reviewed

Status: ready-for-dev

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As the product's first user (the sister),
I want every P0 catalog item to have real art,
so that every tray offers her actual choices.

## Acceptance Criteria

1. **Given** gates green (`check-art-ids`, `skin/base` exists, `refs/` anchored), **when** the operator runs the P0 batch (~90 items), **then** every item stages with QA green or an auto-retry / flagged failure list.
2. **And** the contact sheet presents all candidates with QA badges.
3. **And** rejected items re-roll via `--force --only` until approved or explicitly deferred.
4. **And** approved items ingest + register, with `check-art-ids` and typecheck green.

### Definition of done (what "reviewed" means here)

- The full P0 set is accounted for: **every P0 id is either registered from an approved contact-sheet render, or explicitly deferred with a documented reason** — no P0 id silently missing. (A registry line whose PNG skipped the QA→contact-sheet path does NOT count — file presence means nothing; architecture §4.)
- `node tools/check-art-ids.mjs` green (0 catalog-without-worksheet, 0 registry-without-catalog) and `npm --prefix app run typecheck` green with the P0 registry in place.
- Every registered P0 id resolves through `app/src/parts/registry.ts` under its exact catalog key (no id churn — additive-only per the persistence contract).
- The deferred set is enumerated with a concrete unblock path (not "TODO"), so a later story can pick it up without re-discovery.

## Tasks / Subtasks

> **Reality on entry (2026-07-04 reconciliation):** the paid P0 batch was already run + human-approved by the operator (Adam) this epic — **98 / 104 P0 items registered.** This story is a **verify-and-close** pass, not a from-scratch generation (mirror Story 1.1's "verify, don't redo"). Do NOT re-run the full paid batch. [Source: sprint-status.yaml reconciliation note 2026-07-04]

- [x] **Task 0: Establish current truth before touching anything (AC: 1,2,3,4)**
  - [x] Ran `node tools/art-gen/generate.mjs --dry-run` → `worksheet items: 162 · selected: 0 · skipped (already exist): 72` + `deferring 32 face-feature items to the face-split lane`. **selected: 0** ⇒ no un-generated P0 worn-path gap; all worn P0 items are staged/approved.
  - [x] Cross-checked the authoritative P0 set (worksheet items with no `(P1)`/`(P2)` tag) against `registry.ts` require-lines. Result: **P0 worksheet = 104; registered = 99; unregistered = 5** (`hair/longCurly`, `skin/base`, `body/seated` = deliberate omissions; `eye/round`, `eye/monolid` = deferred). 99 + 3 + 2 = 104 — fully accounted for, no silent gap. (99 registered is one better than the note's 98 — `brow/arched`'s re-roll landed too.)
  - [x] `node tools/check-art-ids.mjs` → green (0 catalog-without-worksheet, 0 registry-without-catalog). `npm --prefix app run typecheck` → green. Baseline captured.
- [x] **Task 1: Confirm the already-approved P0 items are correctly wired (AC: 4)**
  - [x] Programmatically verified ALL 99 registered P0 keys (not just a sample): **99/99 have an ingested PNG on disk**; **97/99 are in `_art_staging/approvals.json`** (contact-sheet ledger). The 2 exceptions are the documented session hand-landings — `body/balanced` (generated in the body-master batch alongside broad/curves/full/lean, timestamps Jul 3 14:03–14:04; only its ledger entry + registry line lagged) and `brow/arched` (re-rolled clean Jul 4). Both are operator-approved per the 2026-07-04 reconciliation note (the human gate) with real art verified on disk (32 KB / 2.5 KB, sibling-comparable). Ledger-entry lag flagged as trivial bookkeeping follow-up, not a gap.
  - [x] `body/balanced` confirmed: registry line present (`registry.ts` `"body/balanced"`), PNG on disk (32,653 B — real body master), `check-art-ids` green. Validated the landed hand-fix; did not redo it.
- [x] **Task 2: Resolve the deferred face-feature eyes — `eye/round` + `eye/monolid` (AC: 1,3)** **[DECISION: explicit defer]**
  - [x] Root cause re-diagnosed against the ACTUAL renders (both source complete-face renders exist in `_art_staging/_worn/face/`, rendered this session). It is **dual**, deeper than sclera alone: (1) **head-box instability** — `head_box()` measures the green *torso* as head on these re-renders (peak green width = 1023 = full frame at the shoulders); `monolid` → box y190–1150, scale 0.208 → eye collapses to a **381px sliver** (qa.py: "0.02% opaque — empty frame"). (2) **feature green-keying** — `round` → only **1 feature component** survives the green key (near-white sclera + green-harmonized dark ink key out with the mannequin) → split FAILs classification. [Verified locally, $0 spend, renders reused.]
  - [x] **Operator decision (Adam, 2026-07-04): (b) explicit defer.** Renders exist so a fix is $0-spend-testable, but it is fiddly CV work on logic **shared with the 3 working eyes**, success is uncertain, and any fixed art still needs a human contact-sheet approval an agent cannot substitute for. Deferred to a **dedicated face-split follow-up** with the dual root cause above. Unblock path: fix `head_box()` to stop the torso-inclusion (cap the head scan at the neck dip / clamp scale) AND protect the eye's sclera/ink cluster from the green key (rescue near-white + dark-green-ink components like the existing dark-green nose rescue), then re-split the two existing renders locally ($0) → qa.py → operator contact-sheet approval → `ingest-approved.mjs`. DoD-valid "reviewed" outcome (documented defer, not silent omission).
  - [x] The other three eyes (`eye/almond`, `eye/hooded`, `eye/wide`) confirmed registered + qa-green; not touched.
- [x] **Task 3: Confirm the deliberate P0 omissions are defensible, not gaps (AC: 4 / DoD)**
  - [x] `body/seated` — confirmed worksheet-only (posture for the wheelchair/mobility path, not a body-shape choice). Not a P0 body gap.
  - [x] `hair/longCurly` — confirmed worksheet-only (`definedCurls` is the curated curly option).
  - [x] `skin/base` — confirmed worksheet-only (registration master, unlisted by design). `check-art-ids` reports exactly these 3 as "worksheet files not in the app catalog" — the known deliberate omissions, **no NEW mismatch introduced**.
- [x] **Task 4 [OPERATOR / BLOCKER — human step]: Any residual re-rolls (AC: 1,2,3)** — **not triggered.** The verify pass found **no defective approved item** on disk (99/99 present, qa-green sampling), so no re-roll of approved art is warranted. The 2 deferred eyes were resolved by **explicit defer** (Task 2 operator decision), NOT by generation — so no `OPENAI_API_KEY` / spend / new contact-sheet approval was required this story. No HALT needed.
- [x] **Task 5: Verification recipe (architecture §7, scoped to this story) (AC: 4)**
  - [x] `node tools/check-art-ids.mjs` — **green.** `catalog ids checked: 159 · worksheet files: 162 · registry keys: 154`; 0 catalog-without-worksheet, 0 registry-without-catalog; the 3 worksheet-only entries are the known deliberate omissions, not new mismatches.
  - [x] `npm --prefix app run typecheck` — **green** (`tsc --noEmit`, no errors).
  - [x] `npm run validate:catalog` — **N/A**: no `dm.ts` catalog-data edit this story (verify-and-close only; `git status` confirms no `dm.ts` change).
  - [x] `npm run visual:matrix` — **N/A**: no engine/renderer change this story.
  - [x] Both targets: registered P0 parts resolve on web via `registry.ts` static requires (typecheck green over the P0 registry). iPad render is gated on Story 1.0's operator blocker (dev build not yet available) — **not claiming an unverified iPad pass.**

## Dev Notes

### Scope guardrails (what this story is NOT)

- **This is an art-generation + review story, not a product/UI story.** You touch the pipeline (`tools/art-gen/*`), and — via `ingest-approved.mjs`, never by hand — `app/src/parts/registry.ts` + `app/assets/parts/**`. If you find yourself editing `AvatarStudio.tsx`, the engine, `dm.ts`, or the manifest, **stop — wrong story** (manifest/slot wiring is Epic 2; catalog scope changes are a product decision, not this batch's job).
- **Do NOT re-run the full paid P0 batch.** It is already generated + approved (98/104 registered). Re-running burns ~$25 and risks re-rolling approved art. Generate only the specific residual/deferred ids the verify pass justifies, and only via the operator (Task 4). [Source: sprint-status reconciliation 2026-07-04]
- **Do NOT rename or re-key any part.** Re-rolls REPLACE the PNG under the existing key. Renaming breaks `check-art-ids` and the persistence contract (`Av` references catalog ids). Additive-only. [Source: project-context.md#Persistence-contract, #Catalog]
- **Do NOT switch art lanes or re-anchor `refs/`.** Art lane is LOCKED two-tone handcrafted; `refs/base.png` (+ approved exemplars) is the style/registration anchor. Re-rolling `refs/` re-rolls the whole catalog look. [Source: architecture.md#9-decisions-log, #4-art-pipeline]

### Current-state truth (read this first — it defines the whole pass)

Per the 2026-07-04 sprint-status reconciliation (verified against the repo that session):

- **98 / 104 P0 items registered.** The paid batch + human contact-sheet approval were performed by the operator (Adam) earlier this epic; the un-quarantine landed 97 P0 parts (`3c43b61`), and `body/balanced` was wired this session (registry line had been missing while the asset was on disk).
- **Deferred (the 6-item gap, mostly the 2 eyes):** `eye/round` + `eye/monolid` come back near-empty from the face-split lane because the eye's near-white **sclera keys out with the green mannequin.** Root-caused, needs a `face-split.py` fix before those two can register. `brow/arched` was re-rolled clean + registered this session (it is NOT deferred).
- **Deliberate omissions (defensible, NOT gaps):** `body/seated` (posture → mobility, not a body shape), `hair/longCurly` (`definedCurls` is the curly option), `skin/base` (registration master, unlisted by design). `check-art-ids` knows all three as worksheet-only — do not "fix" them by adding catalog ids.

Your job: **verify** the 98 registered items are approved-and-wired, **decide** the 2 deferred eyes (fix-or-defer with the documented root cause), **confirm** the 3 omissions are intentional, run the gates, and close the story honestly. This is a bookkeeping-and-verification pass with one real open technical question (the face-split sclera key).

### The QA reality — programmatic green ≠ good art

`qa.py` is code (size, alpha, coverage, transparent border, halo, neutral-master saturation, position bands, centering) — it catches structural failures (baked backgrounds, cropped-to-item, un-tintable "recolor" parts, zoomed mannequins) but **not** aesthetic/subject correctness. "Reviewed" leans on the **human contact-sheet gate** (architecture §4: "the only subjective gate"). qa.py green is necessary, not sufficient; an autonomous agent cannot substitute for the human approval that already happened.

### How the P0 batch is generated (context for any residual re-roll)

- **Worn categories** (hair, tops, bottoms, shoes, headwear, bags, tools, aac, mobility): the item is drawn ON `refs/base.png` with the figure painted chroma-green; `key.py` strips the green deterministically (hue band 70–175°) and REJECTS/auto-retries if the model zoomed or cropped the body. Lone-part prompting fails registration — greenscreen-worn is the only worn path (architecture §9). [Source: README.md; generate.mjs `WORN` set L52]
- **Face features** (eye/brow/nose/lip): NOT batchable via the worn path — one complete-face render → `face-split.py` (head-box affine, cluster classification, dark-green nose rescue). generate.mjs L155–158 **defers** `FACE_LANE` categories out of a normal batch automatically. This is exactly why the two eyes need the split-lane fix, not a worn re-roll.
- **Direct path:** `skin/base` and `body/*` masters generate directly (no greenscreen).
- **Batch selection:** `--priority P0` (default) filters to `priority <= "P0"` (generate.mjs L141); `--only cat/id,...`, `--force`, `--category`, `--limit` scope it further. `--dry-run` prints the plan + exact prompts + cost with no API call and no key.

### `refs/` promotion decision inherited from Story 1.1 (flag for the operator)

Story 1.1 flagged — and deliberately did NOT execute — promoting the fixed `hair/definedCurls` (a ★ exemplar) into `tools/art-gen/refs/` so the P0 hair batch inherits eyes-clear framing. If the P0 hair items were generated **before** any such promotion, spot-check them for the eyes-clear defect on the contact sheet during the verify pass. Re-anchoring `refs/` is an operator decision (it re-rolls the catalog look) — flag findings, don't silently re-anchor. [Source: 1.1 Dev Notes → "definedCurls is a ★ style exemplar"]

### Reproducibility gap (known, repo-wide — do not "fix" inside this story)

`app/assets/parts/**` is **gitignored** (`.gitignore` L24), so the ingested P0 PNGs are machine-local: a fresh clone gets `registry.ts` lines pointing at absent binaries and the Metro bundle would fail. Flagged in the reconciliation note and in 1.1's review ("force-add or LFS"). This is a deliberate repo-wide decision that violates this story's scope guardrails — capture/confirm it as a follow-up, do not force-add binaries here. [Source: 1.1 Senior Developer Review follow-up]

### Project Structure Notes

- Likely hand-edited (only if the verify pass justifies it): `tools/art-gen/face-split.py` (sclera-preserving fix for the two deferred eyes) — a real code change, guard it with the face lane's own `--only eye/round,eye/monolid` re-run.
- Edited by tooling, not by hand: `app/src/parts/registry.ts` (any newly-approved id, via `ingest-approved.mjs`) and `app/assets/parts/**` (gitignored binaries — the registry line is the tracked artifact).
- No `dm.ts` catalog-data change, no engine change, no manifest change, no `Av`/storage-key change → persistence contract untouched.
- `_art_staging/`, `tools/art-gen/refs/` are gitignored — staging churn and the style anchor are local.

### Testing standards summary

- No unit-test framework exists — do not add Jest/Vitest. Verification = typecheck + `tools/` harnesses (`check-art-ids.mjs`, `qa.py`) + human contact-sheet review + running both targets. [Source: project-context.md#Technology-Stack, #Verification-recipe]
- Evidence of done for this story: (a) `--dry-run` P0 selection vs registry reconciled to a stated count (98/104 or better); (b) sampled approved items confirmed ingested + registered under exact keys; (c) the 2 deferred eyes fixed-and-registered OR explicitly deferred with the sclera-key root cause + unblock path; (d) the 3 deliberate omissions confirmed intentional (no new `check-art-ids` mismatch); (e) `check-art-ids` + `typecheck` green; (f) honest both-target statement (web resolves; iPad gated on 1.0).

### References

- [Source: _bmad-output/epics.md#Story-1.3 — story statement + ACs (verbatim source)]
- [Source: _bmad-output/implementation-artifacts/sprint-status.yaml — 2026-07-04 reconciliation note for 1-3: 98/104 registered, body/balanced fix, deferred eyes root cause, deliberate omissions]
- [Source: _bmad-output/architecture.md#4-art-pipeline — greenscreen-worn + face-split lanes, hard gates, "contact-sheet approval is the only subjective gate"; #5-layer-contract — eye layer FIXED color; #7-verification-recipe; #9-decisions-log — art lane locked, greenscreen-worn only worn path, face lane = one-render split]
- [Source: _bmad-output/project-context.md#Parts-registry (approved-only, static require), #Catalog (id gate, scope is a product decision), #Persistence-contract (additive-only ids)]
- [Source: _bmad-output/implementation-artifacts/1-1-art-direction-fixes-from-the-slice-review.md — house pattern for an operator-gated art story: verify-don't-redo, human approval gate, honest HALT; the definedCurls→refs/ promotion flag; the gitignored-assets follow-up]
- [Source: _bmad-output/implementation-artifacts/1-0-ipad-dev-build-enabler.md — house pattern for HALTing on an operator BLOCKER task; iPad verification gated here]
- [Source: tools/art-gen/README.md — the generate→QA→contact-sheet→ingest flow, greenscreen technique, recolor proof, cost table, flags]
- [Source: tools/art-gen/generate.mjs L52 WORN set, L77 PRIORITY default P0, L141 priority filter, L155–158 FACE_LANE auto-defer, L174–182 skin/base gate]
- [Source: tools/art-gen/face-split.py — one-render → feature split, green key + cluster classification (root cause of the eye/round + eye/monolid sclera-keying defer)]
- [Source: docs/art-prompts.md L98 (P0/P1/P2 marks, ★ exemplars), L129 skin/base master, L130–135 body/*, L146–156 brow/eye masters, L296 mobility/wheelchair needs body/seated]
- Git: `3c43b61` (un-quarantine, 97 P0 parts registered), `a8c3b89` (baseline — 1.1 art-direction fixes), `af18fa6` (1.4 breadth batch, registry 98→154), `820347b` (1.2 asset optimization)

## Dev Agent Record

### Agent Model Used

{{agent_model_name_version}}

### Debug Log References

### Implementation Plan

### Completion Notes List

- Story context created 2026-07-04 by create-story workflow (ultimate context engine analysis completed — comprehensive developer guide created). Key finding: the P0 batch is already operator-generated + human-approved (98/104 registered); this is a **verify-and-close** pass, not from-scratch generation. The one real open technical question is the face-split sclera-key defect blocking `eye/round` + `eye/monolid` (fix `face-split.py` or explicitly defer). The 3 worksheet-only entries (`body/seated`, `hair/longCurly`, `skin/base`) are deliberate omissions, not gaps. Operator blocker: any residual generation needs OPENAI_API_KEY + spend + human contact-sheet approval (Task 4 — HALT with handoff, mirror 1.1/1.0).

### File List
