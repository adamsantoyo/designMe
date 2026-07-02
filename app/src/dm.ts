// designMe — catalog + engine option builder.
// Catalog ids follow docs/catalog-bible.md (the item bible) exactly, which also
// matches docs/art-prompts.md filenames — run `node tools/check-art-ids.mjs` to prove
// it. The SVG engine renders every id as a placeholder until PNG art replaces it.

export type ColorOpt = { v: string; label: string };
export type Item = { id: string; label: string };
export type GarmentItem = { id: string; label: string; attrs: Record<string, any> };
export type Vibe = { id: string; label: string; tag: string; note: string; ov: Partial<Av> };

// 14 skin tones (art-bible §3, s1–s14) — never a light default.
// Labels are for screen readers: every tone must be distinguishable non-visually.
export const skins: ColorOpt[] = [
  { v: "#3b2a21", label: "Deepest brown" }, { v: "#4a3328", label: "Deep espresso" },
  { v: "#5c3f30", label: "Deep brown" }, { v: "#6d4733", label: "Mahogany" },
  { v: "#7c5a45", label: "Rich brown" }, { v: "#8a5a3f", label: "Warm brown" },
  { v: "#9c6f4e", label: "Chestnut" }, { v: "#a87c58", label: "Medium brown" },
  { v: "#bd8a5f", label: "Golden brown" }, { v: "#c99a6e", label: "Amber" },
  { v: "#bca079", label: "Olive tan" }, { v: "#d3b48f", label: "Warm tan" },
  { v: "#e3c4a2", label: "Light tan" }, { v: "#efd4b8", label: "Fair" },
];

// 18 hair colors (art-bible §3, h1–h18).
export const hairColors: ColorOpt[] = [
  { v: "#211c1a", label: "Black" }, { v: "#2e221b", label: "Espresso" },
  { v: "#3f2b1f", label: "Dark brown" }, { v: "#5a3b27", label: "Chestnut" },
  { v: "#6f4a2f", label: "Brown" }, { v: "#8a5a34", label: "Light brown" },
  { v: "#a87f4e", label: "Caramel" }, { v: "#c8a968", label: "Blonde" },
  { v: "#dcc07a", label: "Golden blonde" }, { v: "#e7ddc4", label: "Platinum" },
  { v: "#9a958d", label: "Ash gray" }, { v: "#cfcac3", label: "Silver" },
  { v: "#9a4a36", label: "Auburn" }, { v: "#c0673a", label: "Ginger" },
  { v: "#6f4a72", label: "Plum" }, { v: "#3f6f8a", label: "Ocean" },
  { v: "#3f8a78", label: "Teal" }, { v: "#c0708f", label: "Rose" },
];

export const garmentColors: ColorOpt[] = [
  { v: "#e6dcc6", label: "Oat" }, { v: "#f1e9d8", label: "Cream" }, { v: "#c08457", label: "Clay" }, { v: "#a8553a", label: "Rust" },
  { v: "#bd6f4f", label: "Terracotta" }, { v: "#7d8254", label: "Olive" }, { v: "#8aa382", label: "Sage" }, { v: "#46604b", label: "Pine" },
  { v: "#3f8a86", label: "Teal" }, { v: "#8aa7bd", label: "Sky" }, { v: "#5a6f8c", label: "Denim" }, { v: "#7a5570", label: "Plum" },
  { v: "#d39aa3", label: "Rose" }, { v: "#cda14e", label: "Mustard" }, { v: "#5e4334", label: "Cocoa" }, { v: "#3c3a38", label: "Charcoal" },
];

