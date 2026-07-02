// Shared catalog case list for the engine smoke test and the visual QA sheet.
// Attr maps mirror app/src/dm.ts.
// Attr maps mirror app/src/dm.ts (keep in sync — checked by content below).
export const TOPS = {
  plainTee: { sleeve: "short", len: "hip", neck: "crew", fit: "relaxed" },
  boxyTee: { sleeve: "short", len: "boxy", neck: "crew", fit: "boxy" },
  babyTee: { sleeve: "short", len: "crop", neck: "crew", fit: "fitted" },
  longSleeveTee: { sleeve: "long", len: "hip", neck: "crew", fit: "relaxed" },
  ribTank: { sleeve: "tank", len: "crop", neck: "scoop", fit: "fitted", rib: true },
  jersey: { sleeve: "short", len: "boxy", neck: "v", fit: "boxy", jersey: true },
  sweater: { sleeve: "long", len: "hip", neck: "crew", fit: "relaxed", chunky: true },
  cardigan: { sleeve: "long", len: "hip", neck: "v", fit: "relaxed", placket: true, chunky: true },
  buttonCardigan: { sleeve: "long", len: "hip", neck: "crew", fit: "fitted", placket: true, chunky: true },
  button: { sleeve: "long", len: "long", neck: "collar", fit: "relaxed", placket: true },
  flannel: { sleeve: "long", len: "hip", neck: "collar", fit: "relaxed", placket: true, pattern: "plaid" },
  hoodie: { sleeve: "long", len: "long", neck: "crew", fit: "oversized", hood: true, pocket: true },
  sweatshirt: { sleeve: "long", len: "long", neck: "crew", fit: "oversized", rib: true },
  meshLayer: { sleeve: "long", len: "hip", neck: "scoop", fit: "fitted", mesh: true },
  cropCorset: { sleeve: "tank", len: "crop", neck: "scoop", fit: "fitted", corset: true },
  asymKnit: { sleeve: "long", len: "hip", neck: "asym", fit: "fitted", chunky: true },
  wrapTop: { sleeve: "long", len: "hip", neck: "v", fit: "fitted", wrap: true },
  slipDress: { sleeve: "strap", len: "dress", neck: "scoop", fit: "drape", satin: true },
  bomber: { sleeve: "long", len: "boxy", neck: "crew", fit: "oversized", zip: true, rib: true },
};
export const BOTTOMS = {
  straightJean: { type: "straight", denim: true }, barrelJean: { type: "barrel", denim: true },
  wideDenim: { type: "wide", denim: true }, wideTrouser: { type: "wide", crease: true },
  cargo: { type: "cargo" }, joggers: { type: "jogger" }, trackPant: { type: "track" },
  parachute: { type: "parachute", ruched: true }, leggings: { type: "legg" },
  bikeShorts: { type: "bike" }, shorts: { type: "shorts" }, jorts: { type: "jorts", denim: true },
  miniSkirt: { type: "skirt", mini: true }, midiSkirt: { type: "skirt", midi: true },
  pleatedSkirt: { type: "skirt", midi: true, pleated: true }, slipSkirt: { type: "skirt", midi: true, satin: true },
  cargoMaxi: { type: "skirt", maxi: true, cargo: true }, maxiSkirt: { type: "skirt", maxi: true },
  chinos: { type: "straight" }, dressPants: { type: "straight", crease: true },
};
export const LAYERS = {
  drapedShirt: { style: "overshirt" }, denimJacket: { style: "denim" },
  blazer: { style: "blazer" }, utility: { style: "utility" }, shell: { style: "shell" },
};

export const HAIR = ["straightL","wavyM","layers","bigBlowout","curtain","halfUp","lowPony","highPony","lowBun","highBun","sleekBun","messyBun","clawClip","braid","pigtails","definedCurls","bob","pixie","shortCrop","taperFade","buzzCut","shaved","bald"];
export const SHOES = ["sneaker","classicSneaker","runner","skateShoe","boot","combatBoot","chelseaBoot","loafer","mary","balletFlat","slide","hikingShoe"];
export const GLASSES = ["round","rect","cat","thickFrame","tinted"];
export const HEARING = ["ha_r","ha_l","ci_both"];
export const HEADWEAR = ["headscarf","beanie","baseballCap","bucketHat"];
export const TOOLS = ["noiseHeadphones","headphones","medicalBracelet"];
export const AAC = ["tablet","board","letterboard","ipad"];
export const MOBILITY = ["cane","walker","wheelchair"];
export const JEWELRY = ["studs","hoops","chain","pearl","watch","rings"];
export const CARRY = ["crossbody","tote","canvasTote","mini","backpack","beltbag","messenger","laptopBag","gymBag"];
export const FEATURES = ["freckles","vitiligo","birthmark","scar","blush"];
export const BODIES = ["lean","balanced","broad","curves","full"];
export const HEIGHTS = ["shorter","short","medium","tall","taller"];

export const base = () => ({
  skin: "#8a5a3f", hair: "wavyM", hairColor: "#3f2b1f", expression: "smile",
  feature: "none", glasses: "none", hearing: "none", headwear: "none",
  jewelry: "none", tool: "none", aac: "none", mobility: "none", carry: "none",
  body: "balanced", height: "medium",
  top: { ...TOPS.plainTee, pattern: "none" }, topColor: "#8aa382",
  bottom: { ...BOTTOMS.straightJean }, bottomColor: "#5a6f8c",
  layer: { style: "none" }, layerColor: "#5a6f8c", shoes: "sneaker",
});

export const cases = [];
for (const h of HAIR) cases.push(["hair", h, { hair: h }]);
for (const [id, attrs] of Object.entries(TOPS)) cases.push(["top", id, { top: { ...attrs, pattern: attrs.pattern || "none" } }]);
for (const [id, attrs] of Object.entries(BOTTOMS)) cases.push(["bottom", id, { bottom: { ...attrs } }]);
for (const [id, attrs] of Object.entries(LAYERS)) cases.push(["layer", id, { layer: attrs }]);
for (const s of SHOES) cases.push(["shoe", s, { shoes: s }]);
for (const g of GLASSES) cases.push(["glasses", g, { glasses: g }]);
for (const h of HEARING) cases.push(["hearing", h, { hearing: h }]);
for (const h of HEADWEAR) cases.push(["headwear", h, { headwear: h }]);
for (const t of TOOLS) cases.push(["tool", t, { tool: t }]);
for (const a of AAC) cases.push(["aac", a, { aac: a }]);
for (const m of MOBILITY) cases.push(["mobility", m, { mobility: m }]);
for (const j of JEWELRY) cases.push(["jewelry", j, { jewelry: j }]);
for (const c of CARRY) cases.push(["carry", c, { carry: c }]);
for (const f of FEATURES) cases.push(["feature", f, { feature: f }]);
for (const b of BODIES) cases.push(["body", b, { body: b }]);
for (const h of HEIGHTS) cases.push(["height", h, { height: h }]);

