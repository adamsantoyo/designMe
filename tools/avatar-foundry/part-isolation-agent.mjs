#!/usr/bin/env node
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { PNG } from "pngjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const defaultRunsDir = join(root, "tools/avatar-foundry/runs");

const CANVAS = {
  width: 887,
  height: 1774,
  background: "#00ff00",
};

const STATUS = {
  promptReady: "prompt_ready",
  rawRecorded: "raw_recorded",
  transparentProcessed: "transparent_processed",
  fitApplied: "fit_applied",
  restackPass: "restack_pass",
  rejectedRegistration: "rejected_registration",
  acceptedPng: "accepted_png",
  acceptedSvgCandidate: "accepted_svg_candidate",
};

const STATUS_MIGRATION = {
  "prompt-ready": STATUS.promptReady,
  "generated-raw": STATUS.rawRecorded,
  "processed-transparent": STATUS.transparentProcessed,
  "fit-applied": STATUS.fitApplied,
  "restack-pass": STATUS.restackPass,
  "rejected-registration": STATUS.rejectedRegistration,
};

const PARTS = [
  {
    id: "hair",
    label: "Hair",
    z: 60,
    output: "parts/hair.png",
    targetBounds: { x: 224, y: 94, width: 438, height: 560 },
    registration: { fitMode: "width", anchor: "top-center", minScale: 0.2, maxScale: 1.25, tolerancePx: 48, toleranceRatio: 0.32 },
    chroma: { aggressiveGreen: true },
    instruction: "all loose wavy hair, including front locks, side volume, flyaways, and hairline shadows; no face, skin, clothing, bag, or background",
  },
  {
    id: "head_face",
    label: "Head And Face",
    z: 50,
    output: "parts/head_face.png",
    targetBounds: { x: 318, y: 160, width: 252, height: 330 },
    registration: { fitMode: "height", anchor: "top-center", minScale: 0.25, maxScale: 1.45, tolerancePx: 34, toleranceRatio: 0.22 },
    chroma: { aggressiveGreen: true },
    instruction: "face, ears, neck, facial features, brows, eyes, nose, lips, subtle blush, and visible skin of the head/neck only; no hair, hoodie, hands, jeans, shoes, bag, or background",
  },
  {
    id: "hands",
    label: "Hands",
    z: 55,
    output: "parts/hands.png",
    targetBounds: { x: 216, y: 884, width: 456, height: 152 },
    registration: { fitMode: "width", anchor: "center", minScale: 0.2, maxScale: 1.5, tolerancePx: 36, toleranceRatio: 0.28 },
    chroma: { aggressiveGreen: true },
    instruction: "both hands and visible wrists only, with the same pose and skin tone; no sleeves, hoodie, jeans, bag, shoes, head, hair, or background",
  },
  {
    id: "hoodie",
    label: "Hoodie",
    z: 40,
    output: "parts/hoodie.png",
    targetBounds: { x: 156, y: 348, width: 574, height: 636 },
    registration: { fitMode: "width", anchor: "top-center", minScale: 0.2, maxScale: 1.35, tolerancePx: 48, toleranceRatio: 0.24 },
    chroma: { key: "#ff00ff", aggressiveGreen: true },
    instruction: "the oversized sage hoodie only, including hood, sleeves, cuffs, pocket, drawstrings, folds, seams, and shading; no hair, skin, bag, jeans, shoes, or background",
  },
  {
    id: "jeans",
    label: "Jeans",
    z: 30,
    output: "parts/jeans.png",
    targetBounds: { x: 254, y: 942, width: 382, height: 668 },
    registration: { fitMode: "height", anchor: "top-center", minScale: 0.2, maxScale: 1.45, tolerancePx: 42, toleranceRatio: 0.24 },
    chroma: { aggressiveGreen: true },
    instruction: "the barrel/wide-leg blue jeans only, including waistband overlap, seams, cuffs, denim texture, folds, and shading; no hoodie, skin, shoes, bag, hair, or background",
  },
  {
    id: "shoes",
    label: "Shoes",
    z: 35,
    output: "parts/shoes.png",
    targetBounds: { x: 268, y: 1550, width: 354, height: 142 },
    registration: { fitMode: "width", anchor: "bottom-center", minScale: 0.25, maxScale: 1.5, tolerancePx: 30, toleranceRatio: 0.26 },
    chroma: { aggressiveGreen: true },
    instruction: "both cream classic sneakers only, including laces, soles, shadows on the shoes, and shoe contours; no jeans, body, ground shadow, or background",
  },
  {
    id: "bag_aac",
    label: "AAC Bag",
    z: 70,
    output: "parts/bag_aac.png",
    targetBounds: { x: 376, y: 402, width: 248, height: 548 },
    registration: { fitMode: "height", anchor: "top-center", minScale: 0.2, maxScale: 1.45, tolerancePx: 42, toleranceRatio: 0.28 },
    chroma: { aggressiveGreen: true },
    instruction: "the crossbody AAC/tablet bag and strap only, including hardware, case, zipper, strap, and natural shadows on the bag; no hoodie, hair, skin, jeans, or background",
  },
  {
    id: "ground_shadow",
    label: "Ground Shadow",
    z: 5,
    output: "parts/ground_shadow.png",
    targetBounds: { x: 210, y: 1608, width: 468, height: 72 },
    registration: { fitMode: "width", anchor: "center", minScale: 0.2, maxScale: 1.55, tolerancePx: 36, toleranceRatio: 0.34 },
    chroma: { aggressiveGreen: true },
    instruction: "only the soft oval ground shadow below the shoes; no shoes, body, clothing, or background",
  },
];

