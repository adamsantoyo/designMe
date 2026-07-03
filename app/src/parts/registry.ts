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
  // -- add your require() lines below ------------------------------------------
  // Generate with tools/art-gen/ (greenscreen-worn pipeline), approve on the
  // contact sheet, then tools/art-gen/ingest-approved.mjs prints these lines.
  // Only contact-sheet-APPROVED parts belong here — presence in assets/ alone
  // means nothing (skin/base lives there as the registration master, unlisted).
  "bottom/barrelJean": require("../../assets/parts/bottom/barrelJean.png"),
  "hair/definedCurls": require("../../assets/parts/hair/definedCurls.png"),
  "mobility/wheelchair": require("../../assets/parts/mobility/wheelchair.png"),
  "shoe/classicSneaker": require("../../assets/parts/shoe/classicSneaker.png"),
  "top/hoodie": require("../../assets/parts/top/hoodie.png"),
  // first-slice completion (2026-07-03) — pending contact-sheet approval; body/balanced
  // is the approved base figure itself (balanced build == the base)
  "body/balanced": require("../../assets/parts/body/balanced.png"),
  "hair/wavyM": require("../../assets/parts/hair/wavyM.png"),
  "faceShape/oval": require("../../assets/parts/faceShape/oval.png"),
  "eye/almond": require("../../assets/parts/eye/almond.png"),
  "brow/soft": require("../../assets/parts/brow/soft.png"),
  "nose/rounded": require("../../assets/parts/nose/rounded.png"),
  "lip/soft": require("../../assets/parts/lip/soft.png"),
};

export const hasPart = (key: string): boolean =>
  Object.prototype.hasOwnProperty.call(PARTS, key);

export const partRef = (key: string): number | undefined => PARTS[key];

export const partCount = (): number => Object.keys(PARTS).length;
