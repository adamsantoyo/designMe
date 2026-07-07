// Phase 1 — premium-safe shuffle contract.
//
// The premium (svgparts) engine is the shipping default, and any avatar with even one
// unrenderable slot degrades the WHOLE figure to the procedural complete-fallback. So
// DM.shufflePremiumAv must only ever draw parts the premium engine can render. This
// test proves that invariant across many shuffles.
//
// Node can't import layers.ts / premium.ts (their runtime imports are extensionless,
// a Metro/tsc convention Node's resolver rejects), so we rebuild the exact same gate
// from the modules Node CAN load: the manifest (LAYER_SLOTS + manifestItem, the real
// render contract) and the svg registry (hasSvgPart, the real art source). The
// field->category map is derived from LAYER_SLOTS itself — the same mapping the app
// passes as folderMap — so nothing here is hand-duplicated from the app.

import { test } from "node:test";
import assert from "node:assert/strict";
import { PART_MANIFEST, LAYER_SLOTS, manifestItem, partKey } from "../app/src/parts/manifest.ts";
import { hasSvgPart } from "../app/src/parts/svgRegistry.js";
import { shufflePremiumAv, defaultAv } from "../app/src/dm.ts";

// Mirror of parts/premium.ts isPremiumRenderable (manifest ∩ svgRegistry, none/bald free).
const RENDERABLE = new Set(
  PART_MANIFEST.map((m) => partKey(m.category, m.id)).filter((k) => hasSvgPart(k)),
);
const isPremiumRenderable = (category, id) => {
  if (!id || id === "none") return true;
  if (category === "hair" && id === "bald") return true;
  return RENDERABLE.has(`${category}/${id}`);
};

// field -> category, straight off the render contract (== AvatarStudio's PNG_DIM_CATEGORY).
const folderMap = Object.fromEntries(LAYER_SLOTS.map((s) => [s.idFrom, s.category]));

// Replicates coverage(av, _, svgSource): a non-empty slot must carry manifest + art.
const isEmptySlot = (slot, id) => !id || id === "none" || (slot === "hair" && id === "bald");
function missingSlots(av) {
  const miss = [];
  for (const s of LAYER_SLOTS) {
    const id = String(av[s.idFrom] ?? "");
    if (isEmptySlot(s.slot, id)) continue;
    const key = partKey(s.category, id);
    if (!(manifestItem(key) && hasSvgPart(key))) miss.push(`${s.slot}:${key}`);
  }
  return miss;
}

test("shufflePremiumAv: every shuffled avatar renders fully in premium mode", () => {
  let prev = defaultAv;
  for (let i = 0; i < 1000; i += 1) {
    const av = shufflePremiumAv(prev, isPremiumRenderable, folderMap);
    const miss = missingSlots(av);
    assert.equal(miss.length, 0, `iteration ${i}: unrenderable slots -> ${miss.join(", ")}`);
    prev = av;
  }
});

test("shufflePremiumAv: never draws a known art-less / broken id", () => {
  const banned = new Set([
    "hair/shaved", "hair/buzzCut", "tool/medicalBracelet",
    "eye/round", "eye/monolid", "top/meshLayer",
  ]);
  let prev = defaultAv;
  for (let i = 0; i < 1000; i += 1) {
    prev = shufflePremiumAv(prev, isPremiumRenderable, folderMap);
    for (const s of LAYER_SLOTS) {
      const id = String(prev[s.idFrom] ?? "");
      assert.ok(!banned.has(`${s.category}/${id}`), `iteration ${i}: drew banned ${s.category}/${id}`);
    }
  }
});

test("shufflePremiumAv: still explores real variety (not stuck on fallbacks)", () => {
  const seen = { hair: new Set(), top: new Set(), bottom: new Set(), shoes: new Set() };
  let prev = defaultAv;
  for (let i = 0; i < 500; i += 1) {
    prev = shufflePremiumAv(prev, isPremiumRenderable, folderMap);
    seen.hair.add(prev.hair);
    seen.top.add(prev.top);
    seen.bottom.add(prev.bottom);
    seen.shoes.add(prev.shoes);
  }
  for (const k of Object.keys(seen)) {
    assert.ok(seen[k].size >= 4, `${k} only drew ${seen[k].size} distinct values across 500 shuffles`);
  }
});

test("folderMap derived from LAYER_SLOTS covers every art-bearing shuffle field", () => {
  // Guards the wiring: if a new slot is added without a category, shuffle would fall
  // back to field===category and silently mis-gate.
  for (const field of ["hair", "top", "bottom", "shoes", "layer", "headwear", "jewelry"]) {
    assert.ok(folderMap[field], `folderMap missing ${field}`);
  }
  assert.equal(folderMap.shoes, "shoe");
  assert.equal(folderMap.layer, "top");
  assert.equal(folderMap.headwear, "accessory");
});
