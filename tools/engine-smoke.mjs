#!/usr/bin/env node
// Renders EVERY catalog id through dmFigure and checks the output is sane.
// Run from repo root:  node tools/engine-smoke.mjs [categoryFilter]
// PASS = renders without throwing, contains no NaN/undefined, and is non-trivial.
// Also checks determinism (same opts twice → identical SVG modulo the uid counter).

import dmFigure from "../app/src/engine/dmFigure.js";
import { cases, base } from "./engine-cases.mjs";

const filter = process.argv[2];
let pass = 0, fail = 0;
const strip = (svg) => svg.replace(/f\d+/g, "fX"); // uid-normalize for determinism diff

for (const [cat, id, patch] of cases) {
  if (filter && cat !== filter) continue;
  const label = `${cat}/${id}`;
  try {
    const svg = dmFigure({ ...base(), ...patch });
    const problems = [];
    if (!svg.startsWith("<svg")) problems.push("no <svg root");
    if (svg.includes("NaN")) problems.push("NaN in output");
    if (svg.includes("undefined")) problems.push("undefined in output");
    if (svg.length < 2000) problems.push(`suspiciously small (${svg.length})`);
    const open = (svg.match(/<path/g) || []).length;
    if (open < 8) problems.push(`few paths (${open})`);
    if (strip(svg) !== strip(dmFigure({ ...base(), ...patch }))) problems.push("non-deterministic");
    if (problems.length) { console.log(`FAIL ${label}: ${problems.join("; ")}`); fail++; }
    else pass++;
  } catch (e) {
    console.log(`FAIL ${label}: threw ${e.message}`);
    fail++;
  }
}
console.log(`\n${pass} pass, ${fail} fail${filter ? ` (filter: ${filter})` : ""}`);
process.exit(fail ? 1 : 0);
