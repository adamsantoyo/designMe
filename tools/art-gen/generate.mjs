#!/usr/bin/env node
// designMe batch art generator — turns docs/art-prompts.md into PNGs via the
// OpenAI Images API (gpt-image-1), exactly the "Auto (at scale)" mode the
// worksheet describes: PREFIX + item line + SUFFIX per item, saved by id.
//
//   node tools/art-gen/generate.mjs --dry-run              # plan + prompts, no API
//   node tools/art-gen/generate.mjs --exemplars            # skin/base + the 3 ★
//   node tools/art-gen/generate.mjs                        # all P0 items
//   node tools/art-gen/generate.mjs --priority all         # include P1/P2
//   node tools/art-gen/generate.mjs --only hair/braid,top/hoodie
//   node tools/art-gen/generate.mjs --category hair --force
//
// Requires OPENAI_API_KEY in the environment (never passed as a flag).
//
// Pipeline position: generate → staging (_art_staging/) → qa.py → contact-sheet.mjs
// → human approve → ingest-approved.mjs (wraps tools/art-lab/ingest.py). Nothing this
// script produces goes into app/assets/ directly.
//
// Hard gate: tools/check-art-ids.mjs must pass first, so a batch can never be
// generated under contested ids.
//
// Style anchoring: gpt-image-1 has no seed. Consistency comes from the PREFIX plus
// reference images. Once skin/base + the 3 exemplars are approved, copy (or symlink)
// them into tools/art-gen/refs/ — every later call then switches to the edits
// endpoint with those attached, per the worksheet's "attach as references" rule.

import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const WORKSHEET = join(root, "docs", "art-prompts.md");
const STAGING = join(root, "_art_staging");
const REFS_DIR = join(root, "tools", "art-gen", "refs");
const APPROVED_DIR = join(root, "app", "assets", "parts");

// The worksheet planned a 1024x1024 "bust" frame for face-level detail, but the
// shipping renderer (SkiaFigure) draws every layer full-frame 1024x1536 with no
// bust mapping — a bust asset would stretch. Until the engine grows a head-box
// transform, EVERYTHING generates full-frame; face parts go through the same
// greenscreen-worn path (drawn on the green figure's head, keyed out).
const BUST = new Set([]);

// Worn categories use the greenscreen-worn technique (proven in shakedown
// 2026-07-02): text alone can't make gpt-image-1 place a lone part at true
// position/scale, but it dresses a figure flawlessly. So: render the item WORN
// on the base figure with the figure painted technical chroma-green, then
// key.py removes the figure deterministically — the part keeps pixel-exact
// registration. Requires refs/base.png. Non-worn (skin, body) and bust items
// generate directly.
const WORN = new Set([
  "hair", "top", "bottom", "shoe", "accessory", "carry", "tool", "aac", "mobility",
  // face-level parts ride the same technique: drawn on the green figure's head
  "faceShape", "brow", "eye", "nose", "lip", "makeup", "feature", "glasses", "jewelry", "hearing",
]);

// gpt-image-1 per-image cost (USD) by quality and size, for the dry-run estimate.
const COST = {
  high: { "1024x1536": 0.25, "1024x1024": 0.167 },
  medium: { "1024x1536": 0.063, "1024x1024": 0.042 },
  low: { "1024x1536": 0.016, "1024x1024": 0.011 },
};

// ---------- CLI ----------
const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, dflt) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 && argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : dflt;
};
const DRY = flag("dry-run");
const FORCE = flag("force");
const EXEMPLARS_ONLY = flag("exemplars");
const ONLY = opt("only", "").split(",").map((s) => s.trim()).filter(Boolean);
const CATEGORY = opt("category", "");
const PRIORITY = opt("priority", "P0"); // P0 | P1 | P2 | all
const QUALITY = opt("quality", "high"); // high | medium | low
const LIMIT = Number(opt("limit", "0"));
const CONCURRENCY = Number(opt("concurrency", "2"));
const RETRIES = Number(opt("retries", "2"));