export const expressions: Item[] = [
  { id: "smile", label: "Smile" }, { id: "soft", label: "Soft" }, { id: "calm", label: "Calm" },
];
export const bodyShapes: Item[] = [
  { id: "lean", label: "Lean" }, { id: "balanced", label: "Balanced" }, { id: "broad", label: "Broad" },
  { id: "curves", label: "Curves" }, { id: "full", label: "Full" },
];
export const heights: Item[] = [
  { id: "shorter", label: "Shorter" }, { id: "short", label: "Short" }, { id: "medium", label: "Medium" },
  { id: "tall", label: "Tall" }, { id: "taller", label: "Taller" },
];
export const features: Item[] = [
  { id: "none", label: "None" }, { id: "freckles", label: "Freckles" }, { id: "vitiligo", label: "Vitiligo" },
  { id: "birthmark", label: "Birthmark" }, { id: "scar", label: "Scar" }, { id: "blush", label: "Rosy cheeks" },
];
export const glasses: Item[] = [
  { id: "none", label: "None" }, { id: "round", label: "Round" }, { id: "rect", label: "Rectangle" },
  { id: "cat", label: "Cat-eye" }, { id: "thickFrame", label: "Thick frame" }, { id: "tinted", label: "Tinted" },
];
// Side-specific: sides carry meaning for hearing-tech users.
export const hearing: Item[] = [
  { id: "none", label: "None" }, { id: "ha_r", label: "Hearing aid (right)" },
  { id: "ha_l", label: "Hearing aid (left)" }, { id: "ci_both", label: "Cochlear implants" },
];
export const headwear: Item[] = [
  { id: "none", label: "None" }, { id: "headscarf", label: "Headscarf" }, { id: "beanie", label: "Beanie" },
  { id: "baseballCap", label: "Baseball cap" }, { id: "bucketHat", label: "Bucket hat" },
];
export const tools: Item[] = [
  { id: "none", label: "None" }, { id: "noiseHeadphones", label: "Noise-reducing headphones" },
  { id: "headphones", label: "Headphones" }, { id: "medicalBracelet", label: "Medical bracelet" },
];
export const aacs: Item[] = [
  { id: "none", label: "None" }, { id: "tablet", label: "AAC tablet" }, { id: "board", label: "AAC board" },
  { id: "letterboard", label: "Letter board" }, { id: "ipad", label: "iPad" },
];
export const mobilities: Item[] = [
  { id: "none", label: "None" }, { id: "cane", label: "Cane" }, { id: "walker", label: "Walker" },
  { id: "wheelchair", label: "Wheelchair" },
];
export const jewelry: Item[] = [
  { id: "none", label: "None" }, { id: "studs", label: "Ear studs" }, { id: "hoops", label: "Hoops" },
  { id: "chain", label: "Chain" }, { id: "pearl", label: "Pearl drops" }, { id: "watch", label: "Watch" },
  { id: "rings", label: "Rings" },
];
export const carries: Item[] = [
  { id: "none", label: "None" }, { id: "crossbody", label: "Crossbody" }, { id: "tote", label: "Soft tote" },
  { id: "canvasTote", label: "Canvas tote" }, { id: "mini", label: "Mini bag" }, { id: "backpack", label: "Backpack" },
  { id: "beltbag", label: "Belt bag" }, { id: "messenger", label: "Messenger" }, { id: "laptopBag", label: "Laptop bag" },
  { id: "gymBag", label: "Gym bag" },
];

// Sister-scoped sleek/styled set + the bible's short styles. crownBraid is cut per
// the bible; no afro/coily beyond definedCurls per the standing scope directive.
export const hairStyles: Item[] = [
  { id: "straightL", label: "Straight long" }, { id: "wavyM", label: "Loose waves" },
  { id: "layers", label: "Long layers" }, { id: "bigBlowout", label: "Big blowout" },
  { id: "curtain", label: "Curtain bangs" }, { id: "halfUp", label: "Half up" },
  { id: "lowPony", label: "Low pony" }, { id: "highPony", label: "High pony" },
  { id: "lowBun", label: "Low bun" }, { id: "highBun", label: "Top bun" },
  { id: "sleekBun", label: "Sleek bun" }, { id: "messyBun", label: "Messy bun" },
  { id: "clawClip", label: "Claw clip" }, { id: "braid", label: "Side braid" },
  { id: "pigtails", label: "Twin braids" }, { id: "definedCurls", label: "Defined curls" },
  { id: "bob", label: "French bob" }, { id: "pixie", label: "Pixie" },
  { id: "shortCrop", label: "Short crop" }, { id: "taperFade", label: "Taper fade" },
  { id: "buzzCut", label: "Buzz cut" }, { id: "shaved", label: "Shaved" },
  { id: "bald", label: "Bald" },
];

