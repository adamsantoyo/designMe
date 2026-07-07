// Phase 4 — the dmFigure fallback drew a base blush for every face AND a stronger
// feature blush (extras-identity) when the "blush" feature was on, stacking to a double
// blush. This locks the collapse: under the feature, only the feature blush remains.

import { test } from "node:test";
import assert from "node:assert/strict";
import dmFigure from "../app/src/engine/dmFigure.js";
import { base } from "../tools/engine-cases.mjs";

// rx="6" ry="3.6" is the base blush ellipse signature; #d98b76 is the feature blush color.
const baseBlush = (svg) => (svg.match(/ry="3.6"/g) || []).length;
const featureBlush = (svg) => (svg.match(/#d98b76/g) || []).length;

test("dmFigure: a plain face keeps the subtle base blush", () => {
  const svg = dmFigure({ ...base(), feature: "none" });
  assert.equal(baseBlush(svg), 2, "two base blush ellipses");
  assert.equal(featureBlush(svg), 0, "no feature blush");
});

test("dmFigure: the blush feature collapses the stack (no double blush)", () => {
  const svg = dmFigure({ ...base(), feature: "blush" });
  assert.equal(baseBlush(svg), 0, "base blush suppressed — the feature owns it");
  assert.equal(featureBlush(svg), 2, "only the feature blush remains");
});
