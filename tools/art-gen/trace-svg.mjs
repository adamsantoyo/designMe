#!/usr/bin/env node
// Story 2.4 — SVG parts pipeline: posterize -> vtracer -> SVGO -> QA gate -> size report.
//
// For every key in app/src/parts/registry.ts (the approval gate — file presence in
// assets/ means nothing), runs tools/art-gen/posterize-trace.py in its own process
// (vtracer segfault isolation), optimizes with SVGO, rasterizes the result in
// Chromium, and pixel-compares it against the posterized master. Only parts that
// pass QA are eligible for svgRegistry generation (gen-svg-registry.mjs reads the
// report). Emits tools/art-lab/out/svg-opt/<cat>/<id>.svg + trace-svg-report.json.
//
// Usage: node tools/art-gen/trace-svg.mjs [--only cat/id,cat/id]

import { execFile } from "node:child_process";
import { mkdirSync, readFileSync, statSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { cpus, tmpdir } from "node:os";
import { join, resolve, dirname } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";
import { chromium } from "playwright";
import { optimize } from "svgo";

const execFileP = promisify(execFile);
const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const VENV_PY = join(ROOT, "tools/art-lab/.venv/bin/python");
const WORKER = join(ROOT, "tools/art-gen/posterize-trace.py");
const REGISTRY = join(ROOT, "app/src/parts/registry.ts");
const PARTS_DIR = join(ROOT, "app/assets/parts");
const RAW_DIR = join(ROOT, "tools/art-lab/out/svg");      // before (13.4MB reference)
const OPT_DIR = join(ROOT, "tools/art-lab/out/svg-opt");  // after (what ships)
const REPORT = join(ROOT, "tools/art-lab/out/trace-svg-report.json");

// QA gate — objective checks only:
//   * fills ⊆ exact tone set (the runtime swap contract; checked at trace time)
//   * registration: rendered ink bbox within maxBboxShift px of the posterized ref
//   * completeness: rendered ink area within inkRatio of the ref (a vanished
//     feature collapses area; an artifact explosion inflates it)
//   * size caps (per-part cap triggers one automatic half-res retrace)
// Line-weight parity vs the raster master is deliberately NOT gated: vtracer
// redraws thin lines as smooth curves (that IS the premium transcode); every
// pixel metric flags it, human review approves it. The perceptual `misfit`
// stays in the report to rank the contact-sheet review, not to gate.
const QA = {
  maxBboxShift: 8, inkRatio: [0.55, 1.45],
  maxPartBytes: 60 * 1024, maxTotalBytes: 2.2 * 1024 * 1024,
};
const W = 1024, H = 1536;

const svgoConfig = {
  multipass: true,
  plugins: [
    {
      name: "preset-default",
      params: {
        overrides: {
          // svgo v4 preset-default keeps the viewBox; no override needed.
          // Runtime tint = exact string replace on fill="#rrggbb" — colors must
          // survive byte-identical. No shorthex, no keywords.
          convertColors: false,
        },
      },
    },
    { name: "convertPathData", params: { floatPrecision: 1 } },
    { name: "cleanupNumericValues", params: { floatPrecision: 1 } },
  ],
};

function registryKeys() {
  // strip comments first — the registry header shows an example require line
  const src = readFileSync(REGISTRY, "utf8").replace(/^\s*\/\/.*$/gm, "");
  const keys = [...src.matchAll(/"([a-zA-Z]+\/[a-zA-Z0-9_]+)":\s*require\(/g)].map((m) => m[1]);
  return [...new Set(keys)];
}

async function tracePart(key, downscale = 1) {
  const [cat, id] = key.split("/");
  const master = join(PARTS_DIR, cat, `${id}.png`);
  const outSvg = join(OPT_DIR, cat, `${id}.svg`);
  const refPng = join(tmpdir(), `dm-ref-${cat}-${id}.png`);
  mkdirSync(dirname(outSvg), { recursive: true });

  let meta;
  try {
    const args = [WORKER, master, outSvg, refPng];
    if (downscale > 1) args.push(String(downscale));
    const { stdout } = await execFileP(VENV_PY, args, { timeout: 180000 });
    meta = JSON.parse(stdout.trim().split("\n").pop());
  } catch (e) {
    return { key, pass: false, fail: `trace: ${String(e.message).slice(0, 200)}` };
  }

  const raw = readFileSync(outSvg, "utf8");
  const opt = optimize(raw, svgoConfig).data;
  writeFileSync(outSvg, opt);

  // fills must be exactly the tone set (the runtime swap contract)
  const fills = new Set([...opt.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]));
  const alien = [...fills].filter((f) => !meta.tones.includes(f));
  if (alien.length) return { key, pass: false, fail: `alien fills after svgo: ${alien}`, meta };

  let before = null;
  const rawPath = join(RAW_DIR, cat, `${id}.svg`);
  if (existsSync(rawPath)) before = statSync(rawPath).size;

  return { key, meta, refPng, outSvg, downscale,
    bytes: Buffer.byteLength(opt), before, pass: null };
}

function readPng(path) {
  return PNG.sync.read(readFileSync(path));
}

// Perceptual diff: composite BOTH images over paper, box-downscale 4x (the same
// low-pass both sides — integrates away AA-vs-hard-posterize edge differences),
// then count pixels whose max channel diff exceeds a tolerance, normalized by
// ink area. A 1px curve shift or an AA band washes out; a vanished stitch line
// or a wrong tone region survives the blur and gets counted.
const PAPER = [251, 248, 242];
function downTo(img, f) {
  const w = img.width / f | 0, h = img.height / f | 0;
  const out = new Float32Array(w * h * 3);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let r = 0, g = 0, b = 0;
      for (let dy = 0; dy < f; dy++) {
        for (let dx = 0; dx < f; dx++) {
          const i = ((y * f + dy) * img.width + x * f + dx) * 4;
          const a = img.data[i + 3] / 255;
          r += img.data[i] * a + PAPER[0] * (1 - a);
          g += img.data[i + 1] * a + PAPER[1] * (1 - a);
          b += img.data[i + 2] * a + PAPER[2] * (1 - a);
        }
      }
      const o = (y * w + x) * 3, n = f * f;
      out[o] = r / n; out[o + 1] = g / n; out[o + 2] = b / n;
    }
  }
  return { w, h, d: out };
}

