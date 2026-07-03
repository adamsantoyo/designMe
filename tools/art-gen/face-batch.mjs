#!/usr/bin/env node
// designMe face-lane batch — generates the face-feature catalog via the
// one-render-split technique (single-feature worn prompts misregister; a full
// face renders coherently and face-split.py extracts registered layers).
//
//   node tools/art-gen/face-batch.mjs [--dry-run] [--only eye/round,makeup/liner]
//
// Three render kinds:
//   combos   — one complete face per row of variants -> 4 layers each (eye/brow/nose/lip)
//   makeup   — overlay-only render (no facial features) -> one whole layer, neutral master
//   features — overlay-only render -> one whole layer, natural subtle tones
//
// Requires OPENAI_API_KEY and tools/art-gen/refs/base.png.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const STAGING = join(root, "_art_staging");
const PYTHON = join(root, "tools", "art-lab", ".venv", "bin", "python");
const SPLIT = join(root, "tools", "art-gen", "face-split.py");
const BASE = join(root, "tools", "art-gen", "refs", "base.png");
const DRY = process.argv.includes("--dry-run");
const onlyIdx = process.argv.indexOf("--only");
const ONLY = onlyIdx >= 0 ? process.argv[onlyIdx + 1].split(",") : null;

// Each combo renders ONE coherent face and yields four registered layers.
// (almond/soft/rounded/soft came from the original slice render.)
const COMBOS = [
  { name: "round-straight-button-full",
    eye: ["round", "round eye shape"], brow: ["straight", "straight brow shape"],
    nose: ["button", "small button nose"], lip: ["full", "full soft lips"] },
  { name: "monolid-arched-wide-wide",
    eye: ["monolid", "monolid eye shape"], brow: ["arched", "arched brow shape"],
    nose: ["wide", "wider rounded nose"], lip: ["wide", "wide gentle lips"] },
  { name: "hooded-bold-narrow-petite",
    eye: ["hooded", "hooded eye shape"], brow: ["bold", "bold fuller brow shape"],
    nose: ["narrow", "narrow slender nose"], lip: ["petite", "small petite lips"] },
  { name: "wide-fine-long-bow",
    eye: ["wide", "wide open round-large eye shape"], brow: ["fine", "fine thin brow shape"],
    nose: ["long", "longer straight nose"], lip: ["bow", "cupid's-bow lips"] },
];

// Overlay renders: the head stays green and featureless; ONLY the overlay is drawn.
const MAKEUP = {
  natural: "a natural everyday makeup overlay — soft eyelid tint where the eyes would sit, gentle cheek warmth",
  liner: "clean eyeliner strokes with a small wing, positioned where the eyes would sit (no eyeballs)",
  smoky: "soft smoky eyeshadow shading around where the eyes would sit (no eyeballs)",
  bold: "a bold graphic liner + strong lip color positioned where eyes and lips would sit",
  glam: "glamorous shimmer-free eyeshadow sweep + defined lip color, matte",
  graphic: "a playful graphic liner accent shape at the outer corners of where the eyes would sit",
  lashes: "long defined eyelash lines along where the upper lash lines would sit (no eyeballs)",
};
const FEATURES = {
  freckles: "soft warm freckles scattered across where the nose bridge and cheeks sit",
  vitiligo: "gentle lighter de-pigmented patches with soft organic edges on the face",
  // gentler phrasing — the safety filter reads "birthmark/scar on a face" badly
  birthmark: "one soft rounded warm-tone patch on one cheek area, a natural skin variation",
  scar: "one small faint pale line accent near the brow area, subtle and dignified",
  blush: "soft warm rounded color on both cheek areas",
};

const CHROMA =
  "TECHNICAL CHROMA-KEY REQUIREMENT (obey exactly): everything EXCEPT the described face content — the entire head, ears, neck, body, ALL skin — stays one single solid pure saturated green RGB(0,200,80), completely flat, no shading, no outline, no interior lines. The described face content is never green. You may zoom to a head-and-shoulders bust framing for detail. Fully transparent background outside the figure.";
