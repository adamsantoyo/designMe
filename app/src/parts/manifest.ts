import type { Av } from "../dm";

export type PartCategory =
  | "aac"
  | "accessory"
  | "body"
  | "bottom"
  | "brow"
  | "carry"
  | "eye"
  | "faceShape"
  | "feature"
  | "glasses"
  | "hair"
  | "headwear"
  | "hearing"
  | "jewelry"
  | "lip"
  | "makeup"
  | "mobility"
  | "nose"
  | "shoe"
  | "tool"
  | "top";

export type PartScope = "full" | "bust";
export type TintMode = "fixed" | "multiply";

export type PartManifestItem = {
  category: PartCategory;
  id: string;
  slot: string;
  scope: PartScope;
  tintMode: TintMode;
  z: number;
  bakedColorId?: string;
};

export type LayerSlotSpec = {
  slot: string;
  category: PartCategory;
  idFrom: keyof Av;
  tintFrom?: keyof Av;
};

// Back -> front. The first lovable slice intentionally registers only a small
// subset of the catalog; unsupported catalog ids stay invisible in PNG mode until
// real art is approved and added here.
export const PART_MANIFEST: PartManifestItem[] = [
  { category: "mobility", id: "wheelchair", slot: "mobility", scope: "full", tintMode: "fixed", z: 0, bakedColorId: "warmConsumerCharcoal" },
  { category: "body", id: "balanced", slot: "body", scope: "full", tintMode: "multiply", z: 10 },
  { category: "faceShape", id: "oval", slot: "faceShape", scope: "bust", tintMode: "multiply", z: 14 },
  { category: "bottom", id: "barrelJean", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "shoe", id: "classicSneaker", slot: "shoes", scope: "full", tintMode: "fixed", z: 30, bakedColorId: "warmWhiteLeather" },
  { category: "top", id: "hoodie", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "makeup", id: "natural", slot: "makeup", scope: "bust", tintMode: "multiply", z: 48 },
  // face parts ship full-frame (SkiaFigure has no bust mapping); eye is fixed —
  // the split asset carries natural iris/lash color, and multiply would tint sclera
  { category: "eye", id: "almond", slot: "eye", scope: "full", tintMode: "fixed", z: 52 },
  { category: "brow", id: "soft", slot: "brow", scope: "full", tintMode: "fixed", z: 54, bakedColorId: "softInk" },
  { category: "nose", id: "rounded", slot: "nose", scope: "full", tintMode: "fixed", z: 56, bakedColorId: "softInk" },
  { category: "lip", id: "soft", slot: "lip", scope: "full", tintMode: "fixed", z: 58, bakedColorId: "mutedLip" },
  { category: "hair", id: "wavyM", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "definedCurls", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  // ---- P0 catalog (2026-07-03) — z per art-bible §4 back-to-front ----
  { category: "aac", id: "board", slot: "aac", scope: "full", tintMode: "fixed", z: 90 },
  { category: "aac", id: "letterboard", slot: "aac", scope: "full", tintMode: "fixed", z: 90 },
  { category: "aac", id: "tablet", slot: "aac", scope: "full", tintMode: "fixed", z: 90 },
  { category: "accessory", id: "headscarf", slot: "headwear", scope: "full", tintMode: "multiply", z: 75 },
  { category: "body", id: "broad", slot: "body", scope: "full", tintMode: "multiply", z: 10 },
  { category: "body", id: "curves", slot: "body", scope: "full", tintMode: "multiply", z: 10 },
  { category: "body", id: "full", slot: "body", scope: "full", tintMode: "multiply", z: 10 },
  { category: "body", id: "lean", slot: "body", scope: "full", tintMode: "multiply", z: 10 },
  { category: "bottom", id: "cargo", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "joggers", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "leggings", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "midiSkirt", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "shorts", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "straightJean", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "wideDenim", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "wideTrouser", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "brow", id: "bold", slot: "brow", scope: "full", tintMode: "fixed", z: 54 },
  { category: "brow", id: "fine", slot: "brow", scope: "full", tintMode: "fixed", z: 54 },
  { category: "brow", id: "straight", slot: "brow", scope: "full", tintMode: "fixed", z: 54 },
  { category: "carry", id: "backpack", slot: "carry", scope: "full", tintMode: "fixed", z: 45 },
  { category: "carry", id: "crossbody", slot: "carry", scope: "full", tintMode: "fixed", z: 45 },
  { category: "carry", id: "tote", slot: "carry", scope: "full", tintMode: "fixed", z: 45 },
  { category: "eye", id: "hooded", slot: "eye", scope: "full", tintMode: "fixed", z: 52 },
  { category: "eye", id: "wide", slot: "eye", scope: "full", tintMode: "fixed", z: 52 },
  { category: "faceShape", id: "diamond", slot: "faceShape", scope: "full", tintMode: "multiply", z: 14 },
  { category: "faceShape", id: "heart", slot: "faceShape", scope: "full", tintMode: "multiply", z: 14 },
  { category: "faceShape", id: "long", slot: "faceShape", scope: "full", tintMode: "multiply", z: 14 },
  { category: "faceShape", id: "round", slot: "faceShape", scope: "full", tintMode: "multiply", z: 14 },
  { category: "faceShape", id: "square", slot: "faceShape", scope: "full", tintMode: "multiply", z: 14 },
  { category: "feature", id: "birthmark", slot: "feature", scope: "full", tintMode: "fixed", z: 50 },
  { category: "feature", id: "blush", slot: "feature", scope: "full", tintMode: "fixed", z: 50 },
  { category: "feature", id: "freckles", slot: "feature", scope: "full", tintMode: "fixed", z: 50 },
  { category: "feature", id: "scar", slot: "feature", scope: "full", tintMode: "fixed", z: 50 },
  { category: "feature", id: "vitiligo", slot: "feature", scope: "full", tintMode: "fixed", z: 50 },
  { category: "glasses", id: "rect", slot: "glasses", scope: "full", tintMode: "fixed", z: 80 },
  { category: "glasses", id: "round", slot: "glasses", scope: "full", tintMode: "fixed", z: 80 },
  { category: "hair", id: "bigBlowout", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "bob", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "braid", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "clawClip", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "curtain", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "halfUp", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "highBun", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "highPony", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "layers", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "lowBun", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "lowPony", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "messyBun", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "pigtails", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "sleekBun", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "straightL", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hearing", id: "ci_both", slot: "hearing", scope: "full", tintMode: "fixed", z: 59 },
  { category: "hearing", id: "ha_l", slot: "hearing", scope: "full", tintMode: "fixed", z: 59 },
  { category: "hearing", id: "ha_r", slot: "hearing", scope: "full", tintMode: "fixed", z: 59 },
  { category: "lip", id: "bow", slot: "lip", scope: "full", tintMode: "fixed", z: 58 },
  { category: "lip", id: "full", slot: "lip", scope: "full", tintMode: "fixed", z: 58 },
  { category: "lip", id: "petite", slot: "lip", scope: "full", tintMode: "fixed", z: 58 },
  { category: "lip", id: "wide", slot: "lip", scope: "full", tintMode: "fixed", z: 58 },
  { category: "makeup", id: "bold", slot: "makeup", scope: "full", tintMode: "multiply", z: 48 },
  { category: "makeup", id: "glam", slot: "makeup", scope: "full", tintMode: "multiply", z: 48 },
  { category: "makeup", id: "graphic", slot: "makeup", scope: "full", tintMode: "multiply", z: 48 },
  { category: "makeup", id: "lashes", slot: "makeup", scope: "full", tintMode: "multiply", z: 48 },
  { category: "makeup", id: "liner", slot: "makeup", scope: "full", tintMode: "multiply", z: 48 },
  { category: "makeup", id: "smoky", slot: "makeup", scope: "full", tintMode: "multiply", z: 48 },
  { category: "mobility", id: "cane", slot: "mobility", scope: "full", tintMode: "fixed", z: 88 },
  { category: "mobility", id: "walker", slot: "mobility", scope: "full", tintMode: "fixed", z: 86 },
  { category: "nose", id: "button", slot: "nose", scope: "full", tintMode: "fixed", z: 56 },
  { category: "nose", id: "long", slot: "nose", scope: "full", tintMode: "fixed", z: 56 },
  { category: "nose", id: "narrow", slot: "nose", scope: "full", tintMode: "fixed", z: 56 },
  { category: "nose", id: "wide", slot: "nose", scope: "full", tintMode: "fixed", z: 56 },
  { category: "shoe", id: "loafer", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "shoe", id: "mary", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "shoe", id: "runner", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "shoe", id: "slide", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "shoe", id: "sneaker", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "tool", id: "noiseHeadphones", slot: "tool", scope: "full", tintMode: "fixed", z: 82 },
  { category: "top", id: "boxyTee", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "button", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "cardigan", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "drapedShirt", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "longSleeveTee", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "plainTee", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "ribTank", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "sweater", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "sweatshirt", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  // ---- Premium coverage batch (2026-07-07) — the remaining svgRegistry parts, z/tint
  // per the same back-to-front + neutral-master conventions as the block above. Brings
  // manifest 98 -> 152; the two known-broken traces (hair/shaved, tool/medicalBracelet)
  // and the 4 never-generated ids stay unmanifested on purpose (hidden in premium mode).
  { category: "aac", id: "ipad", slot: "aac", scope: "full", tintMode: "fixed", z: 90 },
  { category: "accessory", id: "baseballCap", slot: "headwear", scope: "full", tintMode: "multiply", z: 75 },
  { category: "accessory", id: "beanie", slot: "headwear", scope: "full", tintMode: "multiply", z: 75 },
  { category: "accessory", id: "bucketHat", slot: "headwear", scope: "full", tintMode: "multiply", z: 75 },
  { category: "bottom", id: "bikeShorts", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "cargoMaxi", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "chinos", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "dressPants", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "jorts", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "maxiSkirt", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "miniSkirt", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "parachute", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "pleatedSkirt", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "slipSkirt", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "bottom", id: "trackPant", slot: "bottom", scope: "full", tintMode: "multiply", z: 20 },
  { category: "brow", id: "arched", slot: "brow", scope: "full", tintMode: "fixed", z: 54 },
  { category: "carry", id: "beltbag", slot: "carry", scope: "full", tintMode: "fixed", z: 45 },
  { category: "carry", id: "canvasTote", slot: "carry", scope: "full", tintMode: "fixed", z: 45 },
  { category: "carry", id: "gymBag", slot: "carry", scope: "full", tintMode: "fixed", z: 45 },
  { category: "carry", id: "laptopBag", slot: "carry", scope: "full", tintMode: "fixed", z: 45 },
  { category: "carry", id: "messenger", slot: "carry", scope: "full", tintMode: "fixed", z: 45 },
  { category: "carry", id: "mini", slot: "carry", scope: "full", tintMode: "fixed", z: 45 },
  { category: "glasses", id: "cat", slot: "glasses", scope: "full", tintMode: "fixed", z: 80 },
  { category: "glasses", id: "thickFrame", slot: "glasses", scope: "full", tintMode: "fixed", z: 80 },
  { category: "glasses", id: "tinted", slot: "glasses", scope: "full", tintMode: "fixed", z: 80 },
  { category: "hair", id: "pixie", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "shortCrop", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  { category: "hair", id: "taperFade", slot: "hair", scope: "full", tintMode: "multiply", z: 60 },
  // jewelry has no tintFrom (LAYER_SLOTS) so it always renders as-drawn metallic; the
  // three z-tiers place neck / ear / wrist pieces relative to garments and hair.
  { category: "jewelry", id: "chain", slot: "jewelry", scope: "full", tintMode: "fixed", z: 46 },
  { category: "jewelry", id: "studs", slot: "jewelry", scope: "full", tintMode: "fixed", z: 59 },
  { category: "jewelry", id: "hoops", slot: "jewelry", scope: "full", tintMode: "fixed", z: 59 },
  { category: "jewelry", id: "pearl", slot: "jewelry", scope: "full", tintMode: "fixed", z: 59 },
  { category: "jewelry", id: "watch", slot: "jewelry", scope: "full", tintMode: "fixed", z: 84 },
  { category: "jewelry", id: "rings", slot: "jewelry", scope: "full", tintMode: "fixed", z: 84 },
  { category: "shoe", id: "balletFlat", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "shoe", id: "boot", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "shoe", id: "chelseaBoot", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "shoe", id: "combatBoot", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "shoe", id: "hikingShoe", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "shoe", id: "skateShoe", slot: "shoes", scope: "full", tintMode: "fixed", z: 30 },
  { category: "tool", id: "headphones", slot: "tool", scope: "full", tintMode: "fixed", z: 82 },
  { category: "top", id: "asymKnit", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "babyTee", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "blazer", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "bomber", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "buttonCardigan", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "cropCorset", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "denimJacket", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "flannel", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "jersey", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "shell", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "slipDress", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "utility", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
  { category: "top", id: "wrapTop", slot: "top", scope: "full", tintMode: "multiply", z: 40 },
];

export const LAYER_SLOTS: LayerSlotSpec[] = [
  { slot: "mobility", category: "mobility", idFrom: "mobility" },
  { slot: "body", category: "body", idFrom: "body", tintFrom: "skin" },
  { slot: "faceShape", category: "faceShape", idFrom: "faceShape", tintFrom: "skin" },
  { slot: "bottom", category: "bottom", idFrom: "bottom", tintFrom: "bottomColor" },
  { slot: "shoes", category: "shoe", idFrom: "shoes" },
  { slot: "top", category: "top", idFrom: "top", tintFrom: "topColor" },
  { slot: "layer", category: "top", idFrom: "layer", tintFrom: "layerColor" },
  { slot: "carry", category: "carry", idFrom: "carry" },
  { slot: "makeup", category: "makeup", idFrom: "makeup", tintFrom: "makeupColor" },
  { slot: "eye", category: "eye", idFrom: "eye", tintFrom: "eyeColor" },
  { slot: "brow", category: "brow", idFrom: "brow", tintFrom: "hairColor" },
  { slot: "nose", category: "nose", idFrom: "nose" },
  { slot: "lip", category: "lip", idFrom: "lip" },
  { slot: "hair", category: "hair", idFrom: "hair", tintFrom: "hairColor" },
  { slot: "feature", category: "feature", idFrom: "feature" },
  { slot: "hearing", category: "hearing", idFrom: "hearing" },
  { slot: "headwear", category: "accessory", idFrom: "headwear", tintFrom: "topColor" },
  { slot: "tool", category: "tool", idFrom: "tool" },
  { slot: "glasses", category: "glasses", idFrom: "glasses" },
  { slot: "jewelry", category: "jewelry", idFrom: "jewelry" },
  { slot: "aac", category: "aac", idFrom: "aac" },
];

export const partKey = (category: PartCategory, id: string) => `${category}/${id}`;

const MANIFEST_BY_KEY = new Map(PART_MANIFEST.map((item) => [partKey(item.category, item.id), item]));

export const manifestItem = (key: string): PartManifestItem | undefined => MANIFEST_BY_KEY.get(key);