function inkStats(img) {
  const w = img.width, h = img.height;
  let minX = w, minY = h, maxX = -1, maxY = -1, area = 0;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (img.data[(y * w + x) * 4 + 3] >= 128) {
        area++;
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  return { area, minX, minY, maxX, maxY };
}

function compare(refPng, shotPng) {
  const a = readPng(refPng), b = readPng(shotPng);
  if (a.width !== b.width || a.height !== b.height) {
    return { misfit: 1, bboxShift: 9999, inkRatio: 0 };
  }
  const sa = inkStats(a), sb = inkStats(b);
  const bboxShift = Math.max(
    Math.abs(sa.minX - sb.minX), Math.abs(sa.minY - sb.minY),
    Math.abs(sa.maxX - sb.maxX), Math.abs(sa.maxY - sb.maxY));
  const inkRatio = sa.area ? sb.area / sa.area : 0;
  const refBbox = [sa.minX, sa.minY, sa.maxX, sa.maxY];

  const da = downTo(a, 4), db = downTo(b, 4);
  const TOL = 12, INK = 8;
  let ink = 0, bad = 0;
  for (let i = 0; i < da.w * da.h; i++) {
    const o = i * 3;
    const inkA = Math.max(Math.abs(da.d[o] - PAPER[0]), Math.abs(da.d[o + 1] - PAPER[1]),
      Math.abs(da.d[o + 2] - PAPER[2])) > INK;
    const inkB = Math.max(Math.abs(db.d[o] - PAPER[0]), Math.abs(db.d[o + 1] - PAPER[1]),
      Math.abs(db.d[o + 2] - PAPER[2])) > INK;
    if (!inkA && !inkB) continue;
    ink++;
    const diff = Math.max(Math.abs(da.d[o] - db.d[o]), Math.abs(da.d[o + 1] - db.d[o + 1]),
      Math.abs(da.d[o + 2] - db.d[o + 2]));
    if (diff > TOL) bad++;
  }
  return { misfit: ink ? bad / ink : 1, bboxShift, inkRatio, refBbox };
}

async function main() {
  const only = process.argv.includes("--only")
    ? process.argv[process.argv.indexOf("--only") + 1].split(",")
    : null;
  const keys = registryKeys().filter((k) => !only || only.includes(k));
  console.log(`tracing ${keys.length} registered parts…`);
  // full runs start clean; --only runs must not wipe sibling outputs
  if (!only) rmSync(OPT_DIR, { recursive: true, force: true });

  // pool the python workers
  const results = [];
  const pool = Math.max(2, Math.min(8, cpus().length - 2));
  let idx = 0;
  await Promise.all(Array.from({ length: pool }, async () => {
    while (idx < keys.length) {
      const key = keys[idx++];
      results.push(await tracePart(key));
    }
  }));

  // QA raster pass — one Chromium for all parts, full resolution
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  const qaOne = async (r) => {
    const svg = readFileSync(r.outSvg, "utf8")
      .replace("<svg ", `<svg width="${W}" height="${H}" `);
    await page.setContent(
      `<!doctype html><style>*{margin:0}</style>${svg}`, { waitUntil: "load" });
    const shot = join(tmpdir(), `dm-shot.png`);
    await page.locator("svg").screenshot({ path: shot, omitBackground: true });
    const { misfit, bboxShift, inkRatio, refBbox } = compare(r.refPng, shot);
    r.misfit = +misfit.toFixed(4);
    r.bboxShift = bboxShift;
    r.inkRatio = +inkRatio.toFixed(3);
    r.bbox = refBbox; // canonical-space ink bounds — svgRegistry crop filter
    r.pass = bboxShift <= QA.maxBboxShift
      && inkRatio >= QA.inkRatio[0] && inkRatio <= QA.inkRatio[1]
      && r.bytes <= QA.maxPartBytes;
    if (!r.pass) {
      r.fail = `qa: bboxShift=${bboxShift} inkRatio=${r.inkRatio} bytes=${r.bytes}`;
    }
  };
  for (const r of results) {
    if (r.fail) continue;
    await qaOne(r);
    // size-cap breach: retrace at 1/2 then 1/3 res (exact tones kept), re-QA
    for (const ds of [2, 3]) {
      if (r.pass || r.bytes <= QA.maxPartBytes) break;
      const retry = await tracePart(r.key, ds);
      if (!retry.fail) {
        await qaOne(retry);
        if (retry.pass || retry.bytes < r.bytes) {
          Object.assign(r, retry, { retraced: `1/${ds}-res` });
        }
      }
    }
  }
  await browser.close();

  // --only merges into the existing report instead of clobbering it
  let prevParts = {};
  if (only && existsSync(REPORT)) {
    prevParts = JSON.parse(readFileSync(REPORT, "utf8")).parts || {};
    for (const r of results) delete prevParts[r.key];
  }
  const prevList = Object.entries(prevParts).map(([key, p]) =>
    ({ key, ...p, meta: { tones: p.tones, n_paths: p.n_paths } }));
  const merged = [...prevList, ...results];

  const passed = merged.filter((r) => r.pass);
  const failed = merged.filter((r) => !r.pass);
  const totalAfter = passed.reduce((s, r) => s + r.bytes, 0);
  const totalBefore = merged.reduce((s, r) => s + (r.before || 0), 0);
  const worst = [...passed].sort((a, b) => b.bytes - a.bytes).slice(0, 5)
    .map((r) => `${r.key}=${(r.bytes / 1024).toFixed(1)}KB`);

  const report = {
    date: new Date().toISOString().slice(0, 10),
    qa: QA,
    counts: { traced: merged.length, passed: passed.length, failed: failed.length },
    sizes: {
      beforeRawTraceBytes: totalBefore,
      afterOptimizedBytes: totalAfter,
      budgetBytes: QA.maxTotalBytes,
      withinBudget: totalAfter <= QA.maxTotalBytes,
      largest: worst,
    },
    failed: failed.map((r) => ({ key: r.key, fail: r.fail })),
    parts: Object.fromEntries(merged.map((r) => [r.key, {
      pass: !!r.pass, bytes: r.bytes ?? null, before: r.before,
      misfit: r.misfit ?? null, bboxShift: r.bboxShift ?? null,
      inkRatio: r.inkRatio ?? null, retraced: r.retraced, bbox: r.bbox ?? null,
      tones: r.meta?.tones ?? null, n_paths: r.meta?.n_paths ?? null,
    }])),
  };
  writeFileSync(REPORT, JSON.stringify(report, null, 1));

  console.log(`passed ${passed.length}/${merged.length}`);
  console.log(`size: raw ${(totalBefore / 1048576).toFixed(1)}MB -> optimized ${(totalAfter / 1048576).toFixed(2)}MB (budget ${(QA.maxTotalBytes / 1048576).toFixed(1)}MB)`);
  console.log(`largest: ${worst.join(", ")}`);
  for (const f of failed) console.log(`  FAIL ${f.key}: ${f.fail}`);
  console.log(`report: ${REPORT}`);
  if (!report.sizes.withinBudget) process.exitCode = 1;
}

await main();
