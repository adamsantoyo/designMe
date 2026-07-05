# Test Automation Summary — Story 1.1 (Art-direction fixes from the slice review)

**Generated:** 2026-07-04 · **Framework:** Node built-in test runner (`node:test` + `node:assert/strict`) · **Run:** `npm test`

## Why this framework (not Playwright / E2E)

Story 1.1 is a **prompt + art-generation** story — it has no UI, no HTTP API, and no
runtime user workflow to drive in a browser. Its ACs are about wording that must land
in the prompt sent to gpt-image-1, and about the registry/id contract. Playwright is
installed at the repo root but there is nothing renderable to E2E for this story, and
the project has no unit-test framework by design (Dev Notes: "do not add Jest/Vitest").

So the honest end-to-end surface is the **art-generation CLI itself**. The tests drive
`tools/art-gen/generate.mjs --dry-run` — the pipeline's own documented verification
path — end to end (spawn the real CLI, read the assembled prompt it would send) and
assert on the outcome. Zero new dependencies; matches the existing `tools/*.mjs`
harness convention.

## Generated Tests

### Prompt-rule regression — `tests/art-gen/prompt-rules.test.mjs`
Locks the three defect-prevention clauses so a future prompt edit can't silently
weaken them and let Story 1.3's batch reproduce the defect ~90×.

- [x] **AC1** — hair prompt demands eyes-clear framing (fringe may touch brow, never cross the eye area; face stays fully visible) + the full-visibility wig clause.
- [x] **AC1** — already-approved `hair/wavyM` still carries the same HAIR RULE (no regression on the earlier re-roll).
- [x] **AC2** — shoe prompt demands the shoe fully covers/replaces the foot silhouette (no green toe/heel/sole edge).
- [x] **AC2** — shoe is generated in its shown color, *not* mis-tagged as a recolor master.
- [x] **AC3** — all 6 `faceShape/*` panels end at the jaw/chin with no neck/shoulder/chest spill (the seam guard).
- [x] **Isolation** — each category's rule appears only in its own prompt (hair prompt has no SHOE/FACE-SHAPE rule, etc.), so a per-category fix can't leak or go missing.

### Registry + id-gate — `tests/art-gen/registry-and-gate.test.mjs`
Locks the "shipped registry points at the fixed renders under the existing keys"
half of the Definition of Done.

- [x] All 9 slice keys (`hair/definedCurls`, `hair/wavyM`, `shoe/classicSneaker`, `faceShape/{diamond,heart,long,oval,round,square}`) are **live-registered** (comment lines excluded) mapping id → `assets/parts/<id>.png` — proves no id churn/rename.
- [x] `check-art-ids.mjs` gate passes (worksheet id == catalog id == registry key).
- [x] `qa.py` faceShape POSITION band bottom stays `<= 460` — the one cheap programmatic backstop against a panel bbox spilling down the chest.

## Coverage

| AC | What it requires | Automated coverage |
|----|------------------|--------------------|
| AC1 | Hair eyes-clear framing; `definedCurls`/`wavyM` re-rolled | ✅ prompt wording + registry (both keys) |
| AC2 | Shoe fully covers the foot | ✅ prompt wording + registry + color-mode guard |
| AC3 | faceShape ends at jaw/chin, no seam | ✅ prompt wording (×6) + registry (×6) + qa.py band |

- **Prompt rules:** 3/3 covered · **Slice registry keys:** 9/9 covered · **Gates asserted:** check-art-ids, qa.py band
- **Total:** 25 tests, all passing (~0.7s).

### Deliberate coverage boundary (not a gap)
The three *actual* defects — curls over eyes, exposed foot, faceShape seam — are
**pixel/perceptual judgments** that only a human contact-sheet review can adjudicate
(Dev Notes: "qa.py green is necessary, not sufficient"). Automated tests cannot and
should not claim to verify them; they verify the **prevention** (the prompt wording +
the id/registry contract that ships the approved render). The human gate remains the
authority on the rendered pixels — this suite guards the inputs that feed it.

## Next Steps

- Run `npm test` in CI alongside `check-art-ids.mjs` + `typecheck` as a pre-batch gate before Story 1.3's P0 run.
- When Story 1.3 promotes a fixed `definedCurls` to `tools/art-gen/refs/`, no test change is needed — the prompt-rule assertions are ref-agnostic.
