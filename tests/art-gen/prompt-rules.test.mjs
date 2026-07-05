// Story 1.1 — Art-direction fixes from the slice review.
//
// Regression harness for the three prompt rules the first slice exposed as defects.
// The defects (hair over eyes, exposed foot behind shoe, faceShape chest-spill seam)
// are human contact-sheet judgments that qa.py cannot detect — but their PREVENTION
// lives in prompt wording that MUST land verbatim in the assembled prompt. If any of
// these clauses is ever weakened or dropped, the P0 batch (Story 1.3) would reproduce
// the defect ~90×. These tests lock the wording end-to-end through the real CLI.

import { test } from "node:test";
import assert from "node:assert/strict";
import { assembledPrompt } from "./helpers.mjs";

// AC1 — hair eyes-clear framing -------------------------------------------------
test("AC1: hair prompt demands eyes-clear framing (fringe may touch brow, never cover eyes)", () => {
  const p = assembledPrompt("hair/definedCurls");
  assert.match(p, /HAIR RULE/, "HAIR RULE header must be present");
  assert.match(
    p,
    /fringe may touch the brow line but must NEVER cover or cross the eye area/,
    "eyes-clear clause (the exact defect guard) must be present",
  );
  assert.match(
    p,
    /green face \(eyes, nose, mouth region\) remains fully visible/,
    "the 'face fully visible' guarantee must be present",
  );
});

test("AC1: hair prompt preserves the full-visibility wig clause (no strand occluded)", () => {
  const p = assembledPrompt("hair/definedCurls");
  assert.match(p, /like a full wig displayed on a mannequin/);
  assert.match(p, /no strand may be occluded by the figure/);
});

test("AC1: already-approved hair/wavyM still carries the same HAIR RULE (no regression)", () => {
  // wavyM was re-rolled + approved earlier (commits 3050fd7, 61e9d89). Confirm its
  // prompt was not weakened relative to definedCurls.
  const p = assembledPrompt("hair/wavyM");
  assert.match(p, /HAIR RULE/);
  assert.match(p, /must NEVER cover or cross the eye area/);
});

// AC2 — shoe fully covers the foot silhouette -----------------------------------
test("AC2: shoe prompt demands the shoe fully covers the base foot silhouette", () => {
  const p = assembledPrompt("shoe/classicSneaker");
  assert.match(p, /SHOE RULE/, "SHOE RULE header must be present");
  assert.match(
    p,
    /no green toe, heel, or sole edge may remain visible/,
    "no-exposed-foot clause (the exact defect guard) must be present",
  );
  assert.match(
    p,
    /shoe silhouette entirely replaces the foot silhouette/,
    "silhouette-replacement clause must be present",
  );
});

test("AC2: shoe is generated in its shown color, NOT as a recolor master", () => {
  // Regression guard: if a shoe were ever tagged 'neutral tone for recoloring' it
  // would render near-white and the coverage read would be meaningless. The slice
  // shoe must keep its own color.
  const p = assembledPrompt("shoe/classicSneaker");
  assert.doesNotMatch(
    p,
    /this item is a recolor master/,
    "shoe must not receive the recolor-master COLOR rule",
  );
});

// AC3 — faceShape ends at jaw/chin, no chest spill / seam ------------------------
const FACE_SHAPES = ["diamond", "heart", "long", "oval", "round", "square"];

for (const shape of FACE_SHAPES) {
  test(`AC3: faceShape/${shape} panel ends at the jaw/chin with no neck/shoulder/chest spill`, () => {
    const p = assembledPrompt(`faceShape/${shape}`);
    assert.match(p, /FACE-SHAPE SPECIAL CASE/, "FACE-SHAPE header must be present");
    assert.match(
      p,
      /it ends at the jaw\/chin line/,
      "jaw/chin end clause (the seam guard) must be present",
    );
    assert.match(
      p,
      /never extends onto the neck, shoulders, or chest/,
      "no-chest-spill clause must be present",
    );
  });
}

// Rule isolation — a defect fix for one category must not leak into another,
// and each category's own rule must not go missing when others are absent.
test("Isolation: hair prompt carries only the HAIR RULE (no SHOE / FACE-SHAPE leakage)", () => {
  const p = assembledPrompt("hair/definedCurls");
  assert.doesNotMatch(p, /SHOE RULE/);
  assert.doesNotMatch(p, /FACE-SHAPE SPECIAL CASE/);
});

test("Isolation: shoe prompt carries only the SHOE RULE (no HAIR / FACE-SHAPE leakage)", () => {
  const p = assembledPrompt("shoe/classicSneaker");
  assert.doesNotMatch(p, /HAIR RULE/);
  assert.doesNotMatch(p, /FACE-SHAPE SPECIAL CASE/);
});

test("Isolation: faceShape prompt carries only the FACE-SHAPE rule (no HAIR / SHOE leakage)", () => {
  const p = assembledPrompt("faceShape/oval");
  assert.doesNotMatch(p, /HAIR RULE/);
  assert.doesNotMatch(p, /SHOE RULE/);
});
