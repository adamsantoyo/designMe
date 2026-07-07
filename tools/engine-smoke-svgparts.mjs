#!/usr/bin/env node
// Story 2.4 — svgparts twin of engine-smoke: renders EVERY svgRegistry part
// through the real engine core (app/src/engine/svgPartsFigure.js — the same
// module SvgPartsFigure.tsx uses; no .runtime mirror) and checks:
//   * well-formedness: <svg root, balanced <g>, has paths, no NaN/undefined
//   * determinism: double render is BYTE-identical (no uids at all — stricter
//     than dmFigure's uid-normalized diff)
//   * tint: multiply parts recolor across a deep + a light hex; fixed parts
//     render byte-identical markup regardless of tint input
//   * height: all five heights render, bottom edge invariant
//   * crop: tray-tile crop strings remap into the 1024x1536 viewBox
// Run from repo root:  node tools/engine-smoke-svgparts.mjs [categoryFilter]
//
// manifest.ts is imported directly (Node 22 type stripping) — z-order and
// tintMode come from the SAME manifest the app uses; it is not duplicated here.

import { LAYER_SLOTS, manifestItem } from "../app/src/parts/manifest.ts";
import { PARTS_SVG, svgPartRef } from "../app/src/parts/svgRegistry.js";
import { buildSvgPartsXml } from "../app/src/engine/svgPartsFigure.js";

const filter = process.argv[2];
let pass = 0, fail = 0;
const noManifest = [];

const DEEP = "#3b2a21"; // deepest skin — the shading-compression worst case
const LIGHT = "#f1e9d8"; // cream garment — the near-identity case

const problems = [];
const check = (cond, msg) => { if (!cond) problems.push(msg); };

function wellFormed(xml, label) {
  check(xml.startsWith("<svg"), `${label}: no <svg root`);
  check(!xml.includes("NaN"), `${label}: NaN in output`);
  check(!xml.includes("undefined"), `${label}: undefined in output`);
  check((xml.match(/<g\b/g) || []).length === (xml.match(/<\/g>/g) || []).length,
    `${label}: unbalanced <g>`);
  check((xml.match(/<path/g) || []).length > 0, `${label}: no paths`);
}

const body = { key: "body/balanced", ref: svgPartRef("body/balanced"), tint: "#8a5a3f" };

for (const key of Object.keys(PARTS_SVG)) {
  const [cat] = key.split("/");
  if (filter && cat !== filter) continue;
  const item = manifestItem(key);
  if (!item) { noManifest.push(key); continue; } // Story 2.1's gap, same as PNG mode
  problems.length = 0;

  const tintHex = item.tintMode === "multiply" ? DEEP : null;
  const layer = { key, ref: svgPartRef(key), tint: tintHex };
  const stack = key === "body/balanced" ? [layer] : [body, layer];

  const xml = buildSvgPartsXml(stack, {});
  wellFormed(xml, key);
  check(xml === buildSvgPartsXml(stack, {}), `${key}: non-deterministic`);
  check(xml.length > 300, `${key}: suspiciously small (${xml.length})`);

  if (item.tintMode === "multiply") {
    const deep = buildSvgPartsXml([{ ...layer, tint: DEEP }], {});
    const light = buildSvgPartsXml([{ ...layer, tint: LIGHT }], {});
    const neutral = buildSvgPartsXml([{ ...layer, tint: null }], {});
    check(deep !== neutral, `${key}: deep tint is a no-op`);
    check(light !== deep, `${key}: tint hex ignored`);
    check((deep.match(/fill="#/g) || []).length === (neutral.match(/fill="#/g) || []).length,
      `${key}: tint changed fill count`);
  } else {
    const asDrawn = buildSvgPartsXml([{ ...layer, tint: null }], {});
    check(asDrawn.includes(String(layer.ref)), `${key}: fixed part markup altered`);
  }

  if (problems.length) { console.log(`FAIL ${key}: ${problems.join("; ")}`); fail++; }
  else pass++;
}

// engine-level sweeps (once, on a representative stack)
problems.length = 0;
{
  const stack = [body, { key: "top/hoodie", ref: svgPartRef("top/hoodie"), tint: "#8aa382" }];
  for (const h of [0.94, 0.97, 1, 1.03, 1.06]) {
    const xml = buildSvgPartsXml(stack, { heightScale: h });
    wellFormed(xml, `height=${h}`);
    if (h !== 1) {
      check(xml.includes(`scale(1,${h})`), `height=${h}: no scale transform`);
      check(xml.includes(`translate(0,${1536 * (1 - h)})`), `height=${h}: not bottom-anchored`);
    }
  }
  const crop = buildSvgPartsXml(stack, { crop: "74 14 92 94" });
  check(crop.includes('preserveAspectRatio="xMidYMid meet"'), "crop: wrong preserveAspectRatio");
  const vb = crop.match(/viewBox="([^"]+)"/)[1].split(" ").map(Number);
  check(Math.abs(vb[0] - (74 / 240) * 1024) < 1e-6, "crop: x remap wrong");
  check(Math.abs(vb[1] - (14 / 490) * 1536) < 1e-6, "crop: y remap wrong");
  const bad = buildSvgPartsXml(stack, { crop: "not a crop" });
  check(bad.includes(`viewBox="0 0 1024 1536"`), "crop: malformed crop must fall back to full frame");

  // crop x height: the crop viewBox addresses the UNSCALED space — a height
  // transform under a crop would shift tray-tile regions (review finding).
  const croppedTall = buildSvgPartsXml(stack, { crop: "74 14 92 94", heightScale: 1.06 });
  check(!croppedTall.includes("scale(1,1.06)"), "crop+height: height transform must not apply under a crop");
  check(croppedTall === crop, "crop+height: cropped output must be height-invariant");

  // bbox crop filter: a layer whose ink bounds cannot intersect the crop rect
  // is dropped from the emitted markup; intersecting/unknown bboxes stay.
  const face = { key: "x/face", ref: '<g><path fill="#111111" d="M0 0"/></g>', bbox: [400, 100, 620, 400] };
  const shoe = { key: "x/shoe", ref: '<g><path fill="#222222" d="M9 9"/></g>', bbox: [380, 1400, 640, 1530] };
  const nb = { key: "x/nb", ref: '<g><path fill="#333333" d="M5 5"/></g>' }; // no bbox -> kept
  const faceCrop = buildSvgPartsXml([face, shoe, nb], { crop: "74 14 92 94" }); // y 43.9..338.7
  check(faceCrop.includes("#111111"), "bbox filter: intersecting layer dropped");
  check(!faceCrop.includes("#222222"), "bbox filter: non-intersecting layer kept");
  check(faceCrop.includes("#333333"), "bbox filter: bbox-less layer must be kept");
  const full = buildSvgPartsXml([face, shoe, nb], {});
  check(full.includes("#222222"), "bbox filter: must not filter without a crop");
  if (problems.length) { console.log(`FAIL sweeps: ${problems.join("; ")}`); fail++; }
  else pass++;
}

if (noManifest.length) {
  console.log(`\n○ registered svg parts with no manifest entry yet (Story 2.1 scope, `
    + `unreachable in PNG mode too): ${noManifest.length}`);
  for (const k of noManifest.sort()) console.log(`    ${k}`);
}
console.log(`\n${pass} pass, ${fail} fail${filter ? ` (filter: ${filter})` : ""}`);
process.exit(fail ? 1 : 0);