function parseArgv(argv) {
  const out = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (!token.startsWith("--")) {
      out._.push(token);
      continue;
    }
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

function usage(exitCode = 0) {
  console.log(`
Part Isolation Agent

Commands:
  init          --target <hero.png> [--out-dir <dir>]
  prompt        --run-dir <dir> --part <part-id>
  prompts       --run-dir <dir>
  record        --run-dir <dir> --part <part-id> --image <generated.png>
  process       --run-dir <dir> --part <part-id>
  assess        --run-dir <dir> --part <part-id>
  fit           --run-dir <dir> --part <part-id> [--fit-mode width|height|contain|cover|stretch]
  restack       --run-dir <dir>
  contact-sheet --run-dir <dir> [--out <path>]
  accept        --run-dir <dir> --part <part-id> [--note <text>]
  reject        --run-dir <dir> --part <part-id> [--note <text>]
  vectorize     --run-dir <dir> --part <part-id> [--allow-unaccepted]
  status        --run-dir <dir>

Part ids:
  ${PARTS.map((p) => p.id).join(", ")}
`);
  process.exit(exitCode);
}

function readJson(path) {
  return JSON.parse(readFileSync(path, "utf8"));
}

function writeJson(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, `${JSON.stringify(value, null, 2)}\n`);
}

function writeText(path, value) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, value);
}

function readPng(path) {
  return PNG.sync.read(readFileSync(path));
}

function writePng(path, png) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, PNG.sync.write(png));
}

function normalizeCanvasPng(path, width = CANVAS.width, height = CANVAS.height, edgeClear = 2) {
  const source = readPng(path);
  const normalized = new PNG({ width, height });
  const offsetX = Math.round((width - source.width) / 2);
  const offsetY = Math.round((height - source.height) / 2);
  for (let y = 0; y < source.height; y += 1) {
    const dy = y + offsetY;
    if (dy < 0 || dy >= height) continue;
    for (let x = 0; x < source.width; x += 1) {
      const dx = x + offsetX;
      if (dx < 0 || dx >= width) continue;
      const src = (y * source.width + x) * 4;
      const dst = (dy * width + dx) * 4;
      normalized.data[dst] = source.data[src];
      normalized.data[dst + 1] = source.data[src + 1];
      normalized.data[dst + 2] = source.data[src + 2];
      normalized.data[dst + 3] = source.data[src + 3];
    }
  }
  if (edgeClear > 0) {
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < width; x += 1) {
        if (x >= edgeClear && y >= edgeClear && x < width - edgeClear && y < height - edgeClear) continue;
        normalized.data[(y * width + x) * 4 + 3] = 0;
      }
    }
  }
  writePng(path, normalized);
  return { width, height, sourceWidth: source.width, sourceHeight: source.height, offsetX, offsetY, edgeClear };
}

function copyFileEnsured(source, dest) {
  mkdirSync(dirname(dest), { recursive: true });
  copyFileSync(source, dest);
}

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");
}

function partById(id) {
  const part = PARTS.find((p) => p.id === id);
  if (!part) throw new Error(`Unknown part "${id}". Valid parts: ${PARTS.map((p) => p.id).join(", ")}`);
  return part;
}

function keyForPart(part) {
  return part.chroma?.key || CANVAS.background;
}

function manifestPath(runDir) {
  return join(runDir, "isolation-manifest.json");
}

function normalizeEntry(entry) {
  const spec = partById(entry.id);
  const normalized = {
    ...spec,
    ...entry,
    z: spec.z,
    output: spec.output,
    instruction: spec.instruction,
    targetBounds: spec.targetBounds,
    registration: spec.registration,
    chroma: spec.chroma,
    status: STATUS_MIGRATION[entry.status] || entry.status || STATUS.promptReady,
    promptFile: entry.promptFile || `prompts/${spec.id}.md`,
  };
  if (!normalized.rawImage && entry.generated) normalized.rawImage = entry.generated;
  if (!normalized.transparentImage && entry.processed) normalized.transparentImage = entry.processed;
  if (!normalized.fittedImage && entry.fitted) normalized.fittedImage = entry.fitted;
  delete normalized.generated;
  delete normalized.processed;
  delete normalized.fitted;
  return normalized;
}

function loadRun(runDir) {
  const path = manifestPath(runDir);
  if (!existsSync(path)) throw new Error(`No isolation-manifest.json found in ${runDir}. Run init first.`);
  const manifest = readJson(path);
  const byId = new Map((manifest.parts || []).map((part) => [part.id, part]));
  manifest.canvas = manifest.canvas || CANVAS;
  manifest.parts = PARTS.map((spec) => normalizeEntry(byId.get(spec.id) || {
    id: spec.id,
    status: STATUS.promptReady,
    promptFile: `prompts/${spec.id}.md`,
  }));
  return manifest;
}

function saveRun(runDir, manifest) {
  writeJson(manifestPath(runDir), manifest);
}

function entryForPart(manifest, partId) {
  const entry = manifest.parts.find((p) => p.id === partId);
  if (!entry) throw new Error(`No manifest entry for ${partId}`);
  return entry;
}

function relFrom(runDir, path) {
  return relative(runDir, path).replaceAll("\\", "/");
}

