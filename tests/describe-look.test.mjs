// Phase 3 — "describe my look" sentence builder must never leak "undefined" and must
// only mention extras that are present (a person is never described as lacking).

import { test } from "node:test";
import assert from "node:assert/strict";
import { describeLook, defaultAv, shufflePremiumAv } from "../app/src/dm.ts";
import { PART_MANIFEST, LAYER_SLOTS, partKey } from "../app/src/parts/manifest.ts";
import { hasSvgPart } from "../app/src/parts/svgRegistry.js";

const RENDERABLE = new Set(PART_MANIFEST.map((m) => partKey(m.category, m.id)).filter((k) => hasSvgPart(k)));
const isRenderable = (c, id) => id === "none" || (c === "hair" && id === "bald") || RENDERABLE.has(`${c}/${id}`);
const folderMap = Object.fromEntries(LAYER_SLOTS.map((s) => [s.idFrom, s.category]));

test("describeLook: default avatar reads as a clean sentence", () => {
  const s = describeLook(defaultAv);
  assert.ok(!/undefined/.test(s), `leaked undefined: ${s}`);
  assert.ok(s.endsWith("."), "ends with a period");
  assert.equal(s[0], s[0].toUpperCase(), "starts capitalized");
  assert.ok(/skin/.test(s) && /wearing/.test(s), `mentions person + outfit: ${s}`);
});

test("describeLook: never leaks undefined across many random looks", () => {
  let prev = defaultAv;
  for (let i = 0; i < 300; i += 1) {
    prev = shufflePremiumAv(prev, isRenderable, folderMap);
    const s = describeLook(prev);
    assert.ok(!/undefined/.test(s), `iteration ${i} leaked undefined: ${s}`);
    assert.ok(s.length > 10 && s.endsWith("."));
  }
});

test("describeLook: only names extras that are present", () => {
  const bare = { ...defaultAv, glasses: "none", hearing: "none", headwear: "none", jewelry: "none",
    tool: "none", aac: "none", mobility: "none", carry: "none", makeup: "none", feature: "none" };
  const s = describeLook(bare);
  for (const word of ["glasses", "carrying", "using a", "makeup"]) {
    assert.ok(!s.includes(word), `named an absent extra (${word}): ${s}`);
  }
  const decked = { ...bare, glasses: "round", mobility: "wheelchair", carry: "backpack" };
  const s2 = describeLook(decked);
  assert.ok(s2.includes("glasses") && s2.includes("using a") && s2.includes("carrying"), s2);
});

test("describeLook: bald reads as 'no hair'", () => {
  assert.ok(describeLook({ ...defaultAv, hair: "bald" }).includes("no hair"));
});
