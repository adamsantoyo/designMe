// Shared helpers for the Story 1.1 art-generation regression tests.
//
// The "feature under test" here is not a UI or an API — it is the art-generation
// pipeline (tools/art-gen/generate.mjs) and its three prompt rules. The pipeline's
// own documented verification path is `generate.mjs --dry-run`, which assembles the
// exact prompt text that would be sent to gpt-image-1 without spending money or
// needing OPENAI_API_KEY. These helpers drive that CLI end-to-end and hand the
// assembled prompt back for assertion.

import { execFileSync } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

const GENERATE = join(ROOT, "tools", "art-gen", "generate.mjs");

const _cache = new Map();

/**
 * Assemble the full prompt for a single catalog key via the real CLI dry-run.
 * Memoized so a key is only ever spawned once across the whole suite.
 * `--force` bypasses the "already ingested" skip so the prompt is always emitted.
 */
export function assembledPrompt(key) {
  if (_cache.has(key)) return _cache.get(key);
  const out = execFileSync(
    process.execPath,
    [GENERATE, "--dry-run", "--force", "--only", key],
    { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
  );
  _cache.set(key, out);
  return out;
}

/** Run a tools/ gate script and return its exit code (0 = pass). */
export function gateExitCode(relPath, args = []) {
  try {
    execFileSync(process.execPath, [join(ROOT, relPath), ...args], {
      cwd: ROOT,
      stdio: "ignore",
    });
    return 0;
  } catch (err) {
    return typeof err.status === "number" ? err.status : 1;
  }
}
