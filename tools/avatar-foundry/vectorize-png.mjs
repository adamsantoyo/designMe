#!/usr/bin/env node
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const DEFAULTS = {
  colors: 18,
  maxSize: 720,
  alphaThreshold: 24,
  backgroundTolerance: 42,
  dropBackground: true,
  minArea: 28,
  simplify: 1.2,
  maxComponents: 260,
};

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
PNG to SVG vectorizer for Avatar Foundry reference art.

Usage:
  node tools/avatar-foundry/vectorize-png.mjs --input <image.png> --out <image.svg>

Options:
  --colors <n>          K-means color regions, default ${DEFAULTS.colors}
  --max-size <px>       Largest raster dimension before tracing, default ${DEFAULTS.maxSize}
  --min-area <px>       Ignore connected regions smaller than this, default ${DEFAULTS.minArea}
  --simplify <px>       Ramer-Douglas-Peucker tolerance, default ${DEFAULTS.simplify}
  --drop-background 0   Keep solid border/background color instead of removing it
`);
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function numberArg(value, fallback, min, max) {
  const n = Number(value);
  return Number.isFinite(n) ? clamp(n, min, max) : fallback;
}

function boolArg(value, fallback) {
  if (value === undefined) return fallback;
  if (value === true) return true;
  return !["0", "false", "no", "off"].includes(String(value).toLowerCase());
}

function colorDistance(a, b) {
  const dr = a[0] - b[0];
  const dg = a[1] - b[1];
  const db = a[2] - b[2];
  return dr * dr + dg * dg + db * db;
}

function rgbToHex(rgb) {
  return `#${rgb.map((n) => Math.round(clamp(n, 0, 255)).toString(16).padStart(2, "0")).join("")}`;
}

function escapeXml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function readScaledPng(input, maxSize) {
  const png = PNG.sync.read(readFileSync(input));
  const scale = Math.min(1, maxSize / Math.max(png.width, png.height));
  const width = Math.max(1, Math.round(png.width * scale));
  const height = Math.max(1, Math.round(png.height * scale));
  const pixels = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y += 1) {
    const sy = Math.min(png.height - 1, Math.floor(y / scale));
    for (let x = 0; x < width; x += 1) {
      const sx = Math.min(png.width - 1, Math.floor(x / scale));
      const src = (sy * png.width + sx) * 4;
      const dst = (y * width + x) * 4;
      pixels[dst] = png.data[src];
      pixels[dst + 1] = png.data[src + 1];
      pixels[dst + 2] = png.data[src + 2];
      pixels[dst + 3] = png.data[src + 3];
    }
  }
  return { width, height, pixels, sourceWidth: png.width, sourceHeight: png.height };
}

function bucketKey(r, g, b) {
  return `${r >> 4},${g >> 4},${b >> 4}`;
}

function detectBackground(image, options) {
  const buckets = new Map();
  const { width, height, pixels } = image;
  const add = (x, y) => {
    const i = (y * width + x) * 4;
    if (pixels[i + 3] < options.alphaThreshold) return;
    const key = bucketKey(pixels[i], pixels[i + 1], pixels[i + 2]);
    const prev = buckets.get(key) || { count: 0, sum: [0, 0, 0] };
    prev.count += 1;
    prev.sum[0] += pixels[i];
    prev.sum[1] += pixels[i + 1];
    prev.sum[2] += pixels[i + 2];
    buckets.set(key, prev);
  };
  for (let x = 0; x < width; x += 1) {
    add(x, 0);
    add(x, height - 1);
  }
  for (let y = 1; y < height - 1; y += 1) {
    add(0, y);
    add(width - 1, y);
  }
  const best = [...buckets.values()].sort((a, b) => b.count - a.count)[0];
  return best ? best.sum.map((v) => v / best.count) : null;
}

