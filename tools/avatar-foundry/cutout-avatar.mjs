#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

function parseArgv(argv) {
  const out = {};
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) continue;
    const key = token.slice(2);
    const next = argv[i + 1];
    if (!next || next.startsWith("--")) out[key] = true;
    else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

function usage() {
  console.log(`
Create a transparent avatar cutout from a generated full-body PNG.

Usage:
  node tools/avatar-foundry/cutout-avatar.mjs --input <image.png> --out <cutout.png>

Options:
  --tolerance <n>      Background color distance, default 48
  --edge-softness <n>  Partial-alpha edge band, default 20
`);
}

function numberArg(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function dist(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function luma(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function sampleBorderBackground(png) {
  const buckets = new Map();
  const add = (x, y) => {
    const i = (y * png.width + x) * 4;
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const key = `${r >> 3},${g >> 3},${b >> 3}`;
    const prev = buckets.get(key) || { count: 0, sum: [0, 0, 0] };
    prev.count += 1;
    prev.sum[0] += r;
    prev.sum[1] += g;
    prev.sum[2] += b;
    buckets.set(key, prev);
  };

  for (let x = 0; x < png.width; x += 1) {
    add(x, 0);
    add(x, png.height - 1);
  }
  for (let y = 1; y < png.height - 1; y += 1) {
    add(0, y);
    add(png.width - 1, y);
  }

  const best = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
  return best ? best.sum.map((v) => v / best.count) : [254, 247, 237];
}

function isBackgroundPixel(png, p, bg, tolerance) {
  const i = p * 4;
  const r = png.data[i];
  const g = png.data[i + 1];
  const b = png.data[i + 2];
  const colorDist = dist([r, g, b], bg);
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  return colorDist <= tolerance || (luma(r, g, b) > 236 && chroma < 30);
}

function floodBackground(png, bg, tolerance) {
  const { width, height } = png;
  const visited = new Uint8Array(width * height);
  const queue = [];
  const enqueue = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const p = y * width + x;
    if (visited[p]) return;
    if (!isBackgroundPixel(png, p, bg, tolerance)) return;
    visited[p] = 1;
    queue.push(p);
  };

  for (let x = 0; x < width; x += 1) {
    enqueue(x, 0);
    enqueue(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    enqueue(0, y);
    enqueue(width - 1, y);
  }

  for (let q = 0; q < queue.length; q += 1) {
    const p = queue[q];
    const x = p % width;
    const y = Math.floor(p / width);
    enqueue(x - 1, y);
    enqueue(x + 1, y);
    enqueue(x, y - 1);
    enqueue(x, y + 1);
  }
  return visited;
}

function softenEdges(png, backgroundMask, bg, tolerance, softness) {
  const { width, height } = png;
  const out = new PNG({ width, height });
  out.data.set(png.data);

  for (let p = 0; p < width * height; p += 1) {
    const i = p * 4;
    if (backgroundMask[p]) {
      out.data[i + 3] = 0;
      continue;
    }

    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const colorDist = dist([r, g, b], bg);
    if (colorDist < tolerance + softness) {
      const alpha = Math.round(((colorDist - tolerance) / softness) * 255);
      out.data[i + 3] = Math.max(0, Math.min(255, alpha));
      // Despill edge pixels toward warmer neutral instead of leaving a light fringe.
      out.data[i] = Math.round(r * 0.88 + 120 * 0.12);
      out.data[i + 1] = Math.round(g * 0.88 + 92 * 0.12);
      out.data[i + 2] = Math.round(b * 0.88 + 70 * 0.12);
    }
  }

  return out;
}

function boundsOfAlpha(png) {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const a = png.data[(y * png.width + x) * 4 + 3];
      if (a <= 0) continue;
      pixels += 1;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return pixels ? { minX, minY, maxX, maxY, pixels } : { minX: 0, minY: 0, maxX: 0, maxY: 0, pixels: 0 };
}

export function cutoutAvatar(input, out, rawOptions = {}) {
  const tolerance = numberArg(rawOptions.tolerance, 48, 1, 220);
  const softness = numberArg(rawOptions.edgeSoftness ?? rawOptions["edge-softness"], 20, 1, 120);
  const source = PNG.sync.read(readFileSync(input));
  const bg = sampleBorderBackground(source);
  const backgroundMask = floodBackground(source, bg, tolerance);
  const cutout = softenEdges(source, backgroundMask, bg, tolerance, softness);
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, PNG.sync.write(cutout));
  return {
    input,
    out,
    width: source.width,
    height: source.height,
    background: bg.map((v) => Math.round(v)),
    tolerance,
    edgeSoftness: softness,
    bounds: boundsOfAlpha(cutout),
  };
}

async function main() {
  const args = parseArgv(process.argv.slice(2));
  if (!args.input || !args.out || args.help) {
    usage();
    process.exit(args.help ? 0 : 1);
  }
  const result = cutoutAvatar(resolve(args.input), resolve(args.out), args);
  console.log(JSON.stringify(result, null, 2));
}

const current = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === current) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
}
