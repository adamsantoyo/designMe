// Resolve avatar state -> an ordered list of PNG layers (back -> front).
// Each slot maps an Av field to a part id + an optional tint color. Slots whose id
// is "none" or whose PNG isn't registered yet are skipped — so the figure builds up
// as you add art, with no gaps blocking the rest.
//
// Z-order is a pragmatic subset of docs/avatar-engine.md; hair is one layer for now
// (back/front split lands when the art needs it).

import type { Av } from "../dm";
import { hasPart, partRef } from "./registry";

type Slot = {
  slot: string;
  cat: string; // asset folder
  idFrom: keyof Av; // which Av field holds the part id
  tintFrom: keyof Av | null; // which Av field holds the recolor hex (null = fixed color)
};

// back -> front (mirrors docs/avatar-engine.md z-order)
const SLOTS: Slot[] = [
  { slot: "mobility", cat: "mobility", idFrom: "mobility", tintFrom: null },
  { slot: "body", cat: "body", idFrom: "body", tintFrom: "skin" },
  { slot: "bottom", cat: "bottom", idFrom: "bottom", tintFrom: "bottomColor" },
  { slot: "shoes", cat: "shoe", idFrom: "shoes", tintFrom: null },
  { slot: "top", cat: "top", idFrom: "top", tintFrom: "topColor" },
  { slot: "layer", cat: "top", idFrom: "layer", tintFrom: "layerColor" },
  { slot: "carry", cat: "carry", idFrom: "carry", tintFrom: null },
  // Face = the expression overlay (drawn under the hair so a fringe can overlap it).
  // Fixed ink color — brows/eyes/mouth are not user-recolored.
  { slot: "face", cat: "face", idFrom: "expression", tintFrom: null },
  { slot: "hair", cat: "hair", idFrom: "hair", tintFrom: "hairColor" },
  { slot: "feature", cat: "feature", idFrom: "feature", tintFrom: null },
  { slot: "hearing", cat: "hearing", idFrom: "hearing", tintFrom: null },
  { slot: "headwear", cat: "accessory", idFrom: "headwear", tintFrom: "topColor" },
  { slot: "tool", cat: "tool", idFrom: "tool", tintFrom: null },
  { slot: "glasses", cat: "glasses", idFrom: "glasses", tintFrom: null },
  { slot: "jewelry", cat: "jewelry", idFrom: "jewelry", tintFrom: null },
  { slot: "aac", cat: "aac", idFrom: "aac", tintFrom: null },
];

export type Layer = {
  slot: string;
  key: string; // "cat/id"
  ref: number; // require()'d asset
  tint: string | null; // hex to multiply, or null for as-drawn
};

export function resolveLayers(av: Av): Layer[] {
  const out: Layer[] = [];
  for (const s of SLOTS) {
    const id = String(av[s.idFrom] ?? "");
    if (!id || id === "none") continue;
    const key = `${s.cat}/${id}`;
    if (!hasPart(key)) continue;
    out.push({
      slot: s.slot,
      key,
      ref: partRef(key)!,
      tint: s.tintFrom ? String(av[s.tintFrom]) : null,
    });
  }
  return out;
}

// Dev aid: how many of the slots this avatar *wants* are actually wired with art.
// Lets PNG mode label partial composites ("3/6 parts") instead of presenting an
// incomplete figure as if it were the product.
export function coverage(av: Av): { have: number; want: number } {
  let have = 0;
  let want = 0;
  for (const s of SLOTS) {
    const id = String(av[s.idFrom] ?? "");
    if (!id || id === "none") continue;
    want++;
    if (hasPart(`${s.cat}/${id}`)) have++;
  }
  return { have, want };
}

// Height nudges overall vertical scale (no separate asset per docs/art-prompts.md).
export const heightScaleY = (height: string): number =>
  ({ shorter: 0.94, short: 0.97, medium: 1, tall: 1.03, taller: 1.06 } as Record<string, number>)[
    height
  ] ?? 1;
