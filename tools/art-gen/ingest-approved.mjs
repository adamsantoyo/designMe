#!/usr/bin/env node
// designMe ingest-approved — feed every approved staged part through the
// existing art-lab ingest (halo cleanup + canonical-canvas registration), which
// writes app/assets/parts/<category>/<id>.png and prints the registry line.
//
//   node tools/art-gen/ingest-approved.mjs [--dry-run]
//
// Reads _art_staging/approvals.json (exported from the contact sheet).

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STAGING = join(root, "_art_staging");
const PYTHON = join(root, "tools", "art-lab", ".venv", "bin", "python");
const INGEST = join(root, "tools", "art-lab", "ingest.py");
const DRY = process.argv.includes("--dry-run");

const approvalsPath = join(STAGING, "approvals.json");
if (!existsSync(approvalsPath)) {
  console.error("✗ _art_staging/approvals.json not found — export it from the contact sheet first.");
  process.exit(1);
}
if (!existsSync(PYTHON)) {
  console.error("✗ art-lab venv missing. Once:  python3 -m venv tools/art-lab/.venv && tools/art-lab/.venv/bin/pip install pillow");
  process.exit(1);
}

const { approved } = JSON.parse(readFileSync(approvalsPath, "utf8"));
if (!approved?.length) {
  console.log("approvals.json has no approved parts — nothing to ingest.");
  process.exit(0);
}

let ok = 0;
for (const key of approved) {
  const src = join(STAGING, `${key}.png`);
  if (!existsSync(src)) {
    console.error(`  ✗ ${key}: staged file missing (${src})`);
    continue;
  }
  if (DRY) {
    console.log(`  would ingest ${key}`);
    continue;
  }
  try {
    const out = execFileSync(PYTHON, [INGEST, src, key], { encoding: "utf8" });
    process.stdout.write(out);
    ok++;
  } catch (e) {
    console.error(`  ✗ ${key}: ingest failed\n${e.stdout || ""}${e.stderr || ""}`);
  }
}
console.log(`\ningested ${ok}/${approved.length}. Paste the printed registry lines into app/src/parts/registry.ts,`);
console.log("then re-run:  node tools/check-art-ids.mjs");
