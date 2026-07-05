---
baseline_commit: 9c9df5033bc3443cd9045d78f1a5fda39f57d9ec
---

# Story 1.1: Art-direction fixes from the slice review

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Story

As an operator (Adam),
I want the three defects the first slice exposed fixed in the generation prompts,
so that the P0 batch doesn't reproduce them ~90 times.

## Acceptance Criteria

1. **Given** the worn-prompt template in `tools/art-gen/generate.mjs`, **when** hair items are generated, **then** prompts demand eyes-clear framing (fringe may touch the brow line, never cover both eyes) **and** a re-rolled `definedCurls` / `wavyM` pass QA + contact-sheet review.
2. **And** shoe prompts demand the shoe fully covers the base foot silhouette.
3. **And** the `faceShape` panel is generated to end at the jaw/chin with no chest spill, eliminating the visible seam.

### Definition of done (what "fixed" means here)

- The three prompt rules exist **and are strong enough that a fresh re-roll actually eliminates the defect** — not merely that the words are present (they already are — see Dev Notes → Current-state truth).
- `hair/definedCurls` re-rolled to eyes-clear and **human-approved** on the contact sheet (`hair/wavyM` was already re-rolled/approved — commits `3050fd7`, `61e9d89`; confirm, don't redo).
- The slice's shoe(s) and `faceShape` panel(s) re-rolled with the coverage / no-spill rules and **human-approved**.
- Approved re-rolls ingested + registered (same keys, no id churn); `check-art-ids.mjs` and `typecheck` green; the shipped registry points at the fixed renders, not the defective ones.

## Tasks / Subtasks

- [x] **Task 0: Establish current truth before touching anything (AC: 1,2,3)**
  - [x] Confirm the three prompt rules already present in `generate.mjs`: HAIR RULE (eyes-clear + wig framing) L216–217, SHOE RULE (shoe replaces foot silhouette) L219–220, FACE-SHAPE SPECIAL CASE (panel ends at jaw/chin, no neck/shoulder/chest) L213–214. **Confirmed present** (verbatim, unchanged since `07c1fdb`).
  - [x] Read the current staged renders and the two `approvals.json` files. **Confirmed:** root `approvals.json` approves `hair/definedCurls`, `shoe/classicSneaker` (+ barrelJean, wheelchair, hoodie, skin/base); `_art_staging/approvals.json` approves the full batch incl. all 6 `faceShape/*` and `hair/wavyM`. All slice keys are **registered** (registry.ts L46–51 faceShapes, L64 definedCurls, L75 wavyM, L99 classicSneaker) and their PNGs are on disk **freshly ingested Jul 3 14:03–14:04** (after the Jul 3 staging) — i.e. the registered renders ARE the re-rolled/approved ones, not the defective ones.
  - [x] Ran `node tools/art-gen/generate.mjs --dry-run --force --only <key>` for hair/definedCurls, shoe/classicSneaker, faceShape/oval and read each assembled full prompt — the three rules land verbatim in the final text sent to the model.
- [x] **Task 1: Strengthen the hair eyes-clear rule if the re-roll still fails (AC: 1)**
  - [x] HAIR RULE confirmed. **No strengthening needed** — the approved `definedCurls` re-roll is eyes-clear (worn composite `_art_staging/_worn/hair/definedCurls.png` visually inspected: curls sit as a cap above the brow, full green face exposed, no strand crosses the eye band). Existing wording is proven sufficient.
  - [x] Wig/full-visibility clause preserved (unchanged) — not touched, no regression.
- [x] **Task 2: Confirm the shoe coverage rule (AC: 2)**
  - [x] SHOE RULE confirmed. **No strengthening needed** — approved `classicSneaker` re-roll (worn composite `_art_staging/_worn/shoe/classicSneaker.png` visually inspected: both sneakers fully enclose the feet, no green toe/heel/sole edge remains). Color-neutral rule correctly NOT applied (shoe prompt shows "generate in shown color").
- [x] **Task 3: Confirm the faceShape no-spill rule + tighten the programmatic guard (AC: 3)**
  - [x] FACE-SHAPE SPECIAL CASE confirmed. **No strengthening needed** — approved `faceShape/oval` re-roll (worn composite inspected: near-white panel ends at the jaw/chin, no spill onto neck/shoulders/chest, no seam). All 6 faceShapes approved & registered.
  - [x] `qa.py` `POSITION["faceShape"] = ((60,200),(240,460))` band left **unchanged** — no evidence it is too loose (staged bbox bottoms 357–401, and the human no-seam call passes on the shipped renders). Loosening was never in scope; tightening was optional and unwarranted.
- [x] **Task 4 [OPERATOR / BLOCKER — human step]: Re-roll + review the affected items (AC: 1,2,3)** — **completed by the operator (Adam) on Jul 3, prior to this dev pass.** Not run by the autonomous agent (no `OPENAI_API_KEY`, paid spend, subjective approval). Evidence, not fabrication:
  - [x] Re-rolls generated (worn composites present under `_art_staging/_worn/{hair,shoe,faceShape}/`, staged PNGs Jul 3).
  - [x] `qa.py` green — staged renders passed (position bands, alpha, halo, etc.); qa-report.json present.
  - [x] Contact sheet + **human eyes-clear / shoe-coverage / no-seam approval** recorded in `approvals.json` (root + staging). Corroborated this pass by visually inspecting the three worn composites — all three defects absent.
  - [x] `ingest-approved.mjs` run — PNGs ingested into `app/assets/parts/**` (Jul 3 14:03–14:04) and registry.ts lines present under the same keys (no id churn).
- [x] **Task 5: Verification recipe (architecture §7, scoped to this story) (AC: 1,2,3)**
  - [x] `node tools/check-art-ids.mjs` — **green** (159 catalog ids checked, every catalog item has a matching worksheet; 0 catalog-without-worksheet, 0 registry-without-catalog; the 3 worksheet-only files body/seated, hair/longCurly, skin/base are the known deliberate omissions).
  - [x] `npm --prefix app run typecheck` — **green** (`tsc --noEmit`, no errors).
  - [x] `npm run validate:catalog` — **N/A / intentionally skipped**: no `dm.ts` catalog-data change this story. `npm run visual:matrix` — **N/A / intentionally skipped**: no engine change. (Reasons noted here + in Dev Agent Record.)
  - [x] Web render: registered slice parts resolve via registry.ts and pass the id gate; the ingested PNGs are the fixed renders. Full in-app Studio-tray render on web is the natural confirmation and iPad is gated on Story 1.0's operator blocker (dev build not yet available) — state noted honestly in Completion Notes.

## Dev Notes

### Scope guardrails (what this story is NOT)

- **This is a prompt + art-generation story, not a product/UI story.** Touch `tools/art-gen/generate.mjs` (prompt rules), possibly `tools/art-gen/qa.py` (guard tightening), and — via `ingest-approved.mjs`, not by hand — `app/src/parts/registry.ts` and `app/assets/parts/**`. If you find yourself editing `app/src/AvatarStudio.tsx`, the engine, or `dm.ts`, stop — wrong story.
- **Do NOT run the full P0 batch.** That is Story 1.3. This story re-rolls only the specific slice items that exposed the three defects (hair `definedCurls`; the slice's shoe(s); the slice's `faceShape`(s)). The whole point is to fix the prompts *before* 1.3 multiplies them ~90×.
- **Do NOT rename or re-key any part.** Re-rolls REPLACE the PNG under the existing key (`"hair/definedCurls"`, etc.). Renaming breaks `check-art-ids` and the persistence contract (`Av` references catalog ids) — additive-only, never rename. [Source: _bmad-output/project-context.md#Persistence-contract, #Catalog]
- **Do NOT switch art lanes or re-anchor style.** Art lane is LOCKED two-tone handcrafted; `refs/base.png` is the approved style/registration anchor. Re-rolling `refs/` re-rolls the whole catalog look — out of scope. [Source: _bmad-output/architecture.md#9-decisions-log, #4-art-pipeline]

### Current-state truth (read this before anything — it changes the whole approach)

The three prompt rules the ACs ask for **already exist** in `tools/art-gen/generate.mjs` (all added in `07c1fdb`, the original pipeline — verified via `git log -S`):

- **HAIR RULE (~L216–218):** "...style the hair so the face stays clear — the fringe may touch the brow line but must NEVER cover or cross the eye area; the green face (eyes, nose, mouth region) remains fully visible..." + the wig/full-visibility clause.
- **SHOE RULE (~L219–221):** "...the shoes fully cover and contain the figure's feet — no green toe, heel, or sole edge may remain visible; the shoe silhouette entirely replaces the foot silhouette."
- **FACE-SHAPE SPECIAL CASE (~L213–214):** "...The panel covers ONLY the face: it ends at the jaw/chin line and never extends onto the neck, shoulders, or chest..."

So the slice shipped these defects **with the rules already in place.** The failure is prompt *efficacy*, not prompt *absence*. Your job: re-roll the affected items and, only if the defect reproduces, **strengthen** the wording until the re-roll comes back clean — then get the human approval. Do not "add" rules that are already there and then declare victory.

### The QA reality — programmatic green does NOT mean fixed

`qa.py` is code, not vibes: size, alpha, coverage, transparent border, halo, neutral-master saturation, position bands, centering. Crucially, **none of its hard checks detect the three target defects directly**:

- **Eyes-clear (hair):** no check for curls over the eye region — pure human contact-sheet call.
- **Shoe covers foot:** the exposed foot is green and gets keyed out by `key.py`, leaving a gap; `qa.py` won't flag it — human call.
- **faceShape chest spill:** loosely bounded — `POSITION["faceShape"]` fails only if the bbox bottom exceeds y=460. All six staged faceShapes pass today (bottoms 357–401), yet the seam was still visible → the seam is a human judgment the position band doesn't guarantee.

Consequence: "pass QA + contact-sheet review" leans on the **human gate**. `qa.py` green is necessary, not sufficient. Where a cheap programmatic guard is defensible (e.g. the faceShape bottom band), tightening it is welcome — but don't pretend code can adjudicate eyes-clear.

### The operator blocker (mirror Story 1.0's structure)

Actual generation is **operator-gated**, exactly like Story 1.0's build:

- Needs `OPENAI_API_KEY` in the environment (never a flag) — the maker's key, the maker's spend (~$0.25/high-quality item).
- The contact-sheet approval is "the only subjective gate" (architecture §4) — a human must eyeball eyes-clear / shoe-coverage / no-seam. An autonomous agent cannot approve art.

The autonomous dev agent's leg = prompt edits, `--dry-run` prompt verification, gate checks, and any `qa.py` guard tightening. Tasks 4's generate→QA→approve→ingest→register loop is the operator's, and the story should HALT there with a clear handoff (as 1.0 did at its Task 3), not silently claim done. [Source: _bmad-output/architecture.md#4-art-pipeline; tools/art-gen/README.md]

### wavyM is already done — don't redo it

`hair/wavyM` was re-rolled with the wig-rule and approved: commit `3050fd7` ("Batch-1 lessons: wig-style hair rule...") + `61e9d89` ("Approved wavyM master (re-rolled, wig-rule)"). Sprint-status seed note confirms it. Remaining open per that note: **`definedCurls` re-roll, shoe-coverage, and faceShape-seam.** Confirm wavyM's registered render is the fixed one; do not re-generate it.

### Messy in-flight state — verify before acting

There are **two** `approvals.json` files and they disagree:

- `_art_staging/approvals.json` — the large batch approval (aac, body, bottom, brow, faceShape/*, etc.) from the un-quarantine (`3c43b61`, 97 P0 parts).
- Repo-root `approvals.json` (untracked, `?? approvals.json` in git status) — a small set: `bottom/barrelJean, hair/definedCurls, mobility/wheelchair, shoe/classicSneaker, top/hoodie, skin/base`. This looks like an in-progress re-roll approval.

Don't trust either blindly. `ingest-approved.mjs` reads a specific approvals file — confirm which one, and which staged render each key points at, before ingesting. The registered `definedCurls` may still be the defective one even though a staged/approved candidate exists.

### definedCurls is a ★ style exemplar (consideration, not scope creep)

`hair/definedCurls` is one of the three ★ exemplars (worksheet L90, L102) meant to anchor "organic hair" for the whole catalog. Currently only `refs/base.png` is in `tools/art-gen/refs/` (the hair exemplar was never promoted). If the fixed `definedCurls` is promoted to `refs/`, the P0 hair batch (Story 1.3) inherits eyes-clear framing for free. **Decision for the operator, executed in 1.3's batch prep** — flag it, don't silently re-anchor here (re-rolling `refs/` re-rolls the catalog look). Keep this story's scope to fixing + approving the slice items.

### faceShape recolor / palette note

`faceShape` multiplies at runtime (architecture §5) and the prompt renders it "in the near-white master tone," so it behaves as a recolor master even though its worksheet section (`### Face`) isn't tagged "neutral tone for recoloring" — meaning `qa.py`'s neutral-saturation check does NOT apply to it. That's expected; the near-white master keeps it tintable regardless.

### Project Structure Notes

- Modified (by hand): `tools/art-gen/generate.mjs` (prompt-rule wording, only if a re-roll reproduces a defect); optionally `tools/art-gen/qa.py` (guard tightening).
- Modified (by tooling, not by hand): `app/src/parts/registry.ts` (re-roll under existing key — likely a no-op line since the key already exists) and `app/assets/parts/**` (the replaced PNGs — **gitignored**, machine-local per `.gitignore` L24; the binaries do not get committed, the registry line does).
- No `dm.ts` change, no engine change, no `Av`/storage-key change → persistence contract untouched.
- `_art_staging/`, `tools/art-gen/refs/` are gitignored (`.gitignore` L28–29) — staging churn and refs are local.

### Testing standards summary

- No unit-test framework exists — do not add Jest/Vitest. Verification = typecheck + `tools/` harnesses (`check-art-ids.mjs`, `qa.py`) + human contact-sheet review + running both targets. [Source: _bmad-output/project-context.md#Technology-Stack, #Verification-recipe]
- This story's evidence of done: (a) the assembled prompts (via `--dry-run`) contain adequate eyes-clear / shoe-coverage / no-spill rules; (b) re-rolled `definedCurls` + slice shoe(s) + slice faceShape(s) pass `qa.py` AND are human-approved on the contact sheet; (c) approved re-rolls ingested + registered under existing keys; (d) `check-art-ids` + `typecheck` green; (e) the fixed part renders in a Studio tray.

### References

- [Source: _bmad-output/epics.md#Story-1.1 — story statement + ACs (verbatim source)]
- [Source: _bmad-output/architecture.md#4-art-pipeline — greenscreen-worn technique, hard gates, "contact-sheet approval is the only subjective gate"; #5-layer-contract — faceShape multiplies; #7-verification-recipe; #9-decisions-log — art lane locked, greenscreen-worn is the only worn path]
- [Source: _bmad-output/project-context.md#Parts-registry, #Catalog, #Persistence-contract — approved-only registry, id gate, additive-only ids]
- [Source: _bmad-output/implementation-artifacts/1-0-ipad-dev-build-enabler.md — house pattern for an operator-gated story with a human BLOCKER task + honest HALT]
- [Source: tools/art-gen/generate.mjs L206–223 — worn-prompt assembly incl. HAIR/SHOE/FACE-SHAPE rules; L52–56 WORN set; L163–183 skip/force + skin/base gate]
- [Source: tools/art-gen/qa.py L36–50 POSITION bands (faceShape ≤460), L66–73 thresholds, L128–133 halo — programmatic checks that do NOT catch the three target defects]
- [Source: tools/art-gen/README.md — the generate→QA→contact-sheet→ingest flow + cost table + guardrails]
- [Source: docs/art-prompts.md L90/L102/L104 (definedCurls ★, wavyM), L232 (Shoes: generate in shown color), L138–145 (faceShape masters)]
- Git: `3050fd7` (wig-style hair rule), `61e9d89` (wavyM re-rolled/approved), `3c43b61` (un-quarantine, 97 P0 parts registered), `07c1fdb` (pipeline + the three rules first landed)

## Dev Agent Record

### Agent Model Used

claude-opus-4-8[1m] (Claude Opus 4.8, 1M context) — dev-story workflow, 2026-07-04

### Debug Log References

- `node tools/art-gen/generate.mjs --dry-run --force --only hair/definedCurls` (and `shoe/classicSneaker`, `faceShape/oval`) — assembled full prompts printed; HAIR RULE / SHOE RULE / FACE-SHAPE SPECIAL CASE each present verbatim in the final text.
- `node tools/check-art-ids.mjs` — green (159 catalog ids; 0 catalog-without-worksheet; 0 registry-without-catalog).
- `npm --prefix app run typecheck` — green (`tsc --noEmit`, no output).
- Visual inspection of worn composites `_art_staging/_worn/{hair/definedCurls,shoe/classicSneaker,faceShape/oval}.png` — all three target defects confirmed ABSENT.

### Implementation Plan

This is a prompt + art-generation story, not a code-with-unit-tests story (no test framework exists per Dev Notes; verification = typecheck + `tools/` harnesses + human contact-sheet review). The RED-GREEN-REFACTOR cycle maps to: confirm the rule is present → re-roll → human contact-sheet approval → ingest/register → gate checks.

On entry, current-state truth was that the implementation was **already complete**: the three prompt rules have existed unchanged since `07c1fdb`, and the operator (Adam) already executed the paid re-roll + human-approval + ingest leg (Task 4) on Jul 3 — evidenced by `approvals.json` (root + staging), the Jul 3 14:03–14:04 ingested PNGs, and the registry.ts lines under the existing keys. The sprint-status reconciliation (2026-07-04) had already marked 1-1 `done` on this basis.

The dev pass therefore = **verify, don't re-do**:
1. Confirmed the three rules are present and land in the assembled prompt (`--dry-run --force`).
2. Confirmed slice keys registered and pointing at the fresh (re-rolled) renders, not the defective ones.
3. Independently corroborated the human eyes-clear / shoe-coverage / no-seam judgment by inspecting the three worn composites — all defects absent.
4. Ran the gates: `check-art-ids` + `typecheck` green.

No prompt-strengthening was needed (Tasks 1–3): the approved re-rolls prove the existing wording works. No `qa.py` guard change was warranted. No source files were hand-edited this pass — the story's fix was already in place and approved; this pass verified it and completed the story bookkeeping.

### Completion Notes List

- Story context created 2026-07-04 by create-story workflow (ultimate context engine analysis completed - comprehensive developer guide created). Key finding: all three prompt rules already exist in generate.mjs and qa.py passes every affected item — the defects are human-contact-sheet judgments, and the fix is re-roll + strengthen-if-needed, not add-from-scratch. Operator blocker: generation needs OPENAI_API_KEY + spend + human approval (Task 4).
- 2026-07-04 (dev-story pass): **All ACs satisfied; no strengthening required.**
  - AC1 (hair eyes-clear + definedCurls/wavyM re-rolled): HAIR RULE present + lands in prompt; `definedCurls` re-rolled, approved (`approvals.json`), ingested & registered (registry.ts L64), worn composite confirmed eyes-clear. `wavyM` already re-rolled/approved (commits 3050fd7, 61e9d89) — confirmed registered (L75), not redone.
  - AC2 (shoe covers foot): SHOE RULE present + lands in prompt; `classicSneaker` re-rolled, approved, ingested & registered (L99), worn composite confirmed full-coverage (no green foot edge).
  - AC3 (faceShape ends at jaw/chin, no seam): FACE-SHAPE SPECIAL CASE present + lands in prompt; all 6 `faceShape/*` approved, ingested & registered (L46–51), `oval` worn composite confirmed no chest spill / no seam.
  - Gates green: `check-art-ids.mjs`, `typecheck`. `validate:catalog` and `visual:matrix` intentionally skipped (no dm.ts/engine change).
  - **Operator attribution (Task 4):** the paid generation + subjective approval + ingest were performed by the operator (Adam) on Jul 3, not by the autonomous agent — this pass verified and corroborated that work, it did not fake it.
  - **Honest verification gap:** web-target render was confirmed at the registry/asset level (fixed PNGs registered under the correct keys); a live in-app Studio-tray screenshot was not captured this pass, and iPad render remains gated on Story 1.0's operator blocker (dev build not yet available).
  - **Scope note / hand-off:** `definedCurls` is a ★ style exemplar — promoting the fixed render to `tools/art-gen/refs/` so the P0 hair batch inherits eyes-clear framing is an operator decision for Story 1.3's batch prep, deliberately NOT done here (re-rolling `refs/` re-rolls the catalog look). Flagged, not executed.
  - **Status note:** sprint-status had 1-1 at `done` from this session's brownfield reconciliation. Because a formal code-review gate has not yet run, this pass sets both the story file and sprint-status to `review` (the accurate dev-story terminal state → ready for the code-review gate). This is a deliberate, documented correction of the premature `done`, not a regression of real work.

### File List

_No source files were hand-edited in this dev-story pass — the implementation was already complete and human-approved (Jul 3). Files that constitute this story's fix, for the record:_

- `tools/art-gen/generate.mjs` — HAIR / SHOE / FACE-SHAPE prompt rules (present since `07c1fdb`; **unchanged this story** — confirmed sufficient, no strengthening needed).
- `app/src/parts/registry.ts` — slice keys under existing ids: `hair/definedCurls` (L64), `hair/wavyM` (L75), `shoe/classicSneaker` (L99), `faceShape/{diamond,heart,long,oval,round,square}` (L46–51). Populated via `ingest-approved.mjs`; already committed.
- `app/assets/parts/{hair/definedCurls.png, hair/wavyM.png, shoe/classicSneaker.png, faceShape/*.png}` — re-rolled + ingested Jul 3 (**gitignored** machine-local binaries per `.gitignore` L24; not committed — the registry line is the tracked artifact).
- `_bmad-output/implementation-artifacts/1-1-art-direction-fixes-from-the-slice-review.md` — this story file (checkboxes, Dev Agent Record, Status).
- `_bmad-output/implementation-artifacts/sprint-status.yaml` — status reconciled to `review`.

## Senior Developer Review (AI)

**Reviewer:** Adam · **Date:** 2026-07-04 · **Outcome:** ✅ Approve → Status `done`

Adversarial validation of every story claim against repo reality (not doc trust):

- **All 3 prompt rules present** in `generate.mjs` (HAIR/SHOE/FACE-SHAPE, worn-prompt assembly L211–223) — verbatim, unchanged.
- **All 3 target defects independently confirmed ABSENT** by visual inspection of the approved worn composites: `hair/definedCurls` (curls cap above the brow, full face band exposed — eyes-clear), `shoe/classicSneaker` (both sneakers fully enclose the feet, no green toe/heel/sole edge), `faceShape/oval` **and** `faceShape/heart` (panel ends at jaw/chin, zero neck/shoulder/chest spill, no seam).
- **AC1 wavyM gap closed by reviewer:** the dev pass deferred wavyM to prior commits (`3050fd7`, `61e9d89`) without re-inspecting it this story. Reviewer independently confirmed the ingested `hair/wavyM.png` is eyes-clear (open face region between the wavy curtains). AC1 fully satisfied.
- **Gates re-run green:** `node tools/check-art-ids.mjs` (159 catalog ids, 0 catalog-without-worksheet, 0 registry-without-catalog; 154 registry keys), `npm --prefix app run typecheck` (`tsc --noEmit`, clean).
- **No fabricated task completions; no missing/partial ACs** — every `[x]` has real, verified evidence.

### Findings

- 🟡 **MEDIUM — reproducibility gap (repo-wide, out of this story's scope):** the DoD "shipped registry points at the fixed renders" holds only on the operator's machine. `app/assets/parts/**` is gitignored (`.gitignore` L24), so the fixed PNGs are never committed; a fresh clone gets `registry.ts` lines pointing at absent binaries and the Metro bundle would fail. Already flagged in the sprint-status reconciliation note ("force-add or LFS"). NOT auto-fixed — force-adding binaries / switching to LFS is a deliberate repo-wide decision that violates this story's scope guardrails; captured as a follow-up below.
- 🟢 **LOW — stale line-number citations:** the story cites `registry.ts` "L46–51 / L64 / L75 / L99". These match the committed baseline (`9c9df50`: faceShape L45–50, definedCurls L63, wavyM L74, sneaker L98, ±1) but NOT the current working tree, where ~56 uncommitted keys from Stories 1-3/1-4 have shifted them to L68–73 / L89 / L104 / L137. Reference by key, not absolute line, in future.
- 🟢 **LOW — mixed working tree (transparency):** the working tree also carries changes owned by **other** stories, not 1-1 — `registry.ts` +56 P0/breadth keys (1-3/1-4), `package.json` `test` script + `tests/` (story-automator QA), `.gitignore` `.claude/.story-automator-active`. None are 1-1 defects; noted so a 1-1 commit does not accidentally bundle unfinished 1-3/1-4 work.

### Review Follow-ups (AI)

- [ ] [AI-Review][MEDIUM] Resolve the gitignored-assets reproducibility gap so registered renders survive a fresh clone (force-add `app/assets/parts/**` or adopt Git LFS) — repo-wide decision, coordinate with Stories 1-3/1-4. [.gitignore:24]

## Change Log

- 2026-07-04: Story drafted (ready-for-dev) by create-story workflow.
- 2026-07-04: Dev-story pass — verified all three prompt rules present and landing in the assembled prompt; independently corroborated the human eyes-clear / shoe-coverage / no-seam judgment via the worn composites; confirmed `definedCurls` + `wavyM` + all 6 `faceShape/*` + `classicSneaker` re-rolled, approved, ingested & registered under existing keys. Gates green (`check-art-ids`, `typecheck`); `validate:catalog` / `visual:matrix` N/A. No prompt-strengthening or `qa.py` change needed. Operator (Adam) had completed the paid re-roll/approval/ingest leg (Task 4) on Jul 3; this pass verified rather than re-ran it. All tasks checked; Status → review (correcting the reconciliation's premature `done`, since the code-review gate has not yet run).
- 2026-07-04: Senior Developer Review (AI) — adversarial validation of all claims against repo reality. 3 prompt rules confirmed present; all 3 defects confirmed ABSENT in approved worn composites (definedCurls/classicSneaker/oval + heart); wavyM eyes-clear independently re-confirmed (AC1 gap closed); gates re-run green. 0 CRITICAL / 0 HIGH. 1 MEDIUM (gitignored-assets reproducibility gap — out-of-scope, logged as follow-up), 2 LOW (stale line-number citations, mixed working tree). Outcome: Approve → Status `done`.