function collectSamples(image, options, background) {
  const samples = [];
  const { width, height, pixels } = image;
  const maxSamples = 24000;
  const stride = Math.max(1, Math.floor(Math.sqrt((width * height) / maxSamples)));
  for (let y = 0; y < height; y += stride) {
    for (let x = 0; x < width; x += stride) {
      const i = (y * width + x) * 4;
      if (pixels[i + 3] < options.alphaThreshold) continue;
      const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
      if (background && colorDistance(rgb, background) <= options.backgroundTolerance * options.backgroundTolerance) continue;
      samples.push(rgb);
    }
  }
  return samples;
}

function initialCenters(samples, count) {
  const buckets = new Map();
  for (const rgb of samples) {
    const key = bucketKey(rgb[0], rgb[1], rgb[2]);
    const prev = buckets.get(key) || { count: 0, sum: [0, 0, 0] };
    prev.count += 1;
    prev.sum[0] += rgb[0];
    prev.sum[1] += rgb[1];
    prev.sum[2] += rgb[2];
    buckets.set(key, prev);
  }
  const centers = [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, count)
    .map((bucket) => bucket.sum.map((v) => v / bucket.count));
  for (let i = centers.length; i < count && samples.length; i += 1) {
    centers.push(samples[Math.floor((i / count) * samples.length)]);
  }
  return centers;
}

function kmeans(samples, count) {
  const centers = initialCenters(samples, count);
  if (!centers.length) return [];
  for (let iter = 0; iter < 8; iter += 1) {
    const sums = centers.map(() => [0, 0, 0, 0]);
    for (const rgb of samples) {
      const idx = nearestCenter(rgb, centers);
      sums[idx][0] += rgb[0];
      sums[idx][1] += rgb[1];
      sums[idx][2] += rgb[2];
      sums[idx][3] += 1;
    }
    for (let i = 0; i < centers.length; i += 1) {
      if (!sums[i][3]) continue;
      centers[i] = [sums[i][0] / sums[i][3], sums[i][1] / sums[i][3], sums[i][2] / sums[i][3]];
    }
  }
  return centers;
}

function nearestCenter(rgb, centers) {
  let best = 0;
  let bestD = Infinity;
  for (let i = 0; i < centers.length; i += 1) {
    const d = colorDistance(rgb, centers[i]);
    if (d < bestD) {
      best = i;
      bestD = d;
    }
  }
  return best;
}

function assignPixels(image, centers, options, background) {
  const { width, height, pixels } = image;
  const assignment = new Int16Array(width * height);
  assignment.fill(-1);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const p = y * width + x;
      const i = p * 4;
      if (pixels[i + 3] < options.alphaThreshold) continue;
      const rgb = [pixels[i], pixels[i + 1], pixels[i + 2]];
      if (background && colorDistance(rgb, background) <= options.backgroundTolerance * options.backgroundTolerance) continue;
      assignment[p] = nearestCenter(rgb, centers);
    }
  }
  return assignment;
}

function connectedComponents(assignment, width, height, options) {
  const visited = new Uint8Array(width * height);
  const components = [];
  const stack = [];
  const pushIf = (p, color) => {
    if (p < 0 || p >= assignment.length || visited[p] || assignment[p] !== color) return;
    visited[p] = 1;
    stack.push(p);
  };

  for (let p = 0; p < assignment.length; p += 1) {
    const color = assignment[p];
    if (color < 0 || visited[p]) continue;
    visited[p] = 1;
    stack.push(p);
    const pixels = [];
    let minX = width;
    let minY = height;
    let maxX = 0;
    let maxY = 0;

    while (stack.length) {
      const cur = stack.pop();
      pixels.push(cur);
      const x = cur % width;
      const y = Math.floor(cur / width);
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      if (x > 0) pushIf(cur - 1, color);
      if (x < width - 1) pushIf(cur + 1, color);
      if (y > 0) pushIf(cur - width, color);
      if (y < height - 1) pushIf(cur + width, color);
    }

    if (pixels.length >= options.minArea) {
      components.push({ color, pixels, area: pixels.length, bounds: [minX, minY, maxX, maxY] });
    }
  }

  return components
    .sort((a, b) => b.area - a.area)
    .slice(0, options.maxComponents);
}

