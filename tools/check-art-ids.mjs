#!/usr/bin/env node
// Cross-validates the places a part id must agree before ANY mass art
// generation happens:
//   1. app/src/dm.ts            — the app catalog (what the trays offer)
//   2. docs/art-prompts.md      — the worksheet filenames the art will be saved as
//   3. app/src/parts/registry.ts — the require() wiring that loads a PNG
//   4. app/src/parts/svgRegistry.js — the generated SVG twin (Story 2.4)
//
// A part only renders if worksheet filename == catalog id == registry key, and
// the SVG twin must never carry a key the PNG pipeline didn't approve.
// Run: node tools/check-art-ids.mjs   (exit 1 if the catalog would get no art)

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(root, p), "utf8");

// ---- 1. app catalog ids, mapped to their asset folder (mirror src/parts/layers.ts)
const dm = read("app/src/dm.ts");
function idsOf(arrayName) {
  const m = dm.match(new RegExp(`export const ${arrayName}[^=]*=\\s*\\[([\\s\\S]*?)\\];`));
  if (!m) return [];
  return [...m[1].matchAll(/id:\s*"([^"]+)"/g)].map((x) => x[1]).filter((id) => id !== "none");
}
const CATALOG_FOLDERS = {
  hairStyles: "hair",
  tops: "top",
  layers: "top", // outer layers load from the top/ folder per src/parts/layers.ts
  bottoms: "bottom",
  shoes: "shoe",
  glasses: "glasses",
  hearing: "hearing",
  headwear: "accessory",
  tools: "tool",
  aacs: "aac",
  mobilities: "mobility",
  jewelry: "jewelry",
  carries: "carry",
  features: "feature",
  bodyShapes: "body",
  faceShapes: "faceShape",
  brows: "brow",
  eyes: "eye",
  noses: "nose",
  lips: "lip",
  makeups: "makeup",
};
const catalog = new Map(); // "folder/id" -> source array
for (const [arr, folder] of Object.entries(CATALOG_FOLDERS)) {
  for (const id of idsOf(arr)) catalog.set(`${folder}/${id}`, arr);
}

// ---- 2. worksheet filenames
const worksheet = new Set(
  [...read("docs/art-prompts.md").matchAll(/`([a-zA-Z]+\/[a-zA-Z_]+)\.png`/g)].map((m) => m[1]),
);

// ---- 3. registry keys
const registry = [...read("app/src/parts/registry.ts").matchAll(/^\s*"([^"]+)":\s*require/gm)].map(
  (m) => m[1],
);

// ---- 4. svg registry keys (generated; absent until the first trace run)
let svgKeys = [];
try {
  svgKeys = [...read("app/src/parts/svgRegistry.js").matchAll(/^\s*"([^"]+)":\s*`/gm)].map(
    (m) => m[1],
  );
} catch {
  // no svg registry generated yet — the svg checks below are vacuous
}

// ---- report
const catalogNoArt = [...catalog.keys()].filter((k) => !worksheet.has(k));
const artNoCatalog = [...worksheet].filter((k) => !catalog.has(k));
const registryOrphans = registry.filter((k) => !catalog.has(k));
const pngSet = new Set(registry);
const svgOrphans = svgKeys.filter((k) => !catalog.has(k) || !pngSet.has(k));

const say = (title, items, note) => {
  console.log(`\n${title} (${items.length})${note ? ` — ${note}` : ""}`);
  for (const k of items.sort()) console.log(`  ${k}${catalog.has(k) ? `   [${catalog.get(k)}]` : ""}`);
};

console.log(`catalog ids checked: ${catalog.size} · worksheet files: ${worksheet.size} · registry keys: ${registry.length} · svg keys: ${svgKeys.length}`);

say(
  "✗ CATALOG ITEMS WITH NO WORKSHEET PROMPT",
  catalogNoArt,
  "these will NEVER get art under the current worksheet — rename one side before generating",
);
say(
  "○ Worksheet files not in the app catalog",
  artNoCatalog,
  "planned breadth not yet wired into dm.ts — fine, but they won't appear in the app",
);
say(
  "✗ Registry keys not in the catalog",
  registryOrphans,
  "wired PNGs no state can ever select",
);
say(
  "✗ SVG keys not backed by catalog + PNG registry",
  svgOrphans,
  "the SVG twin may only transcode approved, catalog-selectable parts",
);

if (catalogNoArt.length || registryOrphans.length || svgOrphans.length) {
  console.log("\nFAIL: fix the ✗ sections before mass-generating art.");
  process.exit(1);
}
console.log("\nOK: every catalog item has a matching worksheet filename.");