export const tops: GarmentItem[] = [
  { id: "plainTee", label: "Plain tee", attrs: { sleeve: "short", len: "hip", neck: "crew", fit: "relaxed" } },
  { id: "boxyTee", label: "Boxy tee", attrs: { sleeve: "short", len: "boxy", neck: "crew", fit: "boxy" } },
  { id: "babyTee", label: "Baby tee", attrs: { sleeve: "short", len: "crop", neck: "crew", fit: "fitted" } },
  { id: "longSleeveTee", label: "Long sleeve tee", attrs: { sleeve: "long", len: "hip", neck: "crew", fit: "relaxed" } },
  { id: "ribTank", label: "Rib tank", attrs: { sleeve: "tank", len: "crop", neck: "scoop", fit: "fitted", rib: true } },
  { id: "jersey", label: "Graphic jersey", attrs: { sleeve: "short", len: "boxy", neck: "v", fit: "boxy", jersey: true } },
  { id: "sweater", label: "Chunky knit", attrs: { sleeve: "long", len: "hip", neck: "crew", fit: "relaxed", chunky: true } },
  { id: "cardigan", label: "Soft cardigan", attrs: { sleeve: "long", len: "hip", neck: "v", fit: "relaxed", placket: true, chunky: true } },
  { id: "buttonCardigan", label: "Button cardigan", attrs: { sleeve: "long", len: "hip", neck: "crew", fit: "fitted", placket: true, chunky: true } },
  { id: "button", label: "Relaxed shirt", attrs: { sleeve: "long", len: "long", neck: "collar", fit: "relaxed", placket: true } },
  { id: "flannel", label: "Flannel", attrs: { sleeve: "long", len: "hip", neck: "collar", fit: "relaxed", placket: true, pattern: "plaid" } },
  { id: "hoodie", label: "Oversized hoodie", attrs: { sleeve: "long", len: "long", neck: "crew", fit: "oversized", hood: true, pocket: true } },
  { id: "sweatshirt", label: "Oversized sweatshirt", attrs: { sleeve: "long", len: "long", neck: "crew", fit: "oversized", rib: true } },
  { id: "meshLayer", label: "Mesh layer", attrs: { sleeve: "long", len: "hip", neck: "scoop", fit: "fitted", mesh: true } },
  { id: "cropCorset", label: "Crop corset", attrs: { sleeve: "tank", len: "crop", neck: "scoop", fit: "fitted", corset: true } },
  { id: "asymKnit", label: "Asymmetric knit", attrs: { sleeve: "long", len: "hip", neck: "asym", fit: "fitted", chunky: true } },
  { id: "wrapTop", label: "Wrap top", attrs: { sleeve: "long", len: "hip", neck: "v", fit: "fitted", wrap: true } },
  { id: "slipDress", label: "Slip dress", attrs: { sleeve: "strap", len: "dress", neck: "scoop", fit: "drape", satin: true } },
  { id: "bomber", label: "Bomber jacket", attrs: { sleeve: "long", len: "boxy", neck: "crew", fit: "oversized", zip: true, rib: true } },
];

export const bottoms: GarmentItem[] = [
  { id: "straightJean", label: "Straight jeans", attrs: { type: "straight", denim: true } },
  { id: "barrelJean", label: "Barrel denim", attrs: { type: "barrel", denim: true } },
  { id: "wideDenim", label: "Wide-leg denim", attrs: { type: "wide", denim: true } },
  { id: "wideTrouser", label: "Wide trouser", attrs: { type: "wide", crease: true } },
  { id: "cargo", label: "Cargo pant", attrs: { type: "cargo" } },
  { id: "joggers", label: "Joggers", attrs: { type: "jogger" } },
  { id: "trackPant", label: "Track pant", attrs: { type: "track" } },
  { id: "parachute", label: "Parachute", attrs: { type: "parachute", ruched: true } },
  { id: "leggings", label: "Leggings", attrs: { type: "legg" } },
  { id: "bikeShorts", label: "Bike shorts", attrs: { type: "bike" } },
  { id: "shorts", label: "Relaxed shorts", attrs: { type: "shorts" } },
  { id: "jorts", label: "Baggy jorts", attrs: { type: "jorts", denim: true } },
  { id: "miniSkirt", label: "Mini skirt", attrs: { type: "skirt", mini: true } },
  { id: "midiSkirt", label: "Midi skirt", attrs: { type: "skirt", midi: true } },
  { id: "pleatedSkirt", label: "Pleated skirt", attrs: { type: "skirt", midi: true, pleated: true } },
  { id: "slipSkirt", label: "Slip skirt", attrs: { type: "skirt", midi: true, satin: true } },
  { id: "cargoMaxi", label: "Cargo maxi", attrs: { type: "skirt", maxi: true, cargo: true } },
  { id: "maxiSkirt", label: "Maxi skirt", attrs: { type: "skirt", maxi: true } },
  { id: "chinos", label: "Chinos", attrs: { type: "straight" } },
  { id: "dressPants", label: "Dress pants", attrs: { type: "straight", crease: true } },
];

