#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const LAYERS = [
  "shadow",
  "hair",
  "skin",
  "hoodie",
  "jeans",
  "shoes",
  "bag",
  "ink",
  "residual",
];

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
Extract aligned transparent avatar PNG layers from a generated full-body target.

Usage:
  node tools/avatar-foundry/extract-layers.mjs --input <target.png> --out-dir <dir>

Outputs:
  target.png, layers/*.png, reconstruction.png, contact-sheet.html, manifest.json
`);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      default: h = (r - g) / d + 4; break;
    }
    h *= 60;
  }
  return { h, s, l };
}

function dist2(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

function borderBackground(png) {
  const buckets = new Map();
  const add = (x, y) => {
    const i = (y * png.width + x) * 4;
    const r = png.data[i];
    const g = png.data[i + 1];
    const b = png.data[i + 2];
    const key = `${r >> 4},${g >> 4},${b >> 4}`;
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
  return best ? best.sum.map((v) => v / best.count) : [248, 241, 229];
}

function newLayer(width, height) {
  return new PNG({ width, height });
}

function setPixel(layer, p, r, g, b, a) {
  const i = p * 4;
  layer.data[i] = r;
  layer.data[i + 1] = g;
  layer.data[i + 2] = b;
  layer.data[i + 3] = a;
}

function alphaBlend(dst, p, r, g, b, a) {
  if (a <= 0) return;
  const i = p * 4;
  const da = dst.data[i + 3] / 255;
  const sa = a / 255;
  const oa = sa + da * (1 - sa);
  if (oa <= 0) return;
  dst.data[i] = Math.round((r * sa + dst.data[i] * da * (1 - sa)) / oa);
  dst.data[i + 1] = Math.round((g * sa + dst.data[i + 1] * da * (1 - sa)) / oa);
  dst.data[i + 2] = Math.round((b * sa + dst.data[i + 2] * da * (1 - sa)) / oa);
  dst.data[i + 3] = Math.round(oa * 255);
}

function boundsOf(layer) {
  let minX = layer.width;
  let minY = layer.height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  for (let y = 0; y < layer.height; y += 1) {
    for (let x = 0; x < layer.width; x += 1) {
      const i = (y * layer.width + x) * 4;
      if (layer.data[i + 3] === 0) continue;
      pixels += 1;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  return pixels ? { minX, minY, maxX, maxY, pixels } : { minX: 0, minY: 0, maxX: 0, maxY: 0, pixels: 0 };
}

function cropLayer(layer, bounds, padding = 12) {
  if (!bounds.pixels) return new PNG({ width: 1, height: 1 });
  const minX = clamp(bounds.minX - padding, 0, layer.width - 1);
  const minY = clamp(bounds.minY - padding, 0, layer.height - 1);
  const maxX = clamp(bounds.maxX + padding, 0, layer.width - 1);
  const maxY = clamp(bounds.maxY + padding, 0, layer.height - 1);
  const width = maxX - minX + 1;
  const height = maxY - minY + 1;
  const out = new PNG({ width, height });
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const src = ((minY + y) * layer.width + (minX + x)) * 4;
      const dst = (y * width + x) * 4;
      out.data[dst] = layer.data[src];
      out.data[dst + 1] = layer.data[src + 1];
      out.data[dst + 2] = layer.data[src + 2];
      out.data[dst + 3] = layer.data[src + 3];
    }
  }
  out.registration = { x: minX, y: minY, width, height };
  return out;
}

function classifyPixel({ x, y, width, height, r, g, b, hsl, bgDistance, bg }) {
  const nx = x / width;
  const ny = y / height;
  const luma = 0.299 * r + 0.587 * g + 0.114 * b;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);

  if (bgDistance < 26 && ny > 0.88 && nx > 0.2 && nx < 0.78) return "shadow";
  if (bgDistance < 38) return null;
  if (luma > 224 && chroma < 30 && ny > 0.84) return "shoes";
  if (luma > 218 && chroma < 28) return null;

  const isDark = luma < 74;
  const isBrownHair = hsl.h >= 12 && hsl.h <= 42 && hsl.s >= 0.18 && hsl.l < 0.34;
  const isSkin = hsl.h >= 15 && hsl.h <= 44 && hsl.s >= 0.22 && hsl.l >= 0.32 && hsl.l <= 0.66;
  const isGreen = hsl.h >= 58 && hsl.h <= 112 && hsl.s >= 0.12 && hsl.l >= 0.25 && hsl.l <= 0.75;
  const isBlue = hsl.h >= 184 && hsl.h <= 226 && hsl.s >= 0.12 && hsl.l >= 0.22 && hsl.l <= 0.76;
  const isShoe = (hsl.h >= 26 && hsl.h <= 55 && hsl.s >= 0.14 && hsl.l >= 0.72 && ny > 0.82) || (luma > 198 && ny > 0.82);
  const isBag = (
    nx > 0.5 && nx < 0.75 && ny > 0.2 && ny < 0.58 &&
    hsl.h >= 18 && hsl.h <= 52 && hsl.s < 0.34 && hsl.l >= 0.24 && hsl.l <= 0.78
  );

  if (isBag) return "bag";
  if (isShoe) return "shoes";
  if (isBlue && ny > 0.45) return "jeans";
  if (isGreen && ny > 0.18 && ny < 0.62) return "hoodie";
  if ((isBrownHair || (isDark && ny < 0.42)) && ny < 0.48) return "hair";
  if (isSkin) return "skin";
  if (isDark && bgDistance > 80) {
    if (ny < 0.48) return "hair";
    return "ink";
  }

  // Pull antialiased border pixels into the nearest visible family.
  if (dist2([r, g, b], bg) < 4200) return null;
  if (ny > 0.45 && ny < 0.86) return "jeans";
  if (ny > 0.18 && ny < 0.62) return "hoodie";
  return "residual";
}

export function extractLayers(input, outDir) {
  const source = PNG.sync.read(readFileSync(input));
  const bg = borderBackground(source);
  const layers = Object.fromEntries(LAYERS.map((name) => [name, newLayer(source.width, source.height)]));
  const reconstruction = newLayer(source.width, source.height);
  const assignments = {};

  for (let y = 0; y < source.height; y += 1) {
    for (let x = 0; x < source.width; x += 1) {
      const p = y * source.width + x;
      const i = p * 4;
      const r = source.data[i];
      const g = source.data[i + 1];
      const b = source.data[i + 2];
      const a = source.data[i + 3];
      if (a < 8) continue;
      const bgDistance = Math.sqrt(dist2([r, g, b], bg));
      const hsl = rgbToHsl(r, g, b);
      const layerName = classifyPixel({ x, y, width: source.width, height: source.height, r, g, b, hsl, bgDistance, bg });
      if (!layerName) continue;
      setPixel(layers[layerName], p, r, g, b, a);
      alphaBlend(reconstruction, p, r, g, b, a);
      assignments[layerName] = (assignments[layerName] || 0) + 1;
    }
  }

  mkdirSync(outDir, { recursive: true });
  mkdirSync(join(outDir, "layers"), { recursive: true });
  mkdirSync(join(outDir, "crops"), { recursive: true });
  const targetPath = join(outDir, "target.png");
  writeFileSync(targetPath, PNG.sync.write(source));
  const layerInfo = [];
  for (const name of LAYERS) {
    const file = `layers/${name}.png`;
    writeFileSync(join(outDir, file), PNG.sync.write(layers[name]));
    const bounds = boundsOf(layers[name]);
    const crop = cropLayer(layers[name], bounds);
    const cropFile = `crops/${name}.png`;
    writeFileSync(join(outDir, cropFile), PNG.sync.write(crop));
    layerInfo.push({
      name,
      file,
      cropFile,
      registration: crop.registration || { x: 0, y: 0, width: 1, height: 1 },
      ...bounds,
    });
  }
  writeFileSync(join(outDir, "reconstruction.png"), PNG.sync.write(reconstruction));

  const manifest = {
    tool: "avatar-foundry/extract-layers",
    source: input,
    width: source.width,
    height: source.height,
    background: bg.map((v) => Math.round(v)),
    layers: layerInfo,
  };
  writeFileSync(join(outDir, "manifest.json"), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(join(outDir, "contact-sheet.html"), contactSheet(manifest));
  return manifest;
}

function contactSheet(manifest) {
  const layerCards = manifest.layers.map((layer) => `
    <article>
      <h2>${layer.name}</h2>
      <img src="${layer.cropFile}" alt="${layer.name}">
      <p>${layer.pixels} px · ${layer.minX},${layer.minY} → ${layer.maxX},${layer.maxY}</p>
    </article>
  `).join("");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Avatar Layer Extraction</title>
  <style>
    body { margin: 0; background: #eee6d8; color: #2f2823; font-family: Inter, system-ui, sans-serif; }
    header { padding: 24px 28px 8px; }
    h1 { margin: 0; font: 700 28px Georgia, serif; }
    main { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 16px; padding: 20px 28px 32px; }
    article { border: 1px solid #ddd0bd; border-radius: 8px; background: #fffaf2; overflow: hidden; box-shadow: 0 10px 22px rgba(53,45,38,.1); }
    h2 { margin: 12px 14px 0; font-size: 15px; text-transform: uppercase; letter-spacing: .05em; }
    p { margin: 4px 14px 14px; font-size: 12px; color: #756a60; font-weight: 650; }
    img { width: 100%; height: 360px; object-fit: contain; background:
      linear-gradient(45deg, #f2eadf 25%, transparent 25%),
      linear-gradient(-45deg, #f2eadf 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, #f2eadf 75%),
      linear-gradient(-45deg, transparent 75%, #f2eadf 75%);
      background-size: 24px 24px; background-position: 0 0, 0 12px, 12px -12px, -12px 0; }
  </style>
</head>
<body>
  <header><h1>Avatar Layer Extraction</h1></header>
  <main>
    <article><h2>target</h2><img src="target.png" alt="target"><p>source</p></article>
    <article><h2>reconstruction</h2><img src="reconstruction.png" alt="reconstruction"><p>restacked extracted layers</p></article>
    ${layerCards}
  </main>
</body>
</html>
`;
}

async function main() {
  const args = parseArgv(process.argv.slice(2));
  if (!args.input || !args["out-dir"] || args.help) {
    usage();
    process.exit(args.help ? 0 : 1);
  }
  const result = extractLayers(resolve(args.input), resolve(args["out-dir"]));
  console.log(JSON.stringify(result, null, 2));
}

const current = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === current) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
}