const STYLE =
  "Flat warm handcrafted two-tone style, matte, sized realistically for the head, gentle and dignified.";

async function render(prompt, outPath) {
  const form = new FormData();
  form.append("model", "gpt-image-1");
  form.append("prompt", prompt);
  form.append("size", "1024x1536");
  form.append("quality", "high");
  form.append("background", "transparent");
  form.append("image[]", new Blob([readFileSync(BASE)], { type: "image/png" }), "base.png");
  for (let attempt = 0; attempt < 3; attempt++) {
    const res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: form,
    });
    if (res.ok) {
      mkdirSync(dirname(outPath), { recursive: true });
      writeFileSync(outPath, Buffer.from((await res.json()).data[0].b64_json, "base64"));
      return true;
    }
    const body = await res.text();
    if (res.status === 429 || res.status >= 500) {
      await new Promise((r) => setTimeout(r, 2000 * 2 ** attempt));
      continue;
    }
    console.error(`  ✗ ${outPath.split("/").pop()}: ${res.status} ${body.slice(0, 160)}`);
    return false;
  }
  return false;
}

const split = (worn, args) => {
  try {
    const out = execFileSync(PYTHON, [SPLIT, worn, ...args], { encoding: "utf8" });
    process.stdout.write(out.split("\n").filter((l) => l.startsWith("  ")).join("\n") + "\n");
    return true;
  } catch (e) {
    console.error(`  ✗ split failed: ${(e.stdout || e.message).toString().slice(0, 200)}`);
    return false;
  }
};

const wants = (key) => !ONLY || ONLY.includes(key);
let rendered = 0, failed = 0;

for (const c of COMBOS) {
  const layerKeys = ["eye", "brow", "nose", "lip"].map((k) => `${k}/${c[k][0]}`);
  const needed = layerKeys.filter((k) => wants(k) && !existsSync(join(STAGING, `${k}.png`)));
  if (!needed.length) continue;
  const prompt =
    `Give this exact figure a complete, natural, calm face: ${c.eye[1]} with warm brown irises and fine dark lash lines; ${c.brow[1]} as clear warm-dark-ink strokes; ${c.nose[1]} drawn as a CLEAR soft dark-ink line (visible line art, not skin-tone shading); ${c.lip[1]} in a muted warm rose. Calm neutral expression. ${STYLE} ${CHROMA}`;
  console.log(`combo ${c.name} -> ${needed.join(", ")}`);
  if (DRY) continue;
  const worn = join(STAGING, "_worn", "face", `${c.name}.png`);
  if (await render(prompt, worn)) {
    // demand only the layers this run actually needs — an unrecoverable nose must
    // not sink an eye-only re-split
    split(worn, needed) ? rendered++ : failed++;
  } else failed++;
}

for (const [group, defs, master] of [["makeup", MAKEUP, true], ["feature", FEATURES, false]]) {
  for (const [id, desc] of Object.entries(defs)) {
    const key = `${group}/${id}`;
    if (!wants(key) || existsSync(join(STAGING, `${key}.png`))) continue;
    const tone = master
      ? "Render the overlay in ONE flat pale warm neutral tone (recolor master — the app tints it at runtime)."
      : "Render the overlay in its natural subtle dignified colors.";
    const prompt =
      `On this exact figure's face, draw ONLY this overlay — no eyes, no eyeballs, no brows, no nose, no mouth, no other facial features of any kind: ${desc}. ${tone} ${STYLE} ${CHROMA}`;
    console.log(`overlay ${key}`);
    if (DRY) continue;
    const worn = join(STAGING, "_worn", group, `${id}.png`);
    if (await render(prompt, worn)) {
      split(worn, ["--whole", key]) ? rendered++ : failed++;
    } else failed++;
  }
}

console.log(DRY ? "\nDRY RUN — no API calls." : `\nface lane done: ${rendered} renders split ok, ${failed} failed`);
if (!DRY) {
  console.log("next: qa.py + contact-sheet.mjs");
  if (failed) process.exit(1);
}