export const layers: GarmentItem[] = [
  { id: "none", label: "None", attrs: { style: "none" } },
  { id: "drapedShirt", label: "Open overshirt", attrs: { style: "overshirt" } },
  { id: "denimJacket", label: "Denim jacket", attrs: { style: "denim" } },
  { id: "blazer", label: "Relaxed blazer", attrs: { style: "blazer" } },
  { id: "utility", label: "Utility vest", attrs: { style: "utility" } },
  { id: "shell", label: "Trail jacket", attrs: { style: "shell" } },
];

export const shoes: Item[] = [
  { id: "sneaker", label: "Color sneaker" }, { id: "classicSneaker", label: "Classic sneaker" },
  { id: "runner", label: "Chunky runner" }, { id: "skateShoe", label: "Skate shoe" },
  { id: "boot", label: "Platform boot" }, { id: "combatBoot", label: "Combat boot" },
  { id: "chelseaBoot", label: "Chelsea boot" }, { id: "loafer", label: "Soft loafer" },
  { id: "mary", label: "Mary Jane" }, { id: "balletFlat", label: "Ballet flat" },
  { id: "slide", label: "Cloud slide" }, { id: "hikingShoe", label: "Hiking shoe" },
];

export type Av = {
  skin: string; body: string; height: string;
  hair: string; hairColor: string; expression: string; feature: string;
  glasses: string; hearing: string; headwear: string; jewelry: string;
  tool: string; aac: string; mobility: string; carry: string;
  top: string; topColor: string; pattern: string;
  bottom: string; bottomColor: string;
  layer: string; layerColor: string; shoes: string;
};

export const defaultAv: Av = {
  skin: "#a87c58", body: "balanced", height: "medium",
  hair: "wavyM", hairColor: "#3f2b1f", expression: "smile", feature: "none",
  glasses: "none", hearing: "none", headwear: "none", jewelry: "none",
  tool: "none", aac: "none", mobility: "none", carry: "none",
  top: "boxyTee", topColor: "#e6dcc6", pattern: "none",
  bottom: "barrelJean", bottomColor: "#5a6f8c",
  layer: "none", layerColor: "#5a6f8c", shoes: "sneaker",
};

