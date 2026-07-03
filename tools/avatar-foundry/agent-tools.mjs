import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const cli = resolve(here, "cli.mjs");

function runFoundry(args) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(process.execPath, [cli, ...args], {
      cwd: resolve(here, "../.."),
      stdio: ["ignore", "pipe", "pipe"],
      env: process.env,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("close", (code) => {
      if (code === 0) resolvePromise(stdout.trim());
      else reject(new Error(stderr || stdout || `Avatar Foundry exited with ${code}`));
    });
  });
}

function withOption(args, key, value) {
  if (value === undefined || value === null || value === false) return args;
  args.push(`--${key}`);
  if (value !== true) args.push(String(value));
  return args;
}

export async function render_avatar({ genome, out, format = "svg", crop = "full" } = {}) {
  const args = ["render-one"];
  withOption(args, "genome", genome);
  withOption(args, "out", out);
  withOption(args, "format", format);
  withOption(args, "crop", crop);
  return runFoundry(args);
}

export async function render_matrix({ genome, outDir, count = 24, format = "svg" } = {}) {
  const args = ["render-matrix"];
  withOption(args, "genome", genome);
  withOption(args, "out-dir", outDir);
  withOption(args, "count", count);
  withOption(args, "format", format);
  return runFoundry(args);
}

export async function create_variant_batch({ genome, outDir, count = 40 } = {}) {
  const args = ["mutate-genome"];
  withOption(args, "genome", genome);
  withOption(args, "out-dir", outDir);
  withOption(args, "count", count);
  return runFoundry(args);
}

export async function cutout_avatar({ input, out, tolerance = 48, edgeSoftness = 20 } = {}) {
  const args = ["cutout-avatar"];
  withOption(args, "input", input);
  withOption(args, "out", out);
  withOption(args, "tolerance", tolerance);
  withOption(args, "edge-softness", edgeSoftness);
  return runFoundry(args);
}

export async function extract_layers({ input, outDir } = {}) {
  const args = ["extract-layers"];
  withOption(args, "input", input);
  withOption(args, "out-dir", outDir);
  return runFoundry(args);
}

export async function isolate_part_init({ target, outDir } = {}) {
  const args = ["isolate-agent", "init"];
  withOption(args, "target", target);
  withOption(args, "out-dir", outDir);
  return runFoundry(args);
}

export async function isolate_part_record({ runDir, part, image } = {}) {
  const args = ["isolate-agent", "record"];
  withOption(args, "run-dir", runDir);
  withOption(args, "part", part);
  withOption(args, "image", image);
  return runFoundry(args);
}

export async function isolate_part_process({ runDir, part } = {}) {
  const args = ["isolate-agent", "process"];
  withOption(args, "run-dir", runDir);
  withOption(args, "part", part);
  return runFoundry(args);
}

export async function isolate_part_assess({ runDir, part } = {}) {
  const args = ["isolate-agent", "assess"];
  withOption(args, "run-dir", runDir);
  withOption(args, "part", part);
  return runFoundry(args);
}

export async function isolate_part_fit({ runDir, part, fitMode } = {}) {
  const args = ["isolate-agent", "fit"];
  withOption(args, "run-dir", runDir);
  withOption(args, "part", part);
  withOption(args, "fit-mode", fitMode);
  return runFoundry(args);
}

export async function isolate_part_restack({ runDir, accepted = false } = {}) {
  const args = ["isolate-agent", "restack"];
  withOption(args, "run-dir", runDir);
  withOption(args, "accepted", accepted);
  return runFoundry(args);
}

export async function isolate_part_contact_sheet({ runDir, out } = {}) {
  const args = ["isolate-agent", "contact-sheet"];
  withOption(args, "run-dir", runDir);
  withOption(args, "out", out);
  return runFoundry(args);
}

export async function isolate_part_accept({ runDir, part, note } = {}) {
  const args = ["isolate-agent", "accept"];
  withOption(args, "run-dir", runDir);
  withOption(args, "part", part);
  withOption(args, "note", note);
  return runFoundry(args);
}

export async function isolate_part_vectorize({ runDir, part, allowUnaccepted = false } = {}) {
  const args = ["isolate-agent", "vectorize"];
  withOption(args, "run-dir", runDir);
  withOption(args, "part", part);
  withOption(args, "allow-unaccepted", allowUnaccepted);
  return runFoundry(args);
}

export async function vectorize_png({ input, out, colors = 18, maxSize = 720, minArea = 28, simplify = 1.2 } = {}) {
  const args = ["vectorize-png"];
  withOption(args, "input", input);
  withOption(args, "out", out);
  withOption(args, "colors", colors);
  withOption(args, "max-size", maxSize);
  withOption(args, "min-area", minArea);
  withOption(args, "simplify", simplify);
  return runFoundry(args);
}

export async function vectorize_layers({ runDir, colors = 18, maxSize = 720, minArea = 24, simplify = 1.2 } = {}) {
  const args = ["vectorize-layers"];
  withOption(args, "run-dir", runDir);
  withOption(args, "colors", colors);
  withOption(args, "max-size", maxSize);
  withOption(args, "min-area", minArea);
  withOption(args, "simplify", simplify);
  return runFoundry(args);
}

export async function score_sheet({ runDir, out } = {}) {
  const args = ["critique-run"];
  withOption(args, "run-dir", runDir);
  withOption(args, "out", out);
  return runFoundry(args);
}

export async function cluster_findings({ runDir, out } = {}) {
  const args = ["cluster-findings"];
  withOption(args, "run-dir", runDir);
  withOption(args, "out", out);
  return runFoundry(args);
}

export async function promote_variant({ runDir, id } = {}) {
  const args = ["promote-variant"];
  withOption(args, "run-dir", runDir);
  withOption(args, "id", id);
  return runFoundry(args);
}

export default {
  render_avatar,
  render_matrix,
  create_variant_batch,
  cutout_avatar,
  extract_layers,
  isolate_part_init,
  isolate_part_record,
  isolate_part_process,
  isolate_part_assess,
  isolate_part_fit,
  isolate_part_restack,
  isolate_part_contact_sheet,
  isolate_part_accept,
  isolate_part_vectorize,
  vectorize_png,
  vectorize_layers,
  score_sheet,
  cluster_findings,
  promote_variant,
};
