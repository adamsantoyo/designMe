// PNG parts registry — the ONE place you wire a generated image into the app.
//
// Metro (the bundler) can't load an asset unless it's literally `require()`d in
// source, so dynamic `require("../assets/parts/" + id)` does NOT work. Instead, add
// one line here per PNG you drop into `assets/parts/`. The key is `"{category}/{id}"`
// and must match the catalog id in `dm.ts`.
//
// Example — after you save `assets/parts/hair/waves.png`, add:
//
//   "hair/wavyM": require("../../assets/parts/hair/wavyM.png"),
//
// Start with `body/balanced` (the base body), then hair, then the rest.

export const PARTS: Record<string, number> = {
  // ── add your require() lines below ──────────────────────────────────────────
  // Ingest downloads with:  tools/art-lab/ingest.py <file.png> <category/id>
  // (it cleans halos, registers onto the canonical canvas, and prints this line).
  // DEMO: your _art/wavy_transp.png, wired in to prove recolor works. Replace or
  // remove once real, body-registered art exists.
  "hair/wavyM": require("../../assets/parts/hair/wavyM.png"),
  "body/balanced": require("../../assets/parts/body/balanced.png"),
  // "top/hoodie":    require("../../assets/parts/top/hoodie.png"),
};

export const hasPart = (key: string): boolean =>
  Object.prototype.hasOwnProperty.call(PARTS, key);

export const partRef = (key: string): number | undefined => PARTS[key];

export const partCount = (): number => Object.keys(PARTS).length;