// Vibes are recipes, not images: garments + colors only. A vibe NEVER changes the
// person (skin, body, hair, face, assistive tech) — clothes are moods, identity isn't.
export const vibes: Vibe[] = [
  { id: "v_weekend", label: "Weekend Easy", tag: "Everyday", note: "soft tee, jeans, sneakers", ov: { top: "plainTee", topColor: "#e6dcc6", bottom: "straightJean", bottomColor: "#5a6f8c", layer: "none", shoes: "classicSneaker", pattern: "none" } },
  { id: "v_cozyknit", label: "Cozy Knit", tag: "Comfort", note: "chunky knit, soft trousers, loafers", ov: { top: "sweater", topColor: "#c08457", bottom: "wideTrouser", bottomColor: "#5e4334", layer: "none", shoes: "loafer", pattern: "none" } },
  { id: "v_linen", label: "Linen Calm", tag: "Everyday", note: "relaxed shirt, shorts, slides", ov: { top: "button", topColor: "#f1e9d8", bottom: "shorts", bottomColor: "#e6dcc6", layer: "none", shoes: "slide", pattern: "none" } },
  { id: "v_bookstore", label: "Bookstore Soft", tag: "Soft", note: "cardigan, midi skirt, flats", ov: { top: "cardigan", topColor: "#8aa382", bottom: "midiSkirt", bottomColor: "#5e4334", layer: "none", shoes: "balletFlat", pattern: "none" } },
  { id: "v_romantic", label: "Soft Romantic", tag: "Soft", note: "soft cardigan, cream skirt", ov: { top: "cardigan", topColor: "#d39aa3", bottom: "midiSkirt", bottomColor: "#f1e9d8", layer: "none", shoes: "mary", pattern: "none" } },
  { id: "v_ribbon", label: "Ballet Soft", tag: "Soft", note: "wrap top, pleated skirt, flats", ov: { top: "wrapTop", topColor: "#d39aa3", bottom: "pleatedSkirt", bottomColor: "#f1e9d8", layer: "none", shoes: "balletFlat", pattern: "none" } },
  { id: "v_softwrap", label: "Gentle Movement", tag: "Comfort", note: "soft knit, leggings", ov: { top: "asymKnit", topColor: "#8aa382", bottom: "leggings", bottomColor: "#3c3a38", layer: "none", shoes: "balletFlat", pattern: "none" } },
  { id: "v_tailoring", label: "Quiet Tailoring", tag: "Polished", note: "relaxed shirt, wide trousers", ov: { top: "button", topColor: "#e6dcc6", bottom: "wideTrouser", bottomColor: "#3c3a38", layer: "none", shoes: "loafer", pattern: "none" } },
  { id: "v_office", label: "Office Casual", tag: "Polished", note: "shirt and blazer, trousers", ov: { top: "button", topColor: "#8aa7bd", bottom: "dressPants", bottomColor: "#3c3a38", layer: "blazer", layerColor: "#3c3a38", shoes: "loafer", pattern: "none" } },
  { id: "v_interview", label: "Interview Ready", tag: "Polished", note: "blazer, dress pants, loafers", ov: { top: "button", topColor: "#f1e9d8", bottom: "dressPants", bottomColor: "#3c3a38", layer: "blazer", layerColor: "#5e4334", shoes: "loafer", pattern: "none" } },
  { id: "v_prep", label: "Campus Prep", tag: "Polished", note: "button-up, pleated skirt, backpack", ov: { top: "button", topColor: "#f1e9d8", bottom: "pleatedSkirt", bottomColor: "#46604b", layer: "none", shoes: "loafer", carry: "backpack", pattern: "none" } },
  { id: "v_mono", label: "Monochrome Minimal", tag: "Minimal", note: "one color, head to toe", ov: { top: "boxyTee", topColor: "#3c3a38", bottom: "wideTrouser", bottomColor: "#3c3a38", layer: "none", shoes: "classicSneaker", pattern: "none" } },
  { id: "v_softstreet", label: "Soft Street", tag: "Street", note: "hoodie, barrel denim, sneakers", ov: { top: "hoodie", topColor: "#8aa382", bottom: "barrelJean", bottomColor: "#5a6f8c", layer: "none", shoes: "sneaker", pattern: "none" } },
  { id: "v_utility", label: "Utility Street", tag: "Street", note: "bomber, cargo pants, boots", ov: { top: "bomber", topColor: "#7d8254", bottom: "cargo", bottomColor: "#3c3a38", layer: "none", shoes: "combatBoot", pattern: "none" } },
  { id: "v_skate", label: "Skate Easy", tag: "Street", note: "boxy tee, jorts, skate shoes", ov: { top: "boxyTee", topColor: "#8aa7bd", bottom: "jorts", bottomColor: "#5a6f8c", layer: "none", shoes: "skateShoe", pattern: "none" } },
  { id: "v_creative", label: "Creative Studio", tag: "Creative", note: "open overshirt, wide denim, tote", ov: { top: "plainTee", topColor: "#f1e9d8", bottom: "wideDenim", bottomColor: "#5a6f8c", layer: "drapedShirt", layerColor: "#3f8a86", shoes: "sneaker", carry: "tote", pattern: "none" } },
  { id: "v_concert", label: "Concert Night", tag: "Night", note: "corset top, dark pants, boots", ov: { top: "cropCorset", topColor: "#7a5570", bottom: "dressPants", bottomColor: "#3c3a38", layer: "none", shoes: "boot", pattern: "none" } },
  { id: "v_athleisure", label: "Athleisure", tag: "Active", note: "bomber, track pants, runners", ov: { top: "bomber", topColor: "#3c3a38", bottom: "trackPant", bottomColor: "#3c3a38", layer: "none", shoes: "runner", pattern: "none" } },
  { id: "v_trail", label: "Trail Utility", tag: "Outdoor", note: "trail jacket, cargo, hiking shoes", ov: { top: "longSleeveTee", topColor: "#e6dcc6", bottom: "cargo", bottomColor: "#5e4334", layer: "shell", layerColor: "#46604b", shoes: "hikingShoe", pattern: "none" } },
  { id: "v_studiomove", label: "Studio Move", tag: "Active", note: "mesh layer, track pants", ov: { top: "meshLayer", topColor: "#3c3a38", bottom: "trackPant", bottomColor: "#3c3a38", layer: "none", shoes: "runner", pattern: "none" } },
  { id: "v_airport", label: "Airport Fit", tag: "Comfort", note: "sweatshirt, joggers, slides", ov: { top: "sweatshirt", topColor: "#e6dcc6", bottom: "joggers", bottomColor: "#5e4334", layer: "none", shoes: "slide", carry: "crossbody", pattern: "none" } },
  { id: "v_satin", label: "Satin Evening", tag: "Night", note: "slip dress, soft shoes", ov: { top: "slipDress", topColor: "#7a5570", bottom: "slipSkirt", bottomColor: "#7a5570", layer: "none", shoes: "mary", pattern: "none" } },
  { id: "v_downtown", label: "Downtown", tag: "Night", note: "corset, dark jeans, boots", ov: { top: "cropCorset", topColor: "#3c3a38", bottom: "straightJean", bottomColor: "#3c3a38", layer: "none", shoes: "boot", pattern: "none" } },
  { id: "v_familyParty", label: "Family Party", tag: "Night", note: "wrap top, midi skirt, comfortable shoes", ov: { top: "wrapTop", topColor: "#d39aa3", bottom: "midiSkirt", bottomColor: "#7a5570", layer: "none", shoes: "mary", pattern: "none" } },
];