function promptForPart(manifest, part) {
  const key = keyForPart(part);
  return `Use case: precise-object-edit
Asset type: aligned transparent source part for an avatar compositor
Primary request: Using the provided target avatar image as the exact visual reference, create ONLY the ${part.label} layer as a separate image.

Reference target:
- Use the target avatar at ${manifest.target.file} as the style, pose, proportions, palette, lighting, line quality, and exact placement reference.
- Preserve the same ${CANVAS.width}x${CANVAS.height} canvas, same camera/framing, same scale, and same registration.
- The intended placement box for this part is approximately x=${part.targetBounds.x}, y=${part.targetBounds.y}, width=${part.targetBounds.width}, height=${part.targetBounds.height}. Do not crop to this box; keep the full canvas.

Part to isolate:
- ${part.instruction}.

Canvas and background:
- Output must be a full-canvas ${CANVAS.width}x${CANVAS.height} PNG.
- Put the isolated part in the exact same position it occupies in the reference target.
- Use a perfectly flat solid ${key} chroma-key background everywhere outside the isolated part.
- The background must have no gradients, shadows, texture, floor plane, or lighting variation.
- Do not use ${key} anywhere inside the part.

Style:
- Match the reference target exactly: premium contemporary 2D avatar illustration, warm, calm, stylish, soft linework, subtle texture, editorial paper-doll quality.
- Preserve all important internal detail for this part.

Avoid:
- Do not include any other body/clothing/accessory layer.
- Do not crop to the part; keep the full original canvas.
- Do not add labels, UI, text, watermark, white background, off-white background, or checkerboard background.
- Do not change pose, scale, palette, lighting, or style.`;
}

function init(args) {
  if (!args.target) throw new Error("init requires --target <hero.png>");
  const target = resolve(args.target);
  if (!existsSync(target)) throw new Error(`Target not found: ${target}`);
  const runDir = resolve(args["out-dir"] || join(defaultRunsDir, `part-isolation-${timestamp()}`));
  mkdirSync(runDir, { recursive: true });
  copyFileEnsured(target, join(runDir, "target.png"));
  const manifest = {
    tool: "avatar-foundry/part-isolation-agent",
    schema: "part-isolation-run-v2",
    createdAt: new Date().toISOString(),
    canvas: CANVAS,
    target: {
      source: target,
      file: "target.png",
    },
    parts: PARTS.map((part) => ({
      ...part,
      status: STATUS.promptReady,
      promptFile: `prompts/${part.id}.md`,
      rawImage: null,
      transparentImage: null,
      fittedImage: null,
    })),
  };
  saveRun(runDir, manifest);
  for (const part of manifest.parts) {
    writeText(join(runDir, part.promptFile), promptForPart(manifest, part));
  }
  writeText(join(runDir, "README.md"), runReadme(manifest));
  console.log(runDir);
}

function runReadme(manifest) {
  return `# Part Isolation Run

Target: ${manifest.target.file}

Workflow:
1. Open a prompt in \`prompts/*.md\`.
2. Use image generation/editing with \`target.png\` as the visual reference.
3. Save the generated full-canvas chroma-key PNG.
4. Register and review it:

\`\`\`sh
npm run foundry -- isolate-agent record --run-dir <this-run-dir> --part <part-id> --image <generated.png>
npm run foundry -- isolate-agent process --run-dir <this-run-dir> --part <part-id>
npm run foundry -- isolate-agent assess --run-dir <this-run-dir> --part <part-id>
npm run foundry -- isolate-agent fit --run-dir <this-run-dir> --part <part-id>
npm run foundry -- isolate-agent restack --run-dir <this-run-dir>
npm run foundry -- isolate-agent contact-sheet --run-dir <this-run-dir>
\`\`\`

Parts:
${manifest.parts.map((part) => `- ${part.id}: ${part.label}`).join("\n")}
`;
}

function printPrompt(args) {
  if (!args["run-dir"] || !args.part) throw new Error("prompt requires --run-dir <dir> --part <part-id>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  const part = partById(args.part);
  const prompt = promptForPart(manifest, part);
  writeText(join(runDir, "prompts", `${part.id}.md`), prompt);
  console.log(prompt);
}

function writePrompts(args) {
  if (!args["run-dir"]) throw new Error("prompts requires --run-dir <dir>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  for (const part of manifest.parts) {
    writeText(join(runDir, part.promptFile), promptForPart(manifest, part));
  }
  saveRun(runDir, manifest);
  console.log(join(runDir, "prompts"));
}

function record(args) {
  if (!args["run-dir"] || !args.part || !args.image) throw new Error("record requires --run-dir <dir> --part <part-id> --image <generated.png>");
  const runDir = resolve(args["run-dir"]);
  const image = resolve(args.image);
  if (!existsSync(image)) throw new Error(`Image not found: ${image}`);
  const manifest = loadRun(runDir);
  const part = partById(args.part);
  const ext = extname(image) || ".png";
  const dest = join(runDir, "raw", `${part.id}${ext}`);
  copyFileEnsured(image, dest);
  const entry = entryForPart(manifest, part.id);
  entry.status = STATUS.rawRecorded;
  entry.rawImage = {
    source: image,
    file: `raw/${basename(dest)}`,
    recordedAt: new Date().toISOString(),
  };
  entry.transparentImage = null;
  entry.fittedImage = null;
  entry.assessment = null;
  entry.fitTransform = null;
  saveRun(runDir, manifest);
  console.log(JSON.stringify(entry, null, 2));
}

async function processPart(args) {
  if (!args["run-dir"] || !args.part) throw new Error("process requires --run-dir <dir> --part <part-id>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  const part = partById(args.part);
  const entry = entryForPart(manifest, part.id);
  if (!entry?.rawImage?.file) throw new Error(`No raw generated file recorded for ${part.id}.`);
  const { keyChroma } = await import("./key-chroma.mjs");
  const input = join(runDir, entry.rawImage.file);
  const output = join(runDir, part.output);
  const key = keyForPart(part);
  const result = keyChroma(input, output, {
    key,
    transparent: 42,
    opaque: 128,
    "green-dominance": part.chroma?.aggressiveGreen !== false,
  });
  const normalized = normalizeCanvasPng(output);
  entry.status = STATUS.transparentProcessed;
  entry.transparentImage = {
    file: part.output,
    processedAt: new Date().toISOString(),
    key,
    sourceWidth: result.width,
    sourceHeight: result.height,
    width: normalized.width,
    height: normalized.height,
    normalized,
  };
  entry.fittedImage = null;
  entry.fitTransform = null;
  entry.assessment = assessEntry(runDir, entry);
  saveRun(runDir, manifest);
  console.log(JSON.stringify(entry, null, 2));
}

function boundsArea(bounds) {
  return bounds ? bounds.width * bounds.height : 0;
}

function boundsCenter(bounds) {
  return {
    x: bounds.x + bounds.width / 2,
    y: bounds.y + bounds.height / 2,
  };
}

function measureOpaqueBounds(png, alphaThreshold = 16) {
  let minX = png.width;
  let minY = png.height;
  let maxX = -1;
  let maxY = -1;
  let pixels = 0;
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (y * png.width + x) * 4;
      if (png.data[i + 3] <= alphaThreshold) continue;
      pixels += 1;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
    }
  }
  if (!pixels) return null;
  return { x: minX, y: minY, width: maxX - minX + 1, height: maxY - minY + 1, pixels };
}

