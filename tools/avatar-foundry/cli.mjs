#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { copyFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const runtime = require(resolve(root, "app/src/engine/dmFigureV2.runtime.js"));

const foundryDir = resolve(root, "tools/avatar-foundry");
const runsDir = join(foundryDir, "runs");
const heroPath = join(foundryDir, "fixtures/hero.genome.json");

const PALETTES = [
  { id: "sage-denim-cream", top: "#8aa382", bottom: "#5a6f8c", hair: "#3f2b1f", skin: "#a87c58" },
  { id: "pine-clay-denim", top: "#46604b", bottom: "#5a6f8c", hair: "#2e221b", skin: "#8a5a3f" },
  { id: "oat-cocoa-denim", top: "#e6dcc6", bottom: "#5e4334", hair: "#5a3b27", skin: "#bd8a5f" },
  { id: "rose-charcoal", top: "#d39aa3", bottom: "#3c3a38", hair: "#211c1a", skin: "#c99a6e" },
  { id: "sky-wide-denim", top: "#8aa7bd", bottom: "#5a6f8c", hair: "#9a958d", skin: "#6d4733" },
  { id: "rust-soft-blue", top: "#a8553a", bottom: "#5a6f8c", hair: "#c0673a", skin: "#d3b48f" },
];

const BODIES = ["balanced", "lean", "curves", "broad", "full"];
const HEIGHTS = ["shorter", "short", "medium", "tall", "taller"];
const ASSISTIVE = [undefined, undefined, undefined, "wheelchair"];

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
  const text = `
Avatar Foundry

Commands:
  render-one       --genome <path> --out <path> [--format svg|png] [--crop full|bust]
  isolate-agent    <init|prompt|prompts|record|process|assess|fit|restack|contact-sheet|accept|reject|vectorize|status> ...
  mutate-genome    --count 40 [--genome <path>] [--out-dir <dir>]
  cutout-avatar    --input <path> --out <path>
  extract-layers   --input <path> --out-dir <dir>
  vectorize-png    --input <path> --out <path> [--colors 18] [--max-size 720]
  vectorize-layers --run-dir <dir> [--colors 18] [--max-size 720]
  render-matrix    --count 24 [--genome <path>] [--out-dir <dir>] [--format svg|png]
  contact-sheet    --run-dir <dir> [--out <path>]
  critique-run     --run-dir <dir> [--out <path>]
  cluster-findings --run-dir <dir> [--out <path>]
  promote-variant  --run-dir <dir> --id <seed>
  check

Optional AI bridge:
  FOUNDRY_CRITIQUE_CMD="your-cli-command" node tools/avatar-foundry/cli.mjs critique-run --run-dir <dir>
  The command receives JSON on stdin and must return { "critiques": [...] }.
`;
  console.log(text.trim());
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