if (!COST[QUALITY]) {
  console.error(`--quality must be one of: ${Object.keys(COST).join(", ")}`);
  process.exit(1);
}

// ---------- 1. Gate ----------
try {
  execFileSync("node", [join(root, "tools", "check-art-ids.mjs")], { stdio: "pipe" });
} catch (e) {
  console.error("✗ GATE FAILED: tools/check-art-ids.mjs does not pass — ids are contested.");
  console.error("  Fix the id drift first; refusing to generate art under disputed names.\n");
  console.error(String(e.stdout || ""));
  process.exit(1);
}
console.log("✓ id gate: check-art-ids.mjs passes");

// ---------- 2. Parse the worksheet ----------
const md = readFileSync(WORKSHEET, "utf8");

function block(afterHeading) {
  const re = new RegExp(`## ${afterHeading}[^\\n]*\\n[\\s\\S]*?\\\`\\\`\\\`\\n([\\s\\S]*?)\\\`\\\`\\\``);
  const m = md.match(re);
  if (!m) throw new Error(`Could not find the ${afterHeading} block in art-prompts.md`);
  return m[1].trim();
}
const PREFIX = block("PREFIX");
const SUFFIX = block("SUFFIX");

const items = [];
let sectionNote = "";
for (const line of md.split("\n")) {
  const sec = line.match(/^### .+?\*\((.+)\)\*\s*$/) || line.match(/^### (.+)$/);
  if (line.startsWith("### ")) {
    sectionNote = sec && line.includes("*(") ? sec[1] : "";
    continue;
  }
  const it = line.match(/^- \[.\] `([a-zA-Z]+)\/([a-zA-Z_]+)\.png` — (.+)$/);
  if (!it) continue;
  let [, category, id, prompt] = it;
  const exemplar = prompt.includes("★");
  const pr = prompt.match(/\((P[12])\)/);
  prompt = prompt.replace("★", "").replace(/\((P[12])\)\s*/, "").trim();
  items.push({ key: `${category}/${id}`, category, id, prompt, note: sectionNote, exemplar, priority: pr ? pr[1] : "P0" });
}
if (!items.length) throw new Error("Parsed 0 items from art-prompts.md — format changed?");

// ---------- 3. Select the batch ----------
let batch = items;
if (EXEMPLARS_ONLY) batch = items.filter((i) => i.exemplar || i.key === "skin/base");
if (ONLY.length) {
  const missing = ONLY.filter((k) => !items.some((i) => i.key === k));
  if (missing.length) {
    console.error(`✗ --only ids not in the worksheet: ${missing.join(", ")}`);
    process.exit(1);
  }
  batch = items.filter((i) => ONLY.includes(i.key));
}
if (CATEGORY) batch = batch.filter((i) => i.category === CATEGORY);
if (PRIORITY !== "all" && !ONLY.length && !EXEMPLARS_ONLY) batch = batch.filter((i) => i.priority <= PRIORITY);

// "Approved" = wired into registry.ts. A PNG merely sitting in app/assets/parts/
// may be quarantined art from a rejected batch (see registry.ts comments) — that
// must NOT block regeneration.
const registered = new Set(
  [...readFileSync(join(root, "app", "src", "parts", "registry.ts"), "utf8")
    .matchAll(/^\s*"([^"]+)":\s*require/gm)].map((m) => m[1]),
);
// Single facial features misregister via the worn path (proven 2026-07-03) — they
// are produced by the face-split lane (tools/art-gen/face-split.py) instead.
// Batch runs exclude them; --only can still force one through explicitly.
const FACE_LANE = new Set(["brow", "eye", "nose", "lip", "makeup", "feature"]);
if (!ONLY.length) {
  const deferred = batch.filter((i) => FACE_LANE.has(i.category));
  if (deferred.length) {
    console.log(`→ deferring ${deferred.length} face-feature items to the face-split lane (not batchable via worn path)`);
    batch = batch.filter((i) => !FACE_LANE.has(i.category));
  }
}

const skipped = [];
if (!FORCE) {
  batch = batch.filter((i) => {
    if (registered.has(i.key)) return skipped.push(`${i.key} (approved in registry)`), false;
    if (existsSync(join(STAGING, i.category, `${i.id}.png`))) return skipped.push(`${i.key} (staged)`), false;
    return true;
  });
}
// skin/base must exist (staged or approved) before anything that isn't skin/base:
// every other part is drawn registered against that figure.
const baseReady = existsSync(join(STAGING, "skin", "base.png")) || registered.has("skin/base") ||
  (existsSync(join(REFS_DIR, "base.png")));
if (!baseReady && batch.some((i) => i.key !== "skin/base")) {
  const hadOthers = batch.length;
  batch = batch.filter((i) => i.key === "skin/base");
  if (!batch.length) {
    console.error("✗ skin/base.png is not generated yet — it is the registration master every other part aligns to.");
    console.error("  Run:  node tools/art-gen/generate.mjs --only skin/base   (then QA it, then continue)");
    process.exit(1);
  }
  if (hadOthers > 1) console.log("→ skin/base first: deferring the rest of the batch until the registration master exists.");
}
if (LIMIT > 0) batch = batch.slice(0, LIMIT);

// ---------- 4. Reference images (style anchors) ----------
const refs = existsSync(REFS_DIR)
  ? readdirSync(REFS_DIR).filter((f) => f.endsWith(".png")).map((f) => join(REFS_DIR, f))
  : [];

// ---------- 5. Prompt assembly ----------
// The PREFIX's standing rules alone get ignored under a concrete item description,
// so the two rules that broke in shakedown are restated per item, explicitly:
// neutral-master color for recolor categories, and base-figure registration.
const NEUTRAL = /neutral tone for recoloring|tint to/;
const isWorn = (it) => WORN.has(it.category) && refs.some((r) => r.endsWith("base.png"));

const colorRule = (it) =>
  NEUTRAL.test(it.note)
    ? "COLOR — this item is a recolor master: render it entirely in ONE flat warm near-white neutral tone (unpainted warm paper) plus its two soft shading tones. Do NOT use any realistic or fashion color — the app tints it at runtime."
    : "";

// Worn path: the item is drawn ON the base figure at natural scale (which the
// model does reliably), with the figure itself as a technical chroma matte
// that key.py strips afterward.
const wornPrompt = (it) => [
  PREFIX,
  `The attached base-figure image is the exact body to dress. Put this item on it, worn/used naturally at the figure's own scale and position: ${it.prompt}.`,
  "FRAMING — reproduce the attached image's framing exactly: the ENTIRE figure stays visible head to feet at the same small scale, head near the top of the tall canvas, feet near the bottom, lots of empty space around it. Never zoom in, never crop to a portrait or bust, never enlarge the figure — even for hair, pants, and face-adjacent items the whole body including the head remains in frame. Add nothing else to the scene: no ground line and no contact shadow under the feet, soles, or the item.",
  it.note ? `Category rules for this item: ${it.note}.` : "",
  colorRule(it),
  "TECHNICAL CHROMA-KEY REQUIREMENT (deliberately breaks the palette, obey it exactly): every visible part of the figure itself — head, neck, hands, legs, feet, ALL skin — is one single solid pure saturated green, RGB(0,200,80), completely flat: no shading, no highlight, no interior lines, and ABSOLUTELY NO OUTLINE — the green silhouette has no border stroke of any color, it ends directly against the transparent background. This green is a technical matte for automated removal, not an artistic choice — do not mute, darken, or harmonize it. The item itself keeps its normal colors and its own soft outline, and must never be green. If the item IS a facial feature (eyes, brows, nose, lips, makeup, skin feature), draw ONLY that single feature in its own natural non-green colors on the green head, sized and positioned exactly where it sits on that head — and NOTHING else: if the item is eyes, the face has no brows, no nose, no mouth; if it is brows, the face has no eyes, no nose, no mouth; the rest of the face stays blank flat green.",
  it.category === "faceShape"
    ? "FACE-SHAPE SPECIAL CASE: this item is not hair and not a feature — it is the face panel itself. Repaint the front of the figure's head as one smooth flat face-shaped panel of the named shape, in the near-white master tone with its two soft shading tones, fitted exactly over the head. No hair, no eyes, no brows, no nose, no mouth, no ears — a blank face panel only. The panel covers ONLY the face: it ends at the jaw/chin line and never extends onto the neck, shoulders, or chest. Everything else stays green."
    : "",
  it.category === "hair"
    ? "HAIR RULE: style the hair so the face stays clear — the fringe may touch the brow line but must NEVER cover or cross the eye area; the green face (eyes, nose, mouth region) remains fully visible. Draw the COMPLETE hairstyle fully visible IN FRONT of the figure — every part that would naturally sit behind the head, shoulders, or back (buns, ponytails, tails, long lengths) is drawn on top of the green figure instead, like a full wig displayed on a mannequin; no strand may be occluded by the figure."
    : "",
  it.category === "shoe"
    ? "SHOE RULE: the shoes fully cover and contain the figure's feet — no green toe, heel, or sole edge may remain visible; the shoe silhouette entirely replaces the foot silhouette."
    : "",
  SUFFIX,
].filter(Boolean).join("\n\n");

const promptFor = (it) => {
  if (isWorn(it)) return wornPrompt(it);
  const scope = BUST.has(it.category) ? "bust (1024×1024)" : "full-figure (1024×1536)";
  return [
    PREFIX,
    `Item — ${scope} frame: ${it.prompt}.`,
    it.note ? `Category rules for this item: ${it.note}.` : "",
    colorRule(it),
    refs.length
      ? "REGISTRATION — the attached base-figure reference is the exact body this part must fit. Draw the part at the exact position and exact scale it occupies when worn on THAT figure. Keep the figure itself invisible: output ONLY this part on full transparency, positioned as if the figure were still there. Any other attached references lock the illustration style."
      : "",
    SUFFIX,
  ].filter(Boolean).join("\n\n");
};
const sizeFor = (it) => (BUST.has(it.category) ? "1024x1024" : "1024x1536");

// ---------- 6. Plan / dry-run ----------
const cost = batch.reduce((s, i) => s + COST[QUALITY][sizeFor(i)], 0);
console.log(`\nworksheet items: ${items.length} · selected: ${batch.length} · skipped (already exist): ${skipped.length}`);
console.log(`refs attached: ${refs.length ? refs.map((r) => r.split("/").pop()).join(", ") : "none (generations endpoint, PREFIX-only style)"}`);
console.log(`quality: ${QUALITY} · estimated cost: $${cost.toFixed(2)}\n`);

if (DRY) {
  for (const it of batch) console.log(`  ${it.exemplar ? "★" : "·"} ${it.key}  [${sizeFor(it)}] (${it.priority})  — ${it.prompt}`);
  if (batch[0]) {
    console.log(`\n---- full prompt for ${batch[0].key} ----\n`);
    console.log(promptFor(batch[0]));
  }
  console.log("\nDRY RUN — no API calls made. Drop --dry-run to generate.");
  process.exit(0);
}
if (!batch.length) {
  console.log("Nothing to generate (everything selected already exists — use --force to redo).");
  process.exit(0);
}

const KEY = process.env.OPENAI_API_KEY;
if (!KEY) {
  console.error("✗ OPENAI_API_KEY is not set. Export it and re-run (use --dry-run to preview without it).");
  process.exit(1);
}

// ---------- 7. Generate ----------
async function callApi(it) {
  const size = sizeFor(it);
  const prompt = promptFor(it);
  let res;
  if (refs.length) {
    // edits endpoint: reference images anchor the style (and skin/base anchors position)
    const form = new FormData();
    form.append("model", "gpt-image-1");
    form.append("prompt", prompt);
    form.append("size", size);
    form.append("quality", QUALITY);
    form.append("background", "transparent");
    for (const r of refs) form.append("image[]", new Blob([readFileSync(r)], { type: "image/png" }), r.split("/").pop());
    res = await fetch("https://api.openai.com/v1/images/edits", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}` },
      body: form,
    });
  } else {
    res = await fetch("https://api.openai.com/v1/images/generations", {
      method: "POST",
      headers: { Authorization: `Bearer ${KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ model: "gpt-image-1", prompt, size, quality: QUALITY, background: "transparent", output_format: "png" }),
    });
  }
  if (!res.ok) {
    const body = await res.text();
    const err = new Error(`${res.status} ${body.slice(0, 300)}`);
    err.retryable = res.status === 429 || res.status >= 500;
    throw err;
  }
  const data = await res.json();
  const b64 = data.data?.[0]?.b64_json;
  if (!b64) throw new Error(`no image in response: ${JSON.stringify(data).slice(0, 200)}`);
  return Buffer.from(b64, "base64");
}