function pointKey(x, y) {
  return `${x},${y}`;
}

function addEdge(edges, x1, y1, x2, y2) {
  const key = pointKey(x1, y1);
  const list = edges.get(key) || [];
  list.push([x1, y1, x2, y2]);
  edges.set(key, list);
}

function simplifyCollinear(points) {
  if (points.length <= 3) return points;
  const out = [];
  for (let i = 0; i < points.length; i += 1) {
    const a = points[(i - 1 + points.length) % points.length];
    const b = points[i];
    const c = points[(i + 1) % points.length];
    const cross = (b[0] - a[0]) * (c[1] - b[1]) - (b[1] - a[1]) * (c[0] - b[0]);
    if (cross !== 0) out.push(b);
  }
  return out;
}

function perpendicularDistance(point, start, end) {
  const dx = end[0] - start[0];
  const dy = end[1] - start[1];
  if (dx === 0 && dy === 0) return Math.hypot(point[0] - start[0], point[1] - start[1]);
  return Math.abs(dy * point[0] - dx * point[1] + end[0] * start[1] - end[1] * start[0]) / Math.hypot(dx, dy);
}

function rdp(points, epsilon) {
  if (points.length < 3 || epsilon <= 0) return points;
  let maxD = 0;
  let index = 0;
  for (let i = 1; i < points.length - 1; i += 1) {
    const d = perpendicularDistance(points[i], points[0], points[points.length - 1]);
    if (d > maxD) {
      index = i;
      maxD = d;
    }
  }
  if (maxD <= epsilon) return [points[0], points[points.length - 1]];
  return [...rdp(points.slice(0, index + 1), epsilon).slice(0, -1), ...rdp(points.slice(index), epsilon)];
}

function simplifyLoop(points, epsilon) {
  let loop = points;
  const first = loop[0];
  const last = loop[loop.length - 1];
  if (first && last && first[0] === last[0] && first[1] === last[1]) loop = loop.slice(0, -1);
  loop = simplifyCollinear(loop);
  if (loop.length < 4 || epsilon <= 0) return loop;
  const closed = [...loop, loop[0]];
  const simplified = rdp(closed, epsilon).slice(0, -1);
  return simplified.length >= 3 ? simplified : loop;
}

function traceComponent(component, width, height, options) {
  const mask = new Uint8Array(width * height);
  for (const p of component.pixels) mask[p] = 1;
  const inside = (x, y) => x >= 0 && x < width && y >= 0 && y < height && mask[y * width + x];
  const edges = new Map();
  let edgeCount = 0;

  for (const p of component.pixels) {
    const x = p % width;
    const y = Math.floor(p / width);
    if (!inside(x, y - 1)) {
      addEdge(edges, x, y, x + 1, y);
      edgeCount += 1;
    }
    if (!inside(x + 1, y)) {
      addEdge(edges, x + 1, y, x + 1, y + 1);
      edgeCount += 1;
    }
    if (!inside(x, y + 1)) {
      addEdge(edges, x + 1, y + 1, x, y + 1);
      edgeCount += 1;
    }
    if (!inside(x - 1, y)) {
      addEdge(edges, x, y + 1, x, y);
      edgeCount += 1;
    }
  }

  const loops = [];
  while (edgeCount > 0) {
    let edge = null;
    for (const [key, list] of edges) {
      if (!list.length) {
        edges.delete(key);
        continue;
      }
      edge = list.pop();
      edgeCount -= 1;
      if (!list.length) edges.delete(key);
      break;
    }
    if (!edge) break;

    const start = [edge[0], edge[1]];
    let current = [edge[2], edge[3]];
    const points = [start, current];
    let guard = 0;
    while ((current[0] !== start[0] || current[1] !== start[1]) && guard < 100000) {
      guard += 1;
      const key = pointKey(current[0], current[1]);
      const list = edges.get(key);
      if (!list || !list.length) break;
      const next = list.pop();
      edgeCount -= 1;
      if (!list.length) edges.delete(key);
      current = [next[2], next[3]];
      points.push(current);
    }

    const loop = simplifyLoop(points, options.simplify);
    if (loop.length >= 3) loops.push(loop);
  }

  return loops;
}

