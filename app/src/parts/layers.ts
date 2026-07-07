// Resolve avatar state -> an ordered list of part layers (back -> front).
// The manifest owns the product contract: category, id, scope, tint behavior, and
// z-order. A PartSource wires the assets: PNG Metro refs (default) or SVG markup
// strings (svgparts engine) — same manifest, same z-order, either source.

import type { Av } from "../dm";
import { hasPart, partRef } from "./registry";
import { LAYER_SLOTS, manifestItem, partKey, type PartManifestItem, type TintMode } from "./manifest";

// How a render engine looks up part assets. `ref` is whatever the engine draws:
// a Metro asset id (PNG) or an SVG markup string (svgparts).
export type PartSource = {
  hasPart: (key: string) => boolean;
  partRef: (key: string) => number | string | undefined;
};

export const pngSource: PartSource = { hasPart, partRef };

// A slot the avatar leaves empty by choice: "none", or "bald" in the hair slot
// (a valid, complete look — no hair, not a missing part). Treated exactly like an
// unset slot so it never counts against coverage or forces the complete-fallback.
const isEmptySlot = (slot: string, id: string): boolean =>
  !id || id === "none" || (slot === "hair" && id === "bald");

export type Layer = {
  slot: string;
  key: string; // "cat/id"
  ref: number | string; // Metro asset id (PNG) or markup string (SVG)
  tint: string | null; // hex to multiply, or null for as-drawn
  tintMode: TintMode;
  scope: PartManifestItem["scope"];
  z: number;
};

export type Coverage = { have: number; want: number; missing: string[] };

export function resolveLayers(av: Av, ov?: Partial<Av>, source: PartSource = pngSource): Layer[] {
  const a = { ...av, ...(ov || {}) };
  const out: Layer[] = [];
  for (const s of LAYER_SLOTS) {
    const id = String(a[s.idFrom] ?? "");
    if (isEmptySlot(s.slot, id)) continue;
    const key = partKey(s.category, id);
    const item = manifestItem(key);
    if (!item || !source.hasPart(key)) continue;
    out.push({
      slot: s.slot,
      key,
      ref: source.partRef(key)!,
      tint: item.tintMode === "multiply" && s.tintFrom ? String(a[s.tintFrom]) : null,
      tintMode: item.tintMode,
      scope: item.scope,
      z: item.z,
    });
  }
  return out.sort((a, b) => a.z - b.z);
}

// Dev aid: how many of the slots this avatar *wants* are actually wired with art.
// Lets PNG/svgparts mode label partial composites ("3/6 parts") instead of
// presenting an incomplete figure as if it were the product.
export function coverage(av: Av, ov?: Partial<Av>, source: PartSource = pngSource): Coverage {
  const a = { ...av, ...(ov || {}) };
  let have = 0;
  let want = 0;
  const missing: string[] = [];
  for (const s of LAYER_SLOTS) {
    const id = String(a[s.idFrom] ?? "");
    if (isEmptySlot(s.slot, id)) continue;
    want++;
    const key = partKey(s.category, id);
    if (manifestItem(key) && source.hasPart(key)) have++;
    else missing.push(key);
  }
  return { have, want, missing };
}

// Height nudges overall vertical scale (no separate asset per docs/art-prompts.md).
export const heightScaleY = (height: string): number =>
  ({ shorter: 0.94, short: 0.97, medium: 1, tall: 1.03, taller: 1.06 } as Record<string, number>)[
    height
  ] ?? 1;