const runLog = [];
async function generateOne(it) {
  for (let attempt = 0; ; attempt++) {
    try {
      const png = await callApi(it);
      const out = join(STAGING, it.category, `${it.id}.png`);
      mkdirSync(dirname(out), { recursive: true });
      if (isWorn(it)) {
        // save the raw worn render, then key the green figure out deterministically
        const worn = join(STAGING, "_worn", it.category, `${it.id}.png`);
        mkdirSync(dirname(worn), { recursive: true });
        writeFileSync(worn, png);
        execFileSync(join(root, "tools", "art-lab", ".venv", "bin", "python"),
          [join(root, "tools", "art-gen", "key.py"), worn, out], { stdio: "pipe" });
      } else {
        writeFileSync(out, png);
      }
      runLog.push({ key: it.key, size: sizeFor(it), quality: QUALITY, refs: refs.length, prompt: it.prompt, attempts: attempt + 1, at: new Date().toISOString() });
      console.log(`  ✓ ${it.key}  (${(png.length / 1024).toFixed(0)} KB${attempt ? `, attempt ${attempt + 1}` : ""})`);
      return;
    } catch (e) {
      // a failed registration gate (zoomed/cropped figure) is worth a re-roll
      if (String(e.stderr || "").includes("REGISTRATION FAIL")) e.retryable = true;
      if (e.retryable && attempt < RETRIES) {
        const wait = 2000 * 2 ** attempt;
        console.log(`  … ${it.key}: ${e.message.split("\n")[0]} — retrying in ${wait / 1000}s`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      runLog.push({ key: it.key, error: e.message, at: new Date().toISOString() });
      console.error(`  ✗ ${it.key}: ${e.message}`);
      return;
    }
  }
}

const queue = [...batch];
await Promise.all(
  Array.from({ length: Math.min(CONCURRENCY, queue.length) }, async () => {
    while (queue.length) await generateOne(queue.shift());
  }),
);

mkdirSync(STAGING, { recursive: true });
const logPath = join(STAGING, "run-log.json");
const prior = existsSync(logPath) ? JSON.parse(readFileSync(logPath, "utf8")) : [];
writeFileSync(logPath, JSON.stringify([...prior, ...runLog], null, 2));

const ok = runLog.filter((r) => !r.error).length;
const failed = runLog.length - ok;
console.log(`\ndone: ${ok} generated, ${failed} failed → ${STAGING}`);
console.log("next:  tools/art-lab/.venv/bin/python tools/art-gen/qa.py");
console.log("then:  node tools/art-gen/contact-sheet.mjs   (open _art_staging/contact-sheet.html)");
if (failed) process.exit(1);