function sha(value) {
  return createHash("sha256").update(value).digest("hex");
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

function timestamp() {
  return new Date().toISOString().replace(/[-:]/g, "").replace(/\..+/, "Z");
}

function makeRunDir(prefix) {
  const dir = join(runsDir, `${prefix}-${timestamp()}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

function loadGenome(path = heroPath) {
  const genome = readJson(resolve(path));
  const valid = runtime.validateGenome(genome);
  if (!valid.ok) throw new Error(`Invalid genome ${path}:\n${valid.errors.map((e) => `- ${e}`).join("\n")}`);
  return runtime.normalizeGenome(genome);
}

function mutateGenome(base, index) {
  const palette = PALETTES[index % PALETTES.length];
  const body = BODIES[index % BODIES.length];
  const height = HEIGHTS[Math.floor(index / BODIES.length) % HEIGHTS.length];
  const assistive = ASSISTIVE[index % ASSISTIVE.length];
  const warmth = 0.78 + ((index * 17) % 18) / 100;
  const detail = 0.58 + ((index * 11) % 24) / 100;
  const volume = 0.72 + ((index * 7) % 32) / 100;
  return runtime.normalizeGenome({
    ...base,
    seed: `${base.seed}-v${String(index + 1).padStart(3, "0")}`,
    anatomy: {
      ...base.anatomy,
      body,
      height,
      proportions: {
        ...base.anatomy.proportions,
        shoulder: body === "broad" ? 1.08 : body === "lean" ? 0.95 : 1,
        hip: body === "curves" || body === "full" ? 1.1 : 1,
      },
    },
    identity: {
      ...base.identity,
      skin: palette.skin,
      eyeColor: index % 5 === 0 ? "#46604b" : base.identity.eyeColor,
    },
    hair: {
      ...base.hair,
      color: palette.hair,
      volume,
    },
    outfit: {
      ...base.outfit,
      palette: palette.id,
      topColor: palette.top,
      bottomColor: palette.bottom,
    },
    assistive: {
      ...(assistive ? { mobility: assistive } : {}),
      ...(index % 9 === 0 ? { aac: "tablet" } : {}),
      ...(index % 11 === 0 ? { hearing: "ci_both" } : {}),
      ...(index % 13 === 0 ? { glasses: "round" } : {}),
    },
    artDirection: {
      ...base.artDirection,
      editorialWarmth: Math.min(0.96, warmth),
      detailLevel: Math.min(0.88, detail),
    },
  });
}

function writeGenomeSet(genomes, outDir) {
  const genomeDir = join(outDir, "genomes");
  mkdirSync(genomeDir, { recursive: true });
  const items = [];
  for (const genome of genomes) {
    const file = `${genome.seed}.json`;
    writeJson(join(genomeDir, file), genome);
    items.push({
      id: genome.seed,
      genome: `genomes/${file}`,
      render: null,
      critique: null,
      hash: sha(runtime.stableStringify(genome)),
    });
  }
  writeJson(join(outDir, "manifest.json"), {
    createdAt: new Date().toISOString(),
    engine: "avatar-foundry",
    version: runtime.VERSION,
    items,
  });
  return items;
}

function readRunManifest(runDir) {
  const manifestPath = join(runDir, "manifest.json");
  if (!existsSync(manifestPath)) throw new Error(`No manifest.json found in ${runDir}`);
  return readJson(manifestPath);
}

function loadRunGenomes(runDir) {
  const manifest = readRunManifest(runDir);
  return manifest.items.map((item) => ({
    item,
    genome: readJson(join(runDir, item.genome)),
  }));
}

async function renderPng(svg, outPath, width = 720, height = 1470) {
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    await page.setContent(`<!doctype html>
      <html><head><meta charset="utf-8">
      <style>
        html,body{margin:0;width:100%;height:100%;background:transparent}
        #stage{width:${width}px;height:${height}px;background:transparent}
        svg{width:100%;height:100%;display:block}
      </style></head><body><div id="stage">${svg}</div></body></html>`);
    await page.locator("#stage").screenshot({ path: outPath, omitBackground: true });
  } finally {
    await browser.close();
  }
}

async function renderGenome(genome, outPath, format, crop = "full") {
  const svg = runtime.compileAvatar(genome, { crop });
  mkdirSync(dirname(outPath), { recursive: true });
  if (format === "png") {
    await renderPng(svg, outPath);
  } else {
    writeText(outPath, `${svg}\n`);
  }
  return {
    path: outPath,
    hash: sha(svg),
    elementCount: (svg.match(/<(path|circle|ellipse|rect|line|g)\b/g) || []).length,
  };
}

async function commandRenderOne(args) {
  const genome = loadGenome(args.genome || heroPath);
  const out = resolve(args.out || join(makeRunDir("one"), `avatar.${args.format || "svg"}`));
  const format = args.format || (out.endsWith(".png") ? "png" : "svg");
  const result = await renderGenome(genome, out, format, args.crop || "full");
  console.log(JSON.stringify(result, null, 2));
}

async function commandMutateGenome(args) {
  const base = loadGenome(args.genome || heroPath);
  const count = Number(args.count || 40);
  if (!Number.isInteger(count) || count < 1 || count > 240) throw new Error("--count must be 1..240");
  const outDir = resolve(args["out-dir"] || makeRunDir("mutations"));
  const genomes = Array.from({ length: count }, (_, i) => mutateGenome(base, i));
  writeGenomeSet(genomes, outDir);
  console.log(outDir);
}

async function commandRenderMatrix(args) {
  const base = loadGenome(args.genome || heroPath);
  const count = Number(args.count || 24);
  const format = args.format || "svg";
  if (!["svg", "png"].includes(format)) throw new Error("--format must be svg or png");
  const outDir = resolve(args["out-dir"] || makeRunDir("matrix"));
  const genomes = Array.from({ length: count }, (_, i) => mutateGenome(base, i));
  const items = writeGenomeSet(genomes, outDir);
  const renderDir = join(outDir, "renders");
  for (let i = 0; i < genomes.length; i += 1) {
    const ext = format === "png" ? "png" : "svg";
    const file = `renders/${genomes[i].seed}.${ext}`;
    const result = await renderGenome(genomes[i], join(outDir, file), format);
    items[i].render = file;
    items[i].renderHash = result.hash;
    items[i].elementCount = result.elementCount;
  }
  mkdirSync(renderDir, { recursive: true });
  writeJson(join(outDir, "manifest.json"), {
    createdAt: new Date().toISOString(),
    engine: "avatar-foundry",
    version: runtime.VERSION,
    items,
  });
  await writeContactSheet(outDir, join(outDir, "contact-sheet.html"));
  console.log(outDir);
}

async function writeContactSheet(runDir, outPath) {
  const manifest = readRunManifest(runDir);
  const cards = manifest.items.map((item) => {
    const genome = readJson(join(runDir, item.genome));
    let render = "";
    if (item.render && item.render.endsWith(".svg")) {
      render = readFileSync(join(runDir, item.render), "utf8");
    } else if (item.render) {
      render = `<img src="${escapeHtml(item.render)}" alt="${escapeHtml(item.id)}">`;
    } else {
      render = runtime.compileAvatar(genome);
    }
    return `<article class="card">
      <div class="avatar">${render}</div>
      <h2>${escapeHtml(item.id)}</h2>
      <p>${escapeHtml(genome.anatomy.body)} / ${escapeHtml(genome.anatomy.height)} / ${escapeHtml(genome.outfit.palette)}</p>
    </article>`;
  }).join("\n");
  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Avatar Foundry Contact Sheet</title>
  <style>
    :root { color-scheme: light; font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    body { margin: 0; background: #eee6d8; color: #2f2823; }
    header { padding: 28px 32px 10px; }
    h1 { margin: 0; font: 700 28px Georgia, serif; }
    .meta { margin-top: 6px; color: #6d6258; font-weight: 650; }
    main { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 18px; padding: 22px 32px 36px; }
    .card { min-height: 420px; border: 1px solid #ddd0bd; border-radius: 8px; background: linear-gradient(#fff, #f9f4eb); box-shadow: 0 12px 30px rgba(53,45,38,.12); overflow: hidden; }
    .avatar { height: 340px; display: grid; place-items: end center; padding: 12px 8px 0; }
    .avatar svg, .avatar img { width: 100%; height: 100%; object-fit: contain; }
    h2 { margin: 10px 14px 0; font-size: 13px; line-height: 1.3; }
    p { margin: 4px 14px 14px; color: #756a60; font-size: 12px; font-weight: 650; }
  </style>
</head>
<body>
  <header>
    <h1>Avatar Foundry Contact Sheet</h1>
    <div class="meta">${escapeHtml(manifest.items.length)} candidates - ${escapeHtml(manifest.createdAt || "")}</div>
  </header>
  <main>${cards}</main>
</body>
</html>`;
  writeText(outPath, html);
  return outPath;
}

async function commandContactSheet(args) {
  const runDir = resolve(args["run-dir"] || ".");
  const out = resolve(args.out || join(runDir, "contact-sheet.html"));
  await writeContactSheet(runDir, out);
  console.log(out);
}

function validateCritiques(value) {
  if (!value || !Array.isArray(value.critiques)) return ["Critique output must contain a critiques array."];
  const errors = [];
  value.critiques.forEach((critique, index) => {
    if (!critique || typeof critique !== "object") errors.push(`critique[${index}] must be an object.`);
    else {
      if (typeof critique.id !== "string") errors.push(`critique[${index}].id must be a string.`);
      if (typeof critique.overall !== "number") errors.push(`critique[${index}].overall must be a number.`);
      if (!critique.scores || typeof critique.scores !== "object") errors.push(`critique[${index}].scores must be an object.`);
      if (!Array.isArray(critique.findings)) errors.push(`critique[${index}].findings must be an array.`);
    }
  });
  return errors;
}

function externalCritique(runDir, payload) {
  const command = process.env.FOUNDRY_CRITIQUE_CMD;
  if (!command) return null;
  const result = spawnSync(command, {
    input: JSON.stringify(payload, null, 2),
    encoding: "utf8",
    shell: true,
    cwd: root,
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`FOUNDRY_CRITIQUE_CMD failed (${result.status}):\n${result.stderr || result.stdout}`);
  }
  const parsed = JSON.parse(result.stdout);
  const errors = validateCritiques(parsed);
  if (errors.length) throw new Error(`Invalid external critique output:\n${errors.join("\n")}`);
  writeText(join(runDir, "external-critic.raw.json"), result.stdout);
  return parsed.critiques;
}

async function commandCritiqueRun(args) {
  const runDir = resolve(args["run-dir"] || ".");
  const pairs = loadRunGenomes(runDir);
  const payload = {
    schema: "avatar-foundry-critique-v1",
    criteria: ["warmth", "dignity", "faceAppeal", "silhouette", "recognizability", "outfitQuality", "representation", "notScary"],
    genomes: pairs.map(({ item, genome }) => ({ id: item.id, genome, render: item.render })),
  };
  const critiques = externalCritique(runDir, payload) || pairs.map(({ genome }) => runtime.critiqueGenome(genome));
  const out = resolve(args.out || join(runDir, "critique.json"));
  const report = { createdAt: new Date().toISOString(), schema: payload.schema, critiques };
  const errors = validateCritiques(report);
  if (errors.length) throw new Error(errors.join("\n"));
  writeJson(out, report);
  console.log(out);
}

function buildClusters(critiques) {
  const clusters = new Map();
  for (const critique of critiques) {
    for (const finding of critique.findings || []) {
      const key = finding.code || "uncoded";
      if (!clusters.has(key)) clusters.set(key, { code: key, count: 0, maxSeverity: 0, examples: [] });
      const cluster = clusters.get(key);
      cluster.count += 1;
      cluster.maxSeverity = Math.max(cluster.maxSeverity, Number(finding.severity || 0));
      if (cluster.examples.length < 6) cluster.examples.push({ id: critique.id, message: finding.message });
    }
  }
  return [...clusters.values()].sort((a, b) => b.maxSeverity - a.maxSeverity || b.count - a.count || a.code.localeCompare(b.code));
}

async function commandClusterFindings(args) {
  const runDir = resolve(args["run-dir"] || ".");
  const critiquePath = join(runDir, "critique.json");
  if (!existsSync(critiquePath)) throw new Error(`No critique.json found in ${runDir}. Run critique-run first.`);
  const critique = readJson(critiquePath);
  const clusters = buildClusters(critique.critiques || []);
  writeJson(join(runDir, "clusters.json"), { createdAt: new Date().toISOString(), clusters });
  const lines = [
    "# Avatar Foundry Findings",
    "",
    `Candidates reviewed: ${(critique.critiques || []).length}`,
    `Clusters: ${clusters.length}`,
    "",
  ];
  if (!clusters.length) lines.push("No repeated findings. Candidates are ready for human review.");
  for (const cluster of clusters) {
    lines.push(`## ${cluster.code}`);
    lines.push(`Count: ${cluster.count} | Max severity: ${cluster.maxSeverity}`);
    for (const example of cluster.examples) lines.push(`- ${example.id}: ${example.message}`);
    lines.push("");
  }
  const out = resolve(args.out || join(runDir, "findings.md"));
  writeText(out, `${lines.join("\n")}\n`);
  console.log(out);
}

async function commandPromoteVariant(args) {
  const runDir = resolve(args["run-dir"] || ".");
  const id = args.id;
  if (!id) throw new Error("promote-variant requires --id <seed>");
  const manifest = readRunManifest(runDir);
  const item = manifest.items.find((candidate) => candidate.id === id);
  if (!item) throw new Error(`No candidate ${id} in ${runDir}`);
  const source = join(runDir, item.genome);
  const promotedDir = join(foundryDir, "promoted");
  const appFixtureDir = resolve(root, "app/src/engine/foundry-fixtures");
  mkdirSync(promotedDir, { recursive: true });
  mkdirSync(appFixtureDir, { recursive: true });
  await copyFile(source, join(promotedDir, "hero.genome.json"));
  await copyFile(source, join(appFixtureDir, "hero.genome.json"));
  console.log(JSON.stringify({
    promoted: join(promotedDir, "hero.genome.json"),
    appFixture: join(appFixtureDir, "hero.genome.json"),
  }, null, 2));
}

async function commandVectorizeLayers(args) {
  const runDir = resolve(args["run-dir"] || ".");
  const manifestPath = join(runDir, "manifest.json");
  if (!existsSync(manifestPath)) throw new Error(`No manifest.json found in ${runDir}. Run extract-layers first.`);
  const { vectorizePng } = await import("./vectorize-png.mjs");
  const manifest = readJson(manifestPath);
  const outDir = join(runDir, "vectors");
  mkdirSync(outDir, { recursive: true });
  const vectors = [];
  for (const layer of manifest.layers || []) {
    if (!layer.pixels) continue;
    const out = join(outDir, `${layer.name}.svg`);
    const sourceFile = layer.cropFile || layer.file;
    const result = vectorizePng(join(runDir, sourceFile), out, {
      ...args,
      colors: args.colors || 18,
      "max-size": args["max-size"] || 720,
      "min-area": args["min-area"] || 24,
      simplify: args.simplify || 1.2,
      "drop-background": false,
    });
    vectors.push({
      name: layer.name,
      file: `vectors/${layer.name}.svg`,
      source: sourceFile,
      registration: layer.registration,
      components: result.components,
      colors: result.colors,
    });
  }
  writeJson(join(runDir, "vector-manifest.json"), {
    createdAt: new Date().toISOString(),
    sourceManifest: "manifest.json",
    vectors,
  });
  writeText(join(runDir, "vector-contact-sheet.html"), vectorContactSheet(vectors));
  console.log(JSON.stringify({ runDir, vectors }, null, 2));
}

function vectorContactSheet(vectors) {
  const cards = vectors.map((vector) => `
    <article>
      <h2>${escapeHtml(vector.name)}</h2>
      <img src="${escapeHtml(vector.file)}" alt="${escapeHtml(vector.name)}">
      <p>${vector.components} components · ${vector.colors.length} colors</p>
    </article>
  `).join("");
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>Avatar Layer Vectors</title>
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
  <header><h1>Avatar Layer Vectors</h1></header>
  <main>${cards}</main>
</body>
</html>
`;
}

function assertCheck(condition, message) {
  if (!condition) throw new Error(message);
}

async function commandCheck() {
  const hero = loadGenome(heroPath);
  const runtimeHero = runtime.normalizeGenome(runtime.DEFAULT_HERO_GENOME);
  assertCheck(
    runtime.stableStringify(hero) === runtime.stableStringify(runtimeHero),
    "Fixture hero.genome.json must match the app runtime DEFAULT_HERO_GENOME.",
  );
  const first = runtime.compileAvatar(hero);
  const second = runtime.compileAvatar(hero);
  assertCheck(first === second, "Deterministic compile failed: same genome produced different SVG.");
  assertCheck(!/\d+\/\d+ parts/.test(first), "Foundry SVG leaked PNG coverage text.");
  assertCheck((first.match(/<(path|circle|ellipse|rect|line|g)\b/g) || []).length > 35, "Foundry SVG appears too sparse.");
  assertCheck(/hoodie_|denim_|hair_|skin_/.test(first), "Foundry SVG is missing expected layer gradients.");
  assertCheck(runtime.compileAvatar(hero, { crop: "bust" }).includes('viewBox="64 18 112 126"'), "Bust crop failed.");

  const outDir = makeRunDir("check");
  const genomes = Array.from({ length: 8 }, (_, i) => mutateGenome(hero, i));
  const items = writeGenomeSet(genomes, outDir);
  for (let i = 0; i < genomes.length; i += 1) {
    const file = `renders/${genomes[i].seed}.svg`;
    const result = await renderGenome(genomes[i], join(outDir, file), "svg");
    assertCheck(result.elementCount > 35, `${genomes[i].seed} rendered too few vector elements.`);
    items[i].render = file;
    items[i].renderHash = result.hash;
    items[i].elementCount = result.elementCount;
  }
  writeJson(join(outDir, "manifest.json"), {
    createdAt: new Date().toISOString(),
    engine: "avatar-foundry",
    version: runtime.VERSION,
    items,
  });
  await writeContactSheet(outDir, join(outDir, "contact-sheet.html"));
  const critiques = genomes.map((genome) => runtime.critiqueGenome(genome));
  const critique = { createdAt: new Date().toISOString(), schema: "avatar-foundry-critique-v1", critiques };
  const errors = validateCritiques(critique);
  assertCheck(errors.length === 0, `Critique schema failed:\n${errors.join("\n")}`);
  writeJson(join(outDir, "critique.json"), critique);
  const clusters = buildClusters(critiques);
  writeJson(join(outDir, "clusters.json"), { createdAt: new Date().toISOString(), clusters });
  console.log(`Avatar Foundry check passed: ${outDir}`);
}

async function main() {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === "help" || command === "--help" || command === "-h") usage(0);
  if (command === "isolate-agent") {
    const result = spawnSync(process.execPath, [resolve(foundryDir, "part-isolation-agent.mjs"), ...rest], {
      cwd: root,
      stdio: "inherit",
      env: process.env,
    });
    process.exit(result.status || 0);
  }
  const args = parseArgv(rest);
  if (command === "render-one") return commandRenderOne(args);
  if (command === "mutate-genome") return commandMutateGenome(args);
  if (command === "cutout-avatar") {
    const { cutoutAvatar } = await import("./cutout-avatar.mjs");
    if (!args.input || !args.out) throw new Error("cutout-avatar requires --input <path> and --out <path>");
    const result = cutoutAvatar(resolve(args.input), resolve(args.out), args);
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (command === "extract-layers") {
    const { extractLayers } = await import("./extract-layers.mjs");
    if (!args.input || !args["out-dir"]) throw new Error("extract-layers requires --input <path> and --out-dir <dir>");
    const result = extractLayers(resolve(args.input), resolve(args["out-dir"]));
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (command === "vectorize-png") {
    const { vectorizePng } = await import("./vectorize-png.mjs");
    if (!args.input || !args.out) throw new Error("vectorize-png requires --input <path> and --out <path>");
    const result = vectorizePng(resolve(args.input), resolve(args.out), args);
    console.log(JSON.stringify(result, null, 2));
    return;
  }
  if (command === "vectorize-layers") return commandVectorizeLayers(args);
  if (command === "render-matrix") return commandRenderMatrix(args);
  if (command === "contact-sheet") return commandContactSheet(args);
  if (command === "critique-run") return commandCritiqueRun(args);
  if (command === "cluster-findings") return commandClusterFindings(args);
  if (command === "promote-variant") return commandPromoteVariant(args);
  if (command === "check") return commandCheck(args);
  usage(1);
}

main().catch((error) => {
  console.error(error.stack || error.message || String(error));
  process.exit(1);
});
