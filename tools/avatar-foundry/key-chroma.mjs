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

function hexToRgb(hex) {
  const raw = String(hex || "#00ff00").replace("#", "");
  const n = parseInt(raw.length === 6 ? raw : "00ff00", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function numberArg(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(min, Math.min(max, n)) : fallback;
}

function dist(r, g, b, key) {
  const dr = r - key[0];
  const dg = g - key[1];
  const db = b - key[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function boolArg(value, fallback) {
  if (value === undefined) return fallback;
  if (value === true) return true;
  return !["0", "false", "no", "off"].includes(String(value).toLowerCase());
}

function likelyChromaKey(r, g, b, key) {
  if (dist(r, g, b, key) <= 120) return true;
  const [kr, kg, kb] = key;
  if (kr > kg && kb > kg) {
    const dominance = Math.min(r, b) - g;
    return r > 90 && b > 90 && dominance > 24 && dist(r, g, b, key) <= 260;
  }
  const dominance = g - Math.max(r, b);
  return g > 32 && dominance > 18 && g > r * 1.35 && g > b * 1.35 && dist(r, g, b, key) <= 260;
}

export function keyChroma(input, out, rawOptions = {}) {
  const key = hexToRgb(rawOptions.key || "#00ff00");
  const transparent = numberArg(rawOptions.transparent, 38, 0, 255);
  const opaque = numberArg(rawOptions.opaque, 120, transparent + 1, 442);
  const greenDominance = boolArg(rawOptions.greenDominance ?? rawOptions["green-dominance"], false);
  const image = PNG.sync.read(readFileSync(input));
  const result = new PNG({ width: image.width, height: image.height });
  result.data.set(image.data);

  for (let i = 0; i < result.data.length; i += 4) {
    const d = dist(result.data[i], result.data[i + 1], result.data[i + 2], key);
    if (greenDominance && likelyChromaKey(result.data[i], result.data[i + 1], result.data[i + 2], key)) {
      result.data[i + 3] = 0;
      continue;
    }
    if (d <= transparent) {
      result.data[i + 3] = 0;
      continue;
    }
    if (d < opaque) {
      result.data[i + 3] = Math.round(((d - transparent) / (opaque - transparent)) * result.data[i + 3]);
      // Despill green fringes.
      result.data[i + 1] = Math.round(result.data[i + 1] * 0.72 + Math.max(result.data[i], result.data[i + 2]) * 0.28);
      continue;
    }
  }

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, PNG.sync.write(result));
  return { input, out, width: image.width, height: image.height, key: `#${key.map((n) => n.toString(16).padStart(2, "0")).join("")}` };
}

async function main() {
  const args = parseArgv(process.argv.slice(2));
  if (!args.input || !args.out) {
    console.log("Usage: node tools/avatar-foundry/key-chroma.mjs --input <png> --out <png> [--key #00ff00]");
    process.exit(1);
  }
  console.log(JSON.stringify(keyChroma(resolve(args.input), resolve(args.out), args), null, 2));
}

const current = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === current) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
}