// Resolve avatar state (+ optional override) into dmFigure options.
export function buildOpts(av: Av, ov?: Partial<Av>): Record<string, any> {
  const a = { ...av, ...(ov || {}) };
  const t = (tops.find((x) => x.id === a.top) || tops[0]).attrs;
  const b = (bottoms.find((x) => x.id === a.bottom) || bottoms[0]).attrs;
  const ly = layers.find((x) => x.id === a.layer);
  return {
    skin: a.skin, hair: a.hair, hairColor: a.hairColor, expression: a.expression,
    feature: a.feature, glasses: a.glasses, hearing: a.hearing, headwear: a.headwear,
    jewelry: a.jewelry, tool: a.tool, aac: a.aac, mobility: a.mobility,
    carry: a.carry, body: a.body, height: a.height,
    top: { ...t, pattern: t.pattern || a.pattern }, topColor: a.topColor,
    bottom: { ...b }, bottomColor: a.bottomColor,
    layer: ly ? ly.attrs : { style: "none" }, layerColor: a.layerColor,
    shoes: a.shoes,
  };
}

const R = <T,>(a: T[]) => a[Math.floor(Math.random() * a.length)];
const some = (arr: Item[], p: number) => (Math.random() < p ? R(arr.filter((x) => x.id !== "none")).id : "none");

// Randomized non-default look (shuffle writes random *state*; render stays
// deterministic). Assistive tech and cultural expression appear at ordinary,
// unremarkable rates — present in the world, never a spectacle.
export function shuffleAv(prev: Av): Av {
  return {
    ...prev,
    skin: R(skins).v, hair: R(hairStyles).id, hairColor: R(hairColors).v,
    body: R(bodyShapes).id, height: R(heights).id,
    expression: R(expressions).id,
    feature: some(features, 0.22),
    top: R(tops).id, topColor: R(garmentColors).v,
    bottom: R(bottoms).id, bottomColor: R(garmentColors).v,
    layer: some(layers, 0.35), layerColor: R(garmentColors).v,
    shoes: R(shoes).id, pattern: "none",
    glasses: some(glasses, 0.28), hearing: some(hearing, 0.12),
    headwear: some(headwear, 0.12), jewelry: some(jewelry, 0.3),
    tool: some(tools, 0.1), aac: some(aacs, 0.08), mobility: some(mobilities, 0.07),
    carry: some(carries, 0.25),
  };
}
