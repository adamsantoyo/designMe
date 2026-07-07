// designMe — premium (svgparts) renderability gate.
// A part renders in the premium engine only when it has BOTH a manifest entry (the
// z-order + tint contract) AND traced svg art. Empty slots ("none", and "bald" in the
// hair slot — a complete no-hair look, not a missing part) are always renderable.
// Trays and the premium-safe shuffle consult this so a reachable avatar always has
// full coverage and the stage never drops to the complete-fallback in normal use.
// Leaf module: depends only on the manifest + svgRegistry — no engine/UI imports.

import { PART_MANIFEST, partKey } from "./manifest";
import { hasSvgPart } from "./svgRegistry";

// manifest ∩ svgRegistry — the keys that both carry a contract and have art.
const RENDERABLE_KEYS = new Set(
  PART_MANIFEST.map((m) => partKey(m.category, m.id)).filter((key) => hasSvgPart(key)),
);

export function isPremiumRenderable(category: string, id: string): boolean {
  if (!id || id === "none") return true;
  if (category === "hair" && id === "bald") return true;
  return RENDERABLE_KEYS.has(`${category}/${id}`);
}