function hexToRgb(hex) {
  const raw = String(hex || CANVAS.background).replace("#", "");
  const n = parseInt(raw.length === 6 ? raw : "00ff00", 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorDistanceToKey(r, g, b, key) {
  const dr = r - key[0];
  const dg = g - key[1];
  const db = b - key[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

function looksLikeKey(r, g, b, key) {
  if (colorDistanceToKey(r, g, b, key) <= 120) return true;
  const [kr, kg, kb] = key;
  if (kg > kr && kg > kb) {
    const dominance = g - Math.max(r, b);
    return g > 32 && dominance > 18 && g > r * 1.35 && g > b * 1.35 && colorDistanceToKey(r, g, b, key) <= 260;
  }
  if (kr > kg && kb > kg) {
    const dominance = Math.min(r, b) - g;
    return r > 90 && b > 90 && dominance > 24 && colorDistanceToKey(r, g, b, key) <= 260;
  }
  return false;
}

function analyzePng(path, keyHex = CANVAS.background) {
  const png = readPng(path);
  const key = hexToRgb(keyHex);
  const bounds = measureOpaqueBounds(png);
  let edgeOpaquePixels = 0;
  let greenOpaquePixels = 0;
  let opaquePixels = 0;
  let cornerAlpha = 0;
  let cornerSamples = 0;
  const sampleCorner = (x, y) => {
    const i = (y * png.width + x) * 4;
    cornerAlpha += png.data[i + 3];
    cornerSamples += 1;
  };
  for (let y = 0; y < png.height; y += 1) {
    for (let x = 0; x < png.width; x += 1) {
      const i = (y * png.width + x) * 4;
      const alpha = png.data[i + 3];
      if (alpha > 16) {
        opaquePixels += 1;
        if (x === 0 || y === 0 || x === png.width - 1 || y === png.height - 1) edgeOpaquePixels += 1;
        if (looksLikeKey(png.data[i], png.data[i + 1], png.data[i + 2], key)) greenOpaquePixels += 1;
      }
    }
  }
  for (let y = 0; y < Math.min(16, png.height); y += 1) {
    for (let x = 0; x < Math.min(16, png.width); x += 1) sampleCorner(x, y);
    for (let x = Math.max(0, png.width - 16); x < png.width; x += 1) sampleCorner(x, y);
  }
  for (let y = Math.max(0, png.height - 16); y < png.height; y += 1) {
    for (let x = 0; x < Math.min(16, png.width); x += 1) sampleCorner(x, y);
    for (let x = Math.max(0, png.width - 16); x < png.width; x += 1) sampleCorner(x, y);
  }
  return {
    file: path,
    width: png.width,
    height: png.height,
    canvasMatches: png.width === CANVAS.width && png.height === CANVAS.height,
    opaquePixels,
    opaqueBounds: bounds,
    edgeOpaquePixels,
    greenOpaquePixels,
    greenOpaqueRatio: opaquePixels ? Number((greenOpaquePixels / opaquePixels).toFixed(6)) : 0,
    averageCornerAlpha: cornerSamples ? Number((cornerAlpha / cornerSamples).toFixed(3)) : 0,
  };
}

function buildAssessment(stats, part) {
  const errors = [];
  const warnings = [];
  if (!stats.canvasMatches) errors.push(`Canvas is ${stats.width}x${stats.height}; expected ${CANVAS.width}x${CANVAS.height}.`);
  if (!stats.opaqueBounds) errors.push("No visible pixels after transparency processing.");
  if (stats.edgeOpaquePixels > 0) errors.push(`Opaque pixels touch the canvas edge (${stats.edgeOpaquePixels}); background removal likely failed.`);
  if (stats.greenOpaqueRatio > 0.025) errors.push(`Chroma-key residue is too high (${stats.greenOpaqueRatio}).`);
  else if (stats.greenOpaqueRatio > 0.004) warnings.push(`Small chroma-key residue remains (${stats.greenOpaqueRatio}).`);
  if (stats.averageCornerAlpha > 2) errors.push(`Transparent corners are not clean; average corner alpha is ${stats.averageCornerAlpha}.`);

  let registration = null;
  if (stats.opaqueBounds) {
    const source = stats.opaqueBounds;
    const target = part.targetBounds;
    const sourceCenter = boundsCenter(source);
    const targetCenter = boundsCenter(target);
    registration = {
      targetBounds: target,
      measuredBounds: source,
      centerDelta: {
        x: Number((sourceCenter.x - targetCenter.x).toFixed(2)),
        y: Number((sourceCenter.y - targetCenter.y).toFixed(2)),
      },
      widthRatio: Number((source.width / target.width).toFixed(4)),
      heightRatio: Number((source.height / target.height).toFixed(4)),
      areaRatio: Number((boundsArea(source) / boundsArea(target)).toFixed(4)),
    };
    const centerDistance = Math.hypot(registration.centerDelta.x, registration.centerDelta.y);
    if (centerDistance > part.registration.tolerancePx) warnings.push(`Part center is ${Math.round(centerDistance)}px from target; deterministic fitting is needed.`);
  }
  return {
    assessedAt: new Date().toISOString(),
    ok: errors.length === 0,
    errors,
    warnings,
    stats,
    registration,
  };
}

function assessEntry(runDir, entry) {
  const part = partById(entry.id);
  const file = entry.transparentImage?.file || entry.rawImage?.file;
  if (!file) throw new Error(`No image available for ${part.id}. Run record/process first.`);
  const stats = analyzePng(join(runDir, file), keyForPart(part));
  return buildAssessment(stats, part);
}

function assess(args) {
  if (!args["run-dir"] || !args.part) throw new Error("assess requires --run-dir <dir> --part <part-id>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  const part = partById(args.part);
  const entry = entryForPart(manifest, part.id);
  const assessment = assessEntry(runDir, entry);
  entry.assessment = assessment;
  saveRun(runDir, manifest);
  console.log(JSON.stringify(assessment, null, 2));
}

function computeScales(sourceBounds, targetBounds, fitMode) {
  const widthScale = targetBounds.width / sourceBounds.width;
  const heightScale = targetBounds.height / sourceBounds.height;
  if (fitMode === "stretch") return { x: widthScale, y: heightScale };
  if (fitMode === "width") return { x: widthScale, y: widthScale };
  if (fitMode === "height") return { x: heightScale, y: heightScale };
  const scale = fitMode === "cover" ? Math.max(widthScale, heightScale) : Math.min(widthScale, heightScale);
  return { x: scale, y: scale };
}

function computePlacement(sourceBounds, targetBounds, scales, anchor) {
  const scaledWidth = sourceBounds.width * scales.x;
  const scaledHeight = sourceBounds.height * scales.y;
  const targetCenter = boundsCenter(targetBounds);
  let x = targetCenter.x - scaledWidth / 2;
  let y = targetCenter.y - scaledHeight / 2;
  if (anchor === "top-center") y = targetBounds.y;
  if (anchor === "bottom-center") y = targetBounds.y + targetBounds.height - scaledHeight;
  if (anchor === "top-left") {
    x = targetBounds.x;
    y = targetBounds.y;
  }
  return { x, y, width: scaledWidth, height: scaledHeight };
}

function sampleBilinear(png, x, y) {
  if (x < 0 || y < 0 || x > png.width - 1 || y > png.height - 1) return [0, 0, 0, 0];
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const x1 = Math.min(png.width - 1, x0 + 1);
  const y1 = Math.min(png.height - 1, y0 + 1);
  const fx = x - x0;
  const fy = y - y0;
  const out = [0, 0, 0, 0];
  let alphaWeight = 0;
  const add = (px, py, weight) => {
    const i = (py * png.width + px) * 4;
    const alpha = png.data[i + 3] / 255;
    const weightedAlpha = weight * alpha;
    out[0] += png.data[i] * weightedAlpha;
    out[1] += png.data[i + 1] * weightedAlpha;
    out[2] += png.data[i + 2] * weightedAlpha;
    out[3] += png.data[i + 3] * weight;
    alphaWeight += weightedAlpha;
  };
  add(x0, y0, (1 - fx) * (1 - fy));
  add(x1, y0, fx * (1 - fy));
  add(x0, y1, (1 - fx) * fy);
  add(x1, y1, fx * fy);
  if (alphaWeight > 0) {
    out[0] /= alphaWeight;
    out[1] /= alphaWeight;
    out[2] /= alphaWeight;
  }
  return out.map((n) => Math.round(n));
}

function sourceOver(dest, index, rgba, alphaScale = 1) {
  const srcA = Math.max(0, Math.min(255, rgba[3] * alphaScale)) / 255;
  if (srcA <= 0) return;
  const dstA = dest.data[index + 3] / 255;
  const outA = srcA + dstA * (1 - srcA);
  dest.data[index] = Math.round((rgba[0] * srcA + dest.data[index] * dstA * (1 - srcA)) / outA);
  dest.data[index + 1] = Math.round((rgba[1] * srcA + dest.data[index + 1] * dstA * (1 - srcA)) / outA);
  dest.data[index + 2] = Math.round((rgba[2] * srcA + dest.data[index + 2] * dstA * (1 - srcA)) / outA);
  dest.data[index + 3] = Math.round(outA * 255);
}

function fitImageToCanvas(source, sourceBounds, placement, scales) {
  const fitted = new PNG({ width: CANVAS.width, height: CANVAS.height });
  const minX = Math.max(0, Math.floor(placement.x) - 2);
  const minY = Math.max(0, Math.floor(placement.y) - 2);
  const maxX = Math.min(CANVAS.width - 1, Math.ceil(placement.x + placement.width) + 2);
  const maxY = Math.min(CANVAS.height - 1, Math.ceil(placement.y + placement.height) + 2);
  for (let y = minY; y <= maxY; y += 1) {
    for (let x = minX; x <= maxX; x += 1) {
      const sx = sourceBounds.x + (x + 0.5 - placement.x) / scales.x;
      const sy = sourceBounds.y + (y + 0.5 - placement.y) / scales.y;
      const rgba = sampleBilinear(source, sx, sy);
      if (rgba[3] <= 0) continue;
      sourceOver(fitted, (y * fitted.width + x) * 4, rgba);
    }
  }
  return fitted;
}

function cropPng(png, bounds, padding = 10) {
  const x = Math.max(0, bounds.x - padding);
  const y = Math.max(0, bounds.y - padding);
  const width = Math.min(png.width - x, bounds.width + padding * 2);
  const height = Math.min(png.height - y, bounds.height + padding * 2);
  const crop = new PNG({ width, height });
  for (let cy = 0; cy < height; cy += 1) {
    for (let cx = 0; cx < width; cx += 1) {
      const src = ((y + cy) * png.width + x + cx) * 4;
      const dst = (cy * width + cx) * 4;
      crop.data[dst] = png.data[src];
      crop.data[dst + 1] = png.data[src + 1];
      crop.data[dst + 2] = png.data[src + 2];
      crop.data[dst + 3] = png.data[src + 3];
    }
  }
  return { png: crop, bounds: { x, y, width, height } };
}

function fit(args) {
  if (!args["run-dir"] || !args.part) throw new Error("fit requires --run-dir <dir> --part <part-id>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  const part = partById(args.part);
  const entry = entryForPart(manifest, part.id);
  if (!entry.transparentImage?.file) throw new Error(`No transparent image for ${part.id}. Run process first.`);
  const assessment = assessEntry(runDir, entry);
  entry.assessment = assessment;
  if (!assessment.ok) {
    entry.status = STATUS.rejectedRegistration;
    saveRun(runDir, manifest);
    throw new Error(`Cannot fit ${part.id}; assessment failed:\n${assessment.errors.map((e) => `- ${e}`).join("\n")}`);
  }
  const source = readPng(join(runDir, entry.transparentImage.file));
  const sourceBounds = assessment.stats.opaqueBounds;
  const targetBounds = part.targetBounds;
  const fitMode = args["fit-mode"] || part.registration.fitMode;
  const scales = computeScales(sourceBounds, targetBounds, fitMode);
  const minScale = Math.min(scales.x, scales.y);
  const maxScale = Math.max(scales.x, scales.y);
  if (minScale < part.registration.minScale || maxScale > part.registration.maxScale) {
    entry.status = STATUS.rejectedRegistration;
    entry.fitTransform = { rejectedAt: new Date().toISOString(), reason: `scale ${minScale.toFixed(4)}..${maxScale.toFixed(4)} outside ${part.registration.minScale}-${part.registration.maxScale}` };
    saveRun(runDir, manifest);
    throw new Error(`Cannot fit ${part.id}; scale ${minScale.toFixed(4)}..${maxScale.toFixed(4)} is outside allowed range.`);
  }
  const placement = computePlacement(sourceBounds, targetBounds, scales, part.registration.anchor);
  const fitted = fitImageToCanvas(source, sourceBounds, placement, scales);
  const fittedBounds = measureOpaqueBounds(fitted);
  if (!fittedBounds) throw new Error(`Fitted ${part.id} produced no visible pixels.`);
  const fittedPath = join(runDir, "fitted", `${part.id}.png`);
  const crop = cropPng(fitted, fittedBounds);
  const cropPath = join(runDir, "crops", `${part.id}.png`);
  writePng(fittedPath, fitted);
  writePng(cropPath, crop.png);
  const transform = {
    mode: fitMode,
    anchor: part.registration.anchor,
    scale: Number(((scales.x + scales.y) / 2).toFixed(6)),
    scaleX: Number(scales.x.toFixed(6)),
    scaleY: Number(scales.y.toFixed(6)),
    sourceBounds,
    targetBounds,
    placement: {
      x: Number(placement.x.toFixed(3)),
      y: Number(placement.y.toFixed(3)),
      width: Number(placement.width.toFixed(3)),
      height: Number(placement.height.toFixed(3)),
    },
    fittedBounds,
    cropBounds: crop.bounds,
  };
  entry.status = STATUS.fitApplied;
  entry.fitTransform = transform;
  entry.fittedImage = {
    file: relFrom(runDir, fittedPath),
    cropFile: relFrom(runDir, cropPath),
    fittedAt: new Date().toISOString(),
    width: CANVAS.width,
    height: CANVAS.height,
    transform,
  };
  saveRun(runDir, manifest);
  console.log(JSON.stringify(entry.fittedImage, null, 2));
}

function composeParts(runDir, manifest, includeUnaccepted = true) {
  const stack = new PNG({ width: CANVAS.width, height: CANVAS.height });
  const included = manifest.parts
    .filter((part) => part.fittedImage?.file)
    .filter((part) => part.status !== STATUS.rejectedRegistration)
    .filter((part) => includeUnaccepted || [STATUS.acceptedPng, STATUS.acceptedSvgCandidate].includes(part.status))
    .sort((a, b) => a.z - b.z);
  for (const part of included) {
    const layer = readPng(join(runDir, part.fittedImage.file));
    if (layer.width !== CANVAS.width || layer.height !== CANVAS.height) {
      throw new Error(`${part.id} fitted image is ${layer.width}x${layer.height}; expected ${CANVAS.width}x${CANVAS.height}.`);
    }
    for (let i = 0; i < layer.data.length; i += 4) {
      if (layer.data[i + 3] <= 0) continue;
      sourceOver(stack, i, [layer.data[i], layer.data[i + 1], layer.data[i + 2], layer.data[i + 3]]);
    }
  }
  return { stack, included };
}

function overlayOnTarget(runDir, stack) {
  const targetPath = join(runDir, "target.png");
  if (!existsSync(targetPath)) return null;
  const target = readPng(targetPath);
  const out = new PNG({ width: target.width, height: target.height });
  out.data.set(target.data);
  const width = Math.min(target.width, stack.width);
  const height = Math.min(target.height, stack.height);
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const i = (y * stack.width + x) * 4;
      if (stack.data[i + 3] <= 0) continue;
      const dst = (y * out.width + x) * 4;
      sourceOver(out, dst, [stack.data[i], stack.data[i + 1], stack.data[i + 2], stack.data[i + 3]], 0.82);
    }
  }
  return out;
}

function restack(args) {
  if (!args["run-dir"]) throw new Error("restack requires --run-dir <dir>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  const { stack, included } = composeParts(runDir, manifest, args.accepted === true ? false : true);
  if (!included.length) throw new Error("No fitted parts available to restack.");
  const stackPath = join(runDir, "restack", "stack.png");
  writePng(stackPath, stack);
  const overlay = overlayOnTarget(runDir, stack);
  const overlayPath = join(runDir, "restack", "overlay.png");
  if (overlay) writePng(overlayPath, overlay);
  for (const part of included) {
    if (part.status === STATUS.fitApplied) part.status = STATUS.restackPass;
  }
  manifest.restack = {
    file: relFrom(runDir, stackPath),
    overlayFile: overlay ? relFrom(runDir, overlayPath) : null,
    includedParts: included.map((part) => part.id),
    opaqueBounds: measureOpaqueBounds(stack),
    restackedAt: new Date().toISOString(),
  };
  saveRun(runDir, manifest);
  writeIsolationContactSheet(runDir, manifest, join(runDir, "restack", "contact-sheet.html"));
  console.log(JSON.stringify(manifest.restack, null, 2));
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (ch) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
  }[ch]));
}

function imgCell(runDir, label, file) {
  if (!file || !existsSync(join(runDir, file))) {
    return `<div class="cell missing"><strong>${escapeHtml(label)}</strong><span>missing</span></div>`;
  }
  return `<div class="cell"><strong>${escapeHtml(label)}</strong><img src="${escapeHtml(file)}" alt="${escapeHtml(label)}"></div>`;
}

function writeIsolationContactSheet(runDir, manifest, outPath) {
  const restackCells = manifest.restack ? `
    <section class="restack">
      ${imgCell(runDir, "target", manifest.target.file)}
      ${imgCell(runDir, "stack", manifest.restack.file)}
      ${imgCell(runDir, "overlay", manifest.restack.overlayFile)}
    </section>
  ` : "";
  const cards = manifest.parts.map((part) => {
    const assessment = part.assessment;
    const errors = assessment?.errors?.length ? assessment.errors.map((e) => `<li>${escapeHtml(e)}</li>`).join("") : "<li>none</li>";
    const warnings = assessment?.warnings?.length ? assessment.warnings.map((e) => `<li>${escapeHtml(e)}</li>`).join("") : "<li>none</li>";
    return `<article>
      <header>
        <h2>${escapeHtml(part.label)}</h2>
        <span>${escapeHtml(part.status)}</span>
      </header>
      <div class="grid">
        ${imgCell(runDir, "raw", part.rawImage?.file)}
        ${imgCell(runDir, "transparent", part.transparentImage?.file)}
        ${imgCell(runDir, "fitted", part.fittedImage?.file)}
        ${imgCell(runDir, "crop", part.fittedImage?.cropFile)}
        ${imgCell(runDir, "svg", part.vectorImage?.file)}
      </div>
      <dl>
        <dt>target</dt><dd>${part.targetBounds.x},${part.targetBounds.y},${part.targetBounds.width},${part.targetBounds.height}</dd>
        <dt>measured</dt><dd>${assessment?.stats?.opaqueBounds ? `${assessment.stats.opaqueBounds.x},${assessment.stats.opaqueBounds.y},${assessment.stats.opaqueBounds.width},${assessment.stats.opaqueBounds.height}` : "none"}</dd>
        <dt>green</dt><dd>${assessment?.stats?.greenOpaqueRatio ?? "n/a"}</dd>
      </dl>
      <details><summary>errors</summary><ul>${errors}</ul></details>
      <details><summary>warnings</summary><ul>${warnings}</ul></details>
    </article>`;
  }).join("\n");
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Avatar Part Isolation Contact Sheet</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; background: #efe7d9; color: #2f2823; }
    body::before { content: ""; position: fixed; inset: 0; pointer-events: none; background: radial-gradient(circle at 50% 18%, rgba(255,255,255,.72), transparent 44%); }
    main { position: relative; padding: 26px; display: grid; gap: 18px; }
    h1 { margin: 0; font: 700 30px Georgia, serif; }
    .meta { margin: 4px 0 10px; color: #756a60; font-weight: 650; }
    .restack, article { border: 1px solid #d8cbb9; border-radius: 8px; background: #fffaf2; box-shadow: 0 12px 28px rgba(50,42,34,.10); }
    .restack { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; padding: 14px; }
    article { padding: 14px; }
    article header { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
    h2 { margin: 0; font-size: 18px; }
    header span { border-radius: 999px; background: #2f2823; color: #fffaf2; font-size: 12px; font-weight: 800; padding: 5px 9px; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 12px; }
    .cell { min-height: 260px; display: grid; grid-template-rows: auto 1fr; gap: 8px; padding: 10px; border: 1px solid #e4d8c8; border-radius: 8px;
      background-color: #fff;
      background-image: linear-gradient(45deg, #efe7d9 25%, transparent 25%), linear-gradient(-45deg, #efe7d9 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #efe7d9 75%), linear-gradient(-45deg, transparent 75%, #efe7d9 75%);
      background-size: 24px 24px; background-position: 0 0, 0 12px, 12px -12px, -12px 0; }
    .cell strong { font-size: 12px; text-transform: uppercase; letter-spacing: .05em; color: #665b51; }
    .cell img { width: 100%; height: 320px; object-fit: contain; align-self: center; justify-self: center; }
    .missing { place-content: center; text-align: center; color: #8b7a6b; background: #f5ecdf; }
    dl { display: grid; grid-template-columns: max-content 1fr; gap: 4px 12px; font-size: 13px; color: #6d6258; }
    dt { font-weight: 800; }
    details { margin-top: 6px; color: #6d6258; font-size: 13px; }
  </style>
</head>
<body>
  <main>
    <header>
      <h1>Avatar Part Isolation</h1>
      <div class="meta">${escapeHtml(runDir)}</div>
    </header>
    ${restackCells}
    ${cards}
  </main>
</body>
</html>`;
  writeText(outPath, html);
  return outPath;
}

function contactSheet(args) {
  if (!args["run-dir"]) throw new Error("contact-sheet requires --run-dir <dir>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  const out = resolve(args.out || join(runDir, "contact-sheet.html"));
  writeIsolationContactSheet(runDir, manifest, out);
  console.log(out);
}

function accept(args) {
  if (!args["run-dir"] || !args.part) throw new Error("accept requires --run-dir <dir> --part <part-id>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  const part = partById(args.part);
  const entry = entryForPart(manifest, part.id);
  if (!entry.fittedImage?.file) throw new Error(`Cannot accept ${part.id}; run fit first.`);
  entry.status = STATUS.acceptedPng;
  entry.acceptedAt = new Date().toISOString();
  if (args.note) entry.notes = [...(entry.notes || []), { at: entry.acceptedAt, type: "accept", text: String(args.note) }];
  saveRun(runDir, manifest);
  console.log(JSON.stringify(entry, null, 2));
}

function reject(args) {
  if (!args["run-dir"] || !args.part) throw new Error("reject requires --run-dir <dir> --part <part-id>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  const part = partById(args.part);
  const entry = entryForPart(manifest, part.id);
  entry.status = STATUS.rejectedRegistration;
  const at = new Date().toISOString();
  entry.rejectedAt = at;
  entry.notes = [...(entry.notes || []), { at, type: "reject", text: String(args.note || "human rejected") }];
  saveRun(runDir, manifest);
  console.log(JSON.stringify(entry, null, 2));
}

async function vectorize(args) {
  if (!args["run-dir"] || !args.part) throw new Error("vectorize requires --run-dir <dir> --part <part-id>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  const part = partById(args.part);
  const entry = entryForPart(manifest, part.id);
  if (!entry.fittedImage?.file) throw new Error(`Cannot vectorize ${part.id}; run fit first.`);
  if (entry.status !== STATUS.acceptedPng && args["allow-unaccepted"] !== true) {
    throw new Error(`Cannot vectorize ${part.id}; status is ${entry.status}. Run accept first or pass --allow-unaccepted for lab output.`);
  }
  const input = join(runDir, entry.fittedImage.cropFile || entry.fittedImage.file);
  const out = join(runDir, "vectors", `${part.id}.svg`);
  const { vectorizePng } = await import("./vectorize-png.mjs");
  const result = vectorizePng(input, out, {
    colors: args.colors || 22,
    "max-size": args["max-size"] || 720,
    "min-area": args["min-area"] || 18,
    simplify: args.simplify || 1,
    "drop-background": true,
  });
  const wasAccepted = entry.status === STATUS.acceptedPng;
  if (wasAccepted) entry.status = STATUS.acceptedSvgCandidate;
  entry.vectorImage = {
    file: relFrom(runDir, out),
    source: relFrom(runDir, input),
    vectorizedAt: new Date().toISOString(),
    approvalState: wasAccepted ? "accepted_svg_candidate" : "lab_unaccepted",
    components: result.components,
    colors: result.colors,
  };
  saveRun(runDir, manifest);
  console.log(JSON.stringify(entry.vectorImage, null, 2));
}

function status(args) {
  if (!args["run-dir"]) throw new Error("status requires --run-dir <dir>");
  const runDir = resolve(args["run-dir"]);
  const manifest = loadRun(runDir);
  saveRun(runDir, manifest);
  console.log(JSON.stringify({
    runDir,
    target: manifest.target.file,
    restack: manifest.restack || null,
    parts: manifest.parts.map((part) => ({
      id: part.id,
      status: part.status,
      promptFile: part.promptFile,
      raw: part.rawImage?.file || null,
      transparent: part.transparentImage?.file || null,
      fitted: part.fittedImage?.file || null,
      vector: part.vectorImage?.file || null,
      targetBounds: part.targetBounds,
      measuredBounds: part.assessment?.stats?.opaqueBounds || null,
      errors: part.assessment?.errors || [],
      warnings: part.assessment?.warnings || [],
    })),
  }, null, 2));
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help") usage(0);
  const args = parseArgv(rest);
  if (command === "init") return init(args);
  if (command === "prompt") return printPrompt(args);
  if (command === "prompts") return writePrompts(args);
  if (command === "record") return record(args);
  if (command === "process") return processPart(args);
  if (command === "assess") return assess(args);
  if (command === "fit") return fit(args);
  if (command === "restack") return restack(args);
  if (command === "contact-sheet") return contactSheet(args);
  if (command === "accept") return accept(args);
  if (command === "reject") return reject(args);
  if (command === "vectorize") return vectorize(args);
  if (command === "status") return status(args);
  usage(1);
}

const current = fileURLToPath(import.meta.url);
if (process.argv[1] && resolve(process.argv[1]) === current) {
  main().catch((error) => {
    console.error(error.stack || error.message || String(error));
    process.exit(1);
  });
}