function pathFromLoops(loops) {
  return loops.map((loop) => {
    const [first, ...rest] = loop;
    return `M${first[0]} ${first[1]} ${rest.map((p) => `L${p[0]} ${p[1]}`).join(" ")} Z`;
  }).join(" ");
}

export function vectorizePng(input, out, rawOptions = {}) {
  const options = {
    colors: numberArg(rawOptions.colors, DEFAULTS.colors, 2, 64),
    maxSize: numberArg(rawOptions.maxSize ?? rawOptions["max-size"], DEFAULTS.maxSize, 64, 1800),
    alphaThreshold: numberArg(rawOptions.alphaThreshold ?? rawOptions["alpha-threshold"], DEFAULTS.alphaThreshold, 0, 255),
    backgroundTolerance: numberArg(rawOptions.backgroundTolerance ?? rawOptions["background-tolerance"], DEFAULTS.backgroundTolerance, 0, 220),
    dropBackground: boolArg(rawOptions.dropBackground ?? rawOptions["drop-background"], DEFAULTS.dropBackground),
    minArea: numberArg(rawOptions.minArea ?? rawOptions["min-area"], DEFAULTS.minArea, 1, 20000),
    simplify: numberArg(rawOptions.simplify, DEFAULTS.simplify, 0, 20),
    maxComponents: numberArg(rawOptions.maxComponents ?? rawOptions["max-components"], DEFAULTS.maxComponents, 1, 5000),
  };

  const image = readScaledPng(input, options.maxSize);
  const background = options.dropBackground ? detectBackground(image, options) : null;
  const samples = collectSamples(image, options, background);
  if (!samples.length) throw new Error("No traceable pixels found. Check alpha/background options.");
  const centers = kmeans(samples, options.colors);
  const assignment = assignPixels(image, centers, options, background);
  const components = connectedComponents(assignment, image.width, image.height, options);

  const paths = [];
  for (const component of components) {
    const loops = traceComponent(component, image.width, image.height, options);
    const d = pathFromLoops(loops);
    if (!d) continue;
    paths.push({
      d,
      fill: rgbToHex(centers[component.color]),
      area: component.area,
      bounds: component.bounds,
    });
  }

  const body = paths.map((path, index) =>
    `<path data-region="${index}" data-area="${path.area}" data-bounds="${path.bounds.join(",")}" d="${path.d}" fill="${path.fill}" fill-rule="evenodd"/>`,
  ).join("\n  ");

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${image.width} ${image.height}" width="${image.width}" height="${image.height}" preserveAspectRatio="xMidYMid meet">
  <metadata>${escapeXml(JSON.stringify({
    tool: "avatar-foundry/vectorize-png",
    source: input,
    sourceWidth: image.sourceWidth,
    sourceHeight: image.sourceHeight,
    width: image.width,
    height: image.height,
    colors: centers.map(rgbToHex),
    components: paths.length,
    options,
  }))}</metadata>
  ${body}
</svg>
`;

  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, svg);
  return {
    input,
    out,
    width: image.width,
    height: image.height,
    colors: centers.map(rgbToHex),
    components: paths.length,
  };
}

async function main() {
  const args = parseArgv(process.argv.slice(2));
  if (!args.input || !args.out || args.help) {
    usage();
    process.exit(args.help ? 0 : 1);
  }
  const result = vectorizePng(resolve(args.input), resolve(args.out), args);
  console.log(JSON.stringify(result, null, 2));
}

const current = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === current) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
}
