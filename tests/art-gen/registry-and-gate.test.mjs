// Story 1.1 — the "shipped registry points at the fixed renders, not the defective
// ones" half of the Definition of Done.
//
// The re-rolls must REPLACE the PNG under the EXISTING key (no id churn) — a rename
// breaks the persistence contract (Av references catalog ids) and the check-art-ids
// gate. These tests lock the registry wiring and the cross-file id gate so a future
// edit can't silently drop or rename a slice key.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ROOT, gateExitCode } from "./helpers.mjs";

const registry = readFileSync(join(ROOT, "app", "src", "parts", "registry.ts"), "utf8");

// Every catalog key touched by the slice must be registered to a require() of the
// PNG at the SAME key (id == asset path). Comment lines (`//`) are excluded so a
// commented-out entry cannot masquerade as a live registration.
const SLICE_KEYS = [
  "hair/definedCurls",
  "hair/wavyM",
  "shoe/classicSneaker",
  "faceShape/diamond",
  "faceShape/heart",
  "faceShape/long",
  "faceShape/oval",
  "faceShape/round",
  "faceShape/square",
];

const liveLines = registry
  .split("\n")
  .filter((l) => !l.trimStart().startsWith("//"));

for (const key of SLICE_KEYS) {
  test(`Registry: "${key}" is live-registered under its own id (no churn)`, () => {
    const escaped = key.replace(/\//g, "\\/");
    const re = new RegExp(
      `"${escaped}":\\s*require\\("\\.\\.\\/\\.\\.\\/assets\\/parts\\/${escaped}\\.png"\\)`,
    );
    assert.ok(
      liveLines.some((l) => re.test(l)),
      `expected a live (non-comment) registry entry mapping "${key}" -> assets/parts/${key}.png`,
    );
  });
}

test("Gate: check-art-ids.mjs passes (worksheet id == catalog id == registry key)", () => {
  assert.equal(
    gateExitCode("tools/check-art-ids.mjs"),
    0,
    "check-art-ids.mjs must exit 0 — the cross-file id contract holds",
  );
});

test("Guard: qa.py bounds the faceShape panel so its bottom cannot spill past y=460", () => {
  // qa.py can't judge the seam directly, but its faceShape POSITION band is the one
  // cheap programmatic backstop against a panel bbox running down the chest. Lock the
  // documented bound (Dev Notes: bottom bound = 460) so it can't be silently loosened.
  const qa = readFileSync(join(ROOT, "tools", "art-gen", "qa.py"), "utf8");
  const m = qa.match(/"faceShape":\s*\(\((\d+),\s*(\d+)\),\s*\((\d+),\s*(\d+)\)\)/);
  assert.ok(m, "faceShape POSITION band must be defined in qa.py");
  const bottom = Number(m[4]);
  assert.ok(
    bottom <= 460,
    `faceShape band bottom must stay <= 460 (found ${bottom}) to guard against chest spill`,
  );
});
