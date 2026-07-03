import type { Av } from "../dm";

export type PartCategory =
  | "aac"
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
  { slot: "headwear", category: "headwear", idFrom: "headwear", tintFrom: "topColor" },
  { slot: "tool", category: "tool", idFrom: "tool" },
  { slot: "glasses", category: "glasses", idFrom: "glasses" },
  { slot: "jewelry", category: "jewelry", idFrom: "jewelry" },
  { slot: "aac", category: "aac", idFrom: "aac" },
];

export const partKey = (category: PartCategory, id: string) => `${category}/${id}`;

const MANIFEST_BY_KEY = new Map(PART_MANIFEST.map((item) => [partKey(item.category, item.id), item]));

export const manifestItem = (key: string): PartManifestItem | undefined => MANIFEST_BY_KEY.get(key);

