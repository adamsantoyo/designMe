// designMe — Avatar Studio (the main screen).
// Full-bleed stage where the avatar IS the menu: on-body chips open calm bottom
// sheets, and the deterministic engine renders every preview. Visual language is
// the design-system "premium-calm" system: warm paper, radial-lit mat, one signature
// easing, warm shadows, settle/breathe micro-motion (all reduced-motion-gated).

import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
  Easing,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import SvgString from "./SvgString";
import { theme } from "./theme";
import AvatarCanvas from "./AvatarCanvas";
import ThisOrThat from "./ThisOrThat";
import UIPressable from "./ui/Pressable";
import { Hairline, RadialMat } from "./ui/TopHighlight";
import OptionTile from "./ui/OptionTile";
import ColorSwatch from "./ui/ColorSwatch";
import useReducedMotion from "./useReducedMotion";
import * as DM from "./dm";
import type { Av } from "./dm";

type Region = "hair" | "face" | "body" | "top" | "bottom" | "shoes" | "extras";
type SavedLook = { id: string; savedAt: number; av: Av };
type ColorRow = { key: string; title: string; colors: { v: string; sel: boolean; onTap: () => void; aria: string }[] };
type Tile = {
  key: string;
  label: string;
  aria: string;
  ov: Partial<Av>;
  crop?: string;
  sel: boolean;
  onTap: () => void;
};

// v2: catalog ids moved to the item bible (docs/catalog-bible.md); v1 data used
// retired ids and would render wrong, so v2 starts clean.
const LOOKBOOK_KEY = "designMe.lookbook.v2";
const CURRENT_AV_KEY = "designMe.currentAv.v2";
const EXPLORED_KEY = "designMe.explored.v1";
const LOOKBOOK_CAP = 24;
const AV_KEYS: (keyof Av)[] = [
  "skin", "body", "height", "hair", "hairColor", "expression", "feature",
  "glasses", "hearing", "headwear", "jewelry", "tool", "aac", "mobility",
  "carry", "top", "topColor", "pattern",
  "bottom", "bottomColor", "layer", "layerColor", "shoes",
];

const META: Record<Region, { title: string; hint: string }> = {
  hair: { title: "Hair", hint: "Tap a style" },
  face: { title: "Face", hint: "Skin tone, expression, and features" },
  body: { title: "Body", hint: "Body shape first, then height" },
  top: { title: "Top", hint: "Tops first, then outer layers" },
  bottom: { title: "Bottom", hint: "Tap to try it on" },
  shoes: { title: "Shoes", hint: "Tap to try them on" },
  extras: { title: "Extras", hint: "Everything you carry and wear" },
};

const CROP = {
  FACE: "90 32 60 62",
  HAIR: "74 14 92 94",
  TOP: "46 94 148 172",
  BOT: "56 236 128 152",
  SHOE: "68 416 104 78",
  EX: "84 28 72 104",
  CAR: "44 96 152 188",
};

const CHIP_POS: Record<Region, [number, number]> = {
  hair: [68, 5],
  face: [25, 12],
  body: [15, 36],
  extras: [77, 20],
  top: [82, 32],
  bottom: [19, 60],
  shoes: [70, 92],
};
const CHIP_LABEL: Record<Region, string> = {
  hair: "Hair",
  face: "Face",
  body: "Body",
  extras: "Extras",
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
};
const ZONE_RECT: Partial<Record<Region, [number, number, number, number]>> = {
  hair: [35.8, 3.7, 28.3, 8.5],
  face: [38, 12, 24, 9],
  top: [22, 19.6, 56, 31],
  bottom: [24, 51, 52, 25],
  shoes: [30, 86, 40, 13.5],
};

const HDR = 96;
const TRAY_H = 400;
const BEZ = Easing.bezier(...theme.motion.bezier);

// Extras are grouped into calm sub-tabs — never 37 tiles in one undifferentiated row.
const EXTRA_GROUPS: { key: string; label: string; list: DM.Item[]; dim: keyof Av; crop: string }[] = [
  { key: "glasses", label: "Glasses", list: DM.glasses, dim: "glasses", crop: CROP.EX },
  { key: "hearing", label: "Hearing", list: DM.hearing, dim: "hearing", crop: CROP.EX },
  { key: "headwear", label: "Headwear", list: DM.headwear, dim: "headwear", crop: CROP.HAIR },
  { key: "jewelry", label: "Jewelry", list: DM.jewelry, dim: "jewelry", crop: CROP.EX },
  { key: "tool", label: "Tools", list: DM.tools, dim: "tool", crop: CROP.EX },
  { key: "aac", label: "AAC", list: DM.aacs, dim: "aac", crop: CROP.CAR },
  { key: "mobility", label: "Mobility", list: DM.mobilities, dim: "mobility", crop: "" }, // full figure — the device IS the item
  { key: "carry", label: "Bags", list: DM.carries, dim: "carry", crop: CROP.CAR },
];

const ICON: Record<string, string> = {
  hair: '<path d="M4 13.5C4 8.3 7.6 5 12 5s8 3.3 8 8.5"/><path d="M6.5 13.5c.8 2.2 2.8 3.8 5.5 3.8s4.7-1.6 5.5-3.8"/><path d="M9 9.6c.7.8 1.8 1.3 3 1.3s2.3-.5 3-1.3"/>',
  face: '<circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c.9 1.2 2.1 1.8 3.5 1.8s2.6-.6 3.5-1.8"/><path d="M9 9.5h.01"/><path d="M15 9.5h.01"/>',
  body: '<path d="M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z"/><path d="M8 20v-5.5L6 12l2.7-1.7h6.6L18 12l-2 2.5V20"/><path d="M9.5 20h5"/>',
  top: '<path d="M8.6 4 5 7.2l2.1 2.1V20h9.8V9.3L19 7.2 15.4 4l-2.1 1.7h-2.6L8.6 4Z"/>',
  bottom: '<path d="M7 3h10l.5 6-1.2 12h-3.6L12 11l-.7 10H7.7L6.5 9 7 3Z"/>',
  shoes: '<path d="M3 9h2.6L7.2 12H14c2.8 0 5 1.5 5 4v1H3V9Z"/><path d="M3 17h16"/>',
  extras: '<path d="M12 3l1.7 4.3L18 9l-4.3 1.7L12 15l-1.7-4.3L6 9l4.3-1.7L12 3Z"/><path d="M18.5 14.2l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"/>',
  shuffle: '<path d="m18 14 4 4-4 4"/><path d="m18 2 4 4-4 4"/><path d="M2 18h1.97a4 4 0 0 0 3.3-1.76l5.46-8.48A4 4 0 0 1 16.03 6H22"/><path d="M2 6h1.97a4 4 0 0 1 3.3 1.76l5.46 8.48A4 4 0 0 0 16.03 18H22"/>',
  heart: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.29 1.49 4.04 3 5.5l7 7Z"/>',
  looks: '<path d="M5 5.5A2.5 2.5 0 0 1 7.5 3h9A2.5 2.5 0 0 1 19 5.5v13l-7-3.5-7 3.5v-13Z"/><path d="M8.5 7.5h7"/><path d="M8.5 10.5h5"/>',
  undo: '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  vibe: '<rect x="3" y="5" width="8" height="14" rx="2.5"/><rect x="13" y="5" width="8" height="14" rx="2.5"/><path d="M7 11v2M17 11v2"/>',
};
const svgIcon = (name: string, stroke: string, sw = 2) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;
const Icon = ({ name, stroke, size = 24, sw = 2 }: { name: string; stroke: string; size?: number; sw?: number }) => (
  <SvgString xml={svgIcon(name, stroke, sw)} width={size} height={size} />
);

const copyAv = (av: Av): Av => {
  const out = {} as Av;
  for (const k of AV_KEYS) (out as any)[k] = av[k];
  return out;
};

const avKey = (av: Av) => JSON.stringify(copyAv(av));
const isAv = (value: unknown): value is Av =>
  !!value && typeof value === "object" && AV_KEYS.every((key) => typeof (value as Record<string, unknown>)[key] === "string");

function parseLooks(raw: string | null): SavedLook[] {
  if (!raw) return [];
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) return [];

  const out: SavedLook[] = [];
  const seen = new Set<string>();
  for (const item of parsed) {
    if (!item || typeof item !== "object" || !isAv((item as any).av)) continue;
    const av = copyAv((item as any).av);
    const key = avKey(av);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      id: typeof (item as any).id === "string" ? (item as any).id : `${Date.now()}-${out.length}`,
      savedAt: typeof (item as any).savedAt === "number" ? (item as any).savedAt : Date.now(),
      av,
    });
    if (out.length >= LOOKBOOK_CAP) break;
  }
  return out;
}

const lookLabel = (t: number) => {
  const d = new Date(t);
  return d.toDateString() === new Date().toDateString()
    ? "Saved today"
    : d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function AvatarStudio() {
  const [av, setAv] = useState<Av>(() => DM.shuffleAv(DM.defaultAv));
  const [region, setRegion] = useState<Region | null>(null);
  const [extrasTab, setExtrasTab] = useState(EXTRA_GROUPS[0].key);
  const [history, setHistory] = useState<Av[]>([]);
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [lookbookOpen, setLookbookOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const [engineMode, setEngineMode] = useState<"svg" | "png">("svg");
  const [hydrated, setHydrated] = useState(false);
  const [vibeOpen, setVibeOpen] = useState(false);
  const [explored, setExplored] = useState(true); // true until storage says otherwise
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  const { width: W, height: H } = useWindowDimensions();
  const settle = useRef(new Animated.Value(1)).current;
  const breathe = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const pulseLoop = useRef<Animated.CompositeAnimation | null>(null);
  const tray = useRef(new Animated.Value(0)).current;
  const lookbook = useRef(new Animated.Value(0)).current;
  const toastA = useRef(new Animated.Value(0)).current;
  const stageFade = useRef(new Animated.Value(0)).current;

  function showToast(message: string) {
    setToast(message);
    // aria-live covers web; VoiceOver on iOS needs an explicit announcement.
    if (Platform.OS !== "web") AccessibilityInfo.announceForAccessibility(message);
    if (reduceMotion) toastA.setValue(1);
    else Animated.timing(toastA, { toValue: 1, duration: theme.motion.dur.base, easing: BEZ, useNativeDriver: false }).start();
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      if (reduceMotion) {
        toastA.setValue(0);
        setToast(null);
        return;
      }
      Animated.timing(toastA, { toValue: 0, duration: theme.motion.dur.base, easing: BEZ, useNativeDriver: false })
        .start(() => setToast(null));
    }, 2600);
  }

  useEffect(() => () => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
  }, []);

  useEffect(() => {
    let mounted = true;
    AsyncStorage.getItem(LOOKBOOK_KEY)
      .then((raw) => {
        if (mounted) setLooks(parseLooks(raw));
      })
      .catch(() => {
        if (mounted) showToast("Could not load saved looks");
      });
    AsyncStorage.getItem(EXPLORED_KEY)
      .then((raw) => {
        if (mounted) setExplored(raw === "1");
      })
      .catch(() => {});
    // Restore the avatar the user was wearing — their person shouldn't vanish on
    // relaunch. First run (nothing stored / invalid) keeps the randomized start.
    AsyncStorage.getItem(CURRENT_AV_KEY)
      .then((raw) => {
        if (!mounted || !raw) return;
        const parsed = JSON.parse(raw);
        if (isAv(parsed)) setAv(copyAv(parsed));
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setHydrated(true);
      });
    return () => {
      mounted = false;
    };
  }, []);

  // Persist the worn avatar after hydration (so the stored look isn't clobbered by
  // the pre-restore shuffle).
  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(CURRENT_AV_KEY, JSON.stringify(copyAv(av))).catch(() => {});
  }, [av, hydrated]);

  // Fade the stage in once hydrated — no white flash, no person-swap.
  useEffect(() => {
    if (!hydrated) return;
    if (reduceMotion) {
      stageFade.setValue(1);
      return;
    }
    Animated.timing(stageFade, { toValue: 1, duration: theme.motion.dur.slow, easing: BEZ, useNativeDriver: false }).start();
  }, [hydrated, reduceMotion, stageFade]);

  // The designed "settle": tiny overshoot then rest, on every avatar change.
  useEffect(() => {
    if (reduceMotion || bump === 0) {
      settle.setValue(1);
      return;
    }
    settle.setValue(0.992);
    Animated.sequence([
      Animated.timing(settle, { toValue: 1.012, duration: 168, easing: BEZ, useNativeDriver: false }),
      Animated.timing(settle, { toValue: 1, duration: 252, easing: BEZ, useNativeDriver: false }),
    ]).start();
  }, [bump, reduceMotion, settle]);

  // Idle liveness: the avatar breathes gently at rest.
  useEffect(() => {
    if (reduceMotion) {
      breathe.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, { toValue: 1, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(breathe, { toValue: 0, duration: 3000, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [reduceMotion, breathe]);

  // Breathing hint on the chips until the first region tap — invites, never nags.
  useEffect(() => {
    pulseLoop.current?.stop();
    if (explored || reduceMotion) {
      pulse.setValue(0);
      return;
    }
    pulseLoop.current = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
        Animated.timing(pulse, { toValue: 0, duration: 1300, easing: Easing.inOut(Easing.sin), useNativeDriver: false }),
      ]),
    );
    pulseLoop.current.start();
    return () => pulseLoop.current?.stop();
  }, [explored, reduceMotion, pulse]);

  useEffect(() => {
    const toValue = region ? 1 : 0;
    if (reduceMotion) {
      tray.setValue(toValue);
      return;
    }
    Animated.timing(tray, { toValue, duration: theme.motion.dur.slow, easing: BEZ, useNativeDriver: false }).start();
  }, [region, reduceMotion, tray]);

  useEffect(() => {
    const toValue = lookbookOpen ? 1 : 0;
    if (reduceMotion) {
      lookbook.setValue(toValue);
      return;
    }
    Animated.timing(lookbook, { toValue, duration: theme.motion.dur.slow, easing: BEZ, useNativeDriver: false }).start();
  }, [lookbookOpen, lookbook, reduceMotion]);

  // The card must fit the space *left over* when a tray is open — otherwise the
  // page overflows and the browser scrolls the header (Save/Shuffle/Undo) off-screen.
  const sheetOpen = !!region || lookbookOpen;
  const stageH = H - HDR - (sheetOpen ? TRAY_H - 40 : 0);
  let cardH = Math.min(stageH - 36, 780);
  let cardW = (cardH * 62) / 100;
  const maxW = W - 48;
  if (cardW > maxW) {
    cardW = maxW;
    cardH = (cardW * 100) / 62;
  }
  const wrapH = cardH * 0.9;
  const wrapW = (wrapH * 240) / 490;
  const trayTranslate = tray.interpolate({ inputRange: [0, 1], outputRange: [TRAY_H + 28, 0] });
  const lookbookTranslate = lookbook.interpolate({ inputRange: [0, 1], outputRange: [TRAY_H + 28, 0] });
  const scrimOpacity = Animated.add(tray, lookbook).interpolate({ inputRange: [0, 1], outputRange: [0, 0.3], extrapolate: "clamp" });
  const breatheY = breathe.interpolate({ inputRange: [0, 1], outputRange: [0, -4] });
  const chipPulseOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.55] });

  const persistLooks = (next: SavedLook[]) => {
    AsyncStorage.setItem(LOOKBOOK_KEY, JSON.stringify(next))
      .catch(() => showToast("Could not save look"));
  };

  const apply = (patch: Partial<Av>) => {
    setHistory((h) => [...h, copyAv(av)].slice(-40));
    setAv((a) => ({ ...a, ...patch }));
    setBump((b) => b + 1);
  };
  const undo = () => {
    setHistory((h) => {
      if (!h.length) return h;
      setAv(copyAv(h[h.length - 1]));
      setBump((b) => b + 1);
      return h.slice(0, -1);
    });
  };
  const shuffle = () => {
    setHistory((h) => [...h, copyAv(av)].slice(-40));
    setAv((a) => DM.shuffleAv(a));
    setBump((b) => b + 1);
  };
  const save = () => {
    const snapshot = copyAv(av);
    const snapshotKey = avKey(snapshot);
    setLooks((prev) => {
      const existing = prev.find((look) => avKey(look.av) === snapshotKey);
      const saved: SavedLook = existing
        ? { ...existing, savedAt: Date.now(), av: snapshot }
        : { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, savedAt: Date.now(), av: snapshot };
      const next = [saved, ...prev.filter((look) => avKey(look.av) !== snapshotKey)].slice(0, LOOKBOOK_CAP);
      persistLooks(next);
      return next;
    });
    showToast("Saved to your lookbook");
  };
  const wearLook = (look: SavedLook) => {
    setHistory((h) => [...h, copyAv(av)].slice(-40));
    setAv(copyAv(look.av));
    setLookbookOpen(false);
    setBump((b) => b + 1);
    showToast("Look restored");
  };
  const openLooks = () => {
    setRegion(null);
    setLookbookOpen(true);
  };
  const selectRegion = (r: Region) => {
    if (!explored) {
      setExplored(true);
      AsyncStorage.setItem(EXPLORED_KEY, "1").catch(() => {});
    }
    setLookbookOpen(false);
    if (r === "extras" && region !== "extras") {
      const worn = EXTRA_GROUPS.find((g) => (av as any)[g.dim] !== "none");
      setExtrasTab((worn || EXTRA_GROUPS[0]).key);
    }
    setRegion((cur) => (cur === r ? null : r));
  };
  const closeSheets = () => {
    setRegion(null);
    setLookbookOpen(false);
  };

  const colorRowsFor = (r: Region): ColorRow[] => {
    const mk = (list: DM.ColorOpt[], sel: string, key: keyof Av, title: string) =>
      list.map((c) => ({ v: c.v, aria: `${title}: ${c.label}`, sel: sel === c.v, onTap: () => apply({ [key]: c.v } as Partial<Av>) }));
    if (r === "hair") return [{ key: "hairColor", title: "Hair color", colors: mk(DM.hairColors, av.hairColor, "hairColor", "Hair color") }];
    if (r === "face") return [{ key: "skin", title: "Skin tone", colors: mk(DM.skins, av.skin, "skin", "Skin tone") }];
    if (r === "bottom") return [{ key: "bottomColor", title: "Bottom color", colors: mk(DM.garmentColors, av.bottomColor, "bottomColor", "Bottom color") }];
    if (r === "top") {
      const rows: ColorRow[] = [
        { key: "topColor", title: "Top color", colors: mk(DM.garmentColors, av.topColor, "topColor", "Top color") },
      ];
      if (av.layer !== "none") {
        rows.push({ key: "layerColor", title: "Layer color", colors: mk(DM.garmentColors, av.layerColor, "layerColor", "Layer color") });
      }
      return rows;
    }
    return [];
  };

  const tilesFor = (r: Region): Tile[] => {
    const T = (key: string, label: string, aria: string, ov: Partial<Av>, crop: string | undefined, sel: boolean, onTap: () => void): Tile =>
      ({ key, label, aria, ov, crop, sel, onTap });
    if (r === "hair")
      return DM.hairStyles.map((h) => T("h_" + h.id, h.label, h.label, { hair: h.id }, CROP.HAIR, av.hair === h.id, () => apply({ hair: h.id })));
    if (r === "face") {
      const ex = DM.expressions.map((e) => T("e_" + e.id, e.label, `${e.label} expression`, { expression: e.id }, CROP.FACE, av.expression === e.id, () => apply({ expression: e.id })));
      const ft = DM.features.filter((f) => f.id !== "none").map((f) =>
        T("f_" + f.id, f.label, f.label, { feature: f.id }, CROP.FACE, av.feature === f.id, () => apply({ feature: av.feature === f.id ? "none" : f.id })));
      return [...ex, ...ft];
    }
    if (r === "body") {
      const shapes = DM.bodyShapes.map((b) => T(
        "body_" + b.id, b.label, `Body shape ${b.label}`, { body: b.id }, undefined,
        av.body === b.id, () => apply({ body: b.id }),
      ));
      const heights = DM.heights.map((h) => T(
        "height_" + h.id, h.label, `Height ${h.label}`, { height: h.id }, undefined,
        av.height === h.id, () => apply({ height: h.id }),
      ));
      return [...shapes, ...heights];
    }
    if (r === "top") {
      const topTiles = DM.tops.map((t) => T("t_" + t.id, t.label, t.label, { top: t.id }, CROP.TOP, av.top === t.id, () => apply({ top: t.id })));
      const layerTiles = DM.layers.map((l) => T(
        "l_" + l.id,
        l.id === "none" ? "No layer" : l.label,
        l.id === "none" ? "No outer layer" : `Outer layer ${l.label}`,
        { layer: l.id }, CROP.TOP, av.layer === l.id, () => apply({ layer: l.id }),
      ));
      return [...topTiles, ...layerTiles];
    }
    if (r === "bottom") return DM.bottoms.map((b) => T("b_" + b.id, b.label, b.label, { bottom: b.id }, CROP.BOT, av.bottom === b.id, () => apply({ bottom: b.id })));
    if (r === "shoes") return DM.shoes.map((s) => T("s_" + s.id, s.label, s.label, { shoes: s.id }, CROP.SHOE, av.shoes === s.id, () => apply({ shoes: s.id })));
    const group = EXTRA_GROUPS.find((g) => g.key === extrasTab) || EXTRA_GROUPS[0];
    return group.list.filter((x) => x.id !== "none").map((x) =>
      T(group.key + "_" + x.id, x.label, x.label, { [group.dim]: x.id } as Partial<Av>, group.crop,
        (av as any)[group.dim] === x.id,
        () => apply({ [group.dim]: (av as any)[group.dim] === x.id ? "none" : x.id } as Partial<Av>)));
  };

  const tiles = region ? tilesFor(region) : [];
  const colorRows = region ? colorRowsFor(region) : [];

  return (
    <LinearGradient colors={["#f6f0e4", "#ece7dc", "#dcd4c5"]} locations={[0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.root}>
      <View style={styles.header}>
        <View>
          <Text style={styles.wordmark}>
            design<Text style={styles.wordmarkMe}>Me</Text>
          </Text>
          <Text style={styles.tagline}>make a you</Text>
        </View>
        <View style={styles.headerActions}>
          <HeaderIconBtn icon="vibe" label="Vibes" onPress={() => { setRegion(null); setLookbookOpen(false); setVibeOpen(true); }} />
          <HeaderIconBtn icon="shuffle" label="Shuffle" onPress={shuffle} />
          <HeaderIconBtn icon="looks" label="Looks" onPress={openLooks} badge={looks.length > 0 ? looks.length : undefined} />
          <HeaderIconBtn icon="undo" label="Undo" onPress={undo} disabled={history.length === 0} />
          <UIPressable
            accessibilityRole="button"
            accessibilityLabel="Save to lookbook"
            onPress={save}
            lift
            radius={theme.radius.pill}
            style={styles.savePill}
          >
            <Hairline inset={16} />
            <View style={{ zIndex: 1, flexDirection: "row", alignItems: "center", gap: 9 }} pointerEvents="none">
              <Icon name="heart" stroke={theme.color.onAccent} size={21} />
              <Text style={styles.savePillText}>Save</Text>
            </View>
          </UIPressable>
        </View>
      </View>

      <View style={[styles.stage, sheetOpen ? { paddingBottom: TRAY_H - 40 } : null]}>
        <View style={[styles.card, { width: cardW, height: cardH }]}>
          <LinearGradient colors={["#ffffff", "#fbf8f2", "#f4eee4"]} locations={[0, 0.44, 1]}
            start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: theme.radius.mat }]} pointerEvents="none" />
          <RadialMat opacity={0.75} />
          <Hairline inset={22} />
          <Animated.View
            style={{
              width: wrapW,
              height: wrapH,
              position: "relative",
              opacity: stageFade,
              transform: [{ translateY: breatheY }, { scale: settle }],
            }}
          >
            <View style={StyleSheet.absoluteFill}>
              {hydrated ? <AvatarCanvas av={av} engine={engineMode} crossfade /> : null}
            </View>

            {region && ZONE_RECT[region] ? (
              <View pointerEvents="none" style={[styles.ring, ringStyle(ZONE_RECT[region]!)]} />
            ) : null}

            {(Object.keys(ZONE_RECT) as Region[]).map((k) => {
              const r = ZONE_RECT[k]!;
              return (
                <Pressable
                  key={k}
                  accessible={false}
                  accessibilityElementsHidden
                  focusable={false}
                  importantForAccessibility="no"
                  onPress={() => selectRegion(k)}
                  style={{ position: "absolute", left: `${r[0]}%`, top: `${r[1]}%`, width: `${r[2]}%`, height: `${r[3]}%`, zIndex: 8 }}
                />
              );
            })}

            {(Object.keys(CHIP_POS) as Region[]).map((k) => (
              <Chip
                key={k}
                k={k}
                active={region === k}
                pulseOpacity={!explored ? chipPulseOpacity : undefined}
                onPress={() => selectRegion(k)}
              />
            ))}
          </Animated.View>

          {!explored && hydrated ? (
            <View style={styles.hintPill} pointerEvents="none">
              <Text style={styles.hintText}>Tap your hair, face, or top</Text>
            </View>
          ) : null}
        </View>

        {/* Always mounted so the live region exists before a message lands (aria-live
            regions added together with their content are often not announced). */}
        <View style={styles.toastWrap} accessibilityLiveRegion="polite" pointerEvents="none">
          {toast ? (
            <Animated.View
              style={[
                styles.toast,
                { opacity: toastA, transform: [{ translateY: toastA.interpolate({ inputRange: [0, 1], outputRange: [-16, 0] }) }] },
              ]}
            >
              <Icon name="heart" stroke="#e3a679" size={18} sw={1.5} />
              <Text style={styles.toastText}>{toast}</Text>
            </Animated.View>
          ) : null}
        </View>
      </View>

      {__DEV__ ? (
        <UIPressable
          accessibilityRole="button"
          accessibilityLabel={`Avatar art: ${engineMode === "png" ? "PNG layers" : "SVG engine"}. Tap to switch.`}
          onPress={() => setEngineMode((m) => (m === "png" ? "svg" : "png"))}
          radius={theme.radius.pill}
          style={styles.devToggle}
        >
          <Text style={styles.devToggleText}>{engineMode === "png" ? "PNG" : "SVG"}</Text>
        </UIPressable>
      ) : null}

      <Animated.View
        pointerEvents={sheetOpen ? "auto" : "none"}
        style={[styles.scrim, { opacity: scrimOpacity }]}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Close options"
          focusable={sheetOpen}
          importantForAccessibility={sheetOpen ? "auto" : "no-hide-descendants"}
          onPress={closeSheets}
          style={{ flex: 1 }}
        />
      </Animated.View>

      {vibeOpen ? (
        <ThisOrThat
          av={av}
          onWear={(vibe) => {
            apply(vibe.ov);
            setVibeOpen(false);
            showToast(`Wearing ${vibe.label}`);
          }}
          onClose={() => setVibeOpen(false)}
        />
      ) : null}

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: trayTranslate }] }]}
        pointerEvents={region ? "auto" : "none"}
        accessibilityElementsHidden={!region}
        importantForAccessibility={region ? "auto" : "no-hide-descendants"}
      >
        <LinearGradient colors={["#ffffff", theme.color.surface]} style={[StyleSheet.absoluteFill, styles.sheetBg]} pointerEvents="none" />
        <Hairline inset={26} />
        <View style={styles.grip} />
        {region ? (
          <>
            <View style={styles.trayHead}>
              <View style={styles.trayHeadText}>
                <Text style={styles.trayTitle}>{META[region].title}</Text>
                <Text style={styles.trayHint}>{META[region].hint}</Text>
              </View>
              <UIPressable accessibilityRole="button" accessibilityLabel="Close options" onPress={() => setRegion(null)} radius={theme.radius.pill} style={styles.closeBtn}>
                <Icon name="close" stroke="#2f2823" size={22} />
              </UIPressable>
            </View>

            {region === "extras" ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabScroll} contentContainerStyle={styles.subTabRow}>
                {EXTRA_GROUPS.map((g) => {
                  const active = extrasTab === g.key;
                  const worn = (av as any)[g.dim] !== "none";
                  return (
                    <UIPressable
                      key={g.key}
                      accessibilityRole="button"
                      accessibilityLabel={`${g.label} options`}
                      accessibilityState={{ selected: active }}
                      onPress={() => setExtrasTab(g.key)}
                      radius={theme.radius.pill}
                      style={[styles.subTab, active && styles.subTabActive]}
                    >
                      <Text style={[styles.subTabText, active && styles.subTabTextActive]}>{g.label}</Text>
                      {worn ? <View style={[styles.subTabDot, active && { backgroundColor: theme.color.onAccent }]} /> : null}
                    </UIPressable>
                  );
                })}
              </ScrollView>
            ) : null}

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tileRow}>
              {tiles.map((t) => (
                <OptionTile
                  key={t.key}
                  av={av}
                  ov={t.ov}
                  crop={t.crop}
                  label={t.label}
                  aria={t.aria}
                  selected={t.sel}
                  onPress={t.onTap}
                />
              ))}
            </ScrollView>

            {colorRows.map((row) => (
              <View key={row.key} style={styles.colorSection}>
                <Text style={styles.colorEyebrow}>{row.title}</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
                  {row.colors.map((c) => (
                    <ColorSwatch key={`${row.key}_${c.v}`} color={c.v} aria={c.aria} selected={c.sel} onPress={c.onTap} />
                  ))}
                </ScrollView>
              </View>
            ))}
          </>
        ) : null}
      </Animated.View>

      <Animated.View
        style={[styles.sheet, { transform: [{ translateY: lookbookTranslate }], zIndex: 22 }]}
        pointerEvents={lookbookOpen ? "auto" : "none"}
        accessibilityElementsHidden={!lookbookOpen}
        importantForAccessibility={lookbookOpen ? "auto" : "no-hide-descendants"}
      >
        <LinearGradient colors={["#ffffff", theme.color.surface]} style={[StyleSheet.absoluteFill, styles.sheetBg]} pointerEvents="none" />
        <Hairline inset={26} />
        <View style={styles.grip} />
        {lookbookOpen ? (
          <>
            <View style={styles.trayHead}>
              <View style={styles.trayHeadText}>
                <Text style={styles.trayTitle}>Lookbook</Text>
                <Text style={styles.trayHint}>Saved looks stay on this device</Text>
              </View>
              <UIPressable accessibilityRole="button" accessibilityLabel="Close lookbook" onPress={() => setLookbookOpen(false)} radius={theme.radius.pill} style={styles.closeBtn}>
                <Icon name="close" stroke="#2f2823" size={22} />
              </UIPressable>
            </View>

            {looks.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lookRow}>
                {looks.map((look, index) => (
                  <UIPressable
                    key={look.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Wear saved look ${index + 1}`}
                    onPress={() => wearLook(look)}
                    lift
                    radius={theme.radius.lg}
                    style={styles.lookCard}
                  >
                    <LinearGradient colors={["#ffffff", theme.color.surface2]} style={[StyleSheet.absoluteFill, { borderRadius: theme.radius.lg - 2 }]} pointerEvents="none" />
                    <View style={styles.lookPreview} pointerEvents="none">
                      <AvatarCanvas av={look.av} />
                    </View>
                    <Text style={styles.lookTitle} numberOfLines={1}>{lookLabel(look.savedAt)}</Text>
                  </UIPressable>
                ))}
              </ScrollView>
            ) : (
              <View style={styles.emptyLookbook}>
                <Text style={styles.emptyTitle}>No saved looks yet</Text>
                <Text style={styles.emptyText}>Save a look when it feels right.</Text>
              </View>
            )}
          </>
        ) : null}
      </Animated.View>
    </LinearGradient>
  );
}

function Chip({ k, active, pulseOpacity, onPress }: {
  k: Region;
  active: boolean;
  pulseOpacity?: Animated.AnimatedInterpolation<number> | undefined;
  onPress: () => void;
}) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const p = CHIP_POS[k];
  const showLabel = hover || focus || active;
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={`Change ${CHIP_LABEL[k].toLowerCase()}`}
      accessibilityState={{ selected: active }}
      onPress={onPress}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      hitSlop={6}
      radius={theme.radius.pill}
      style={[
        styles.chip,
        active && styles.chipActive,
        { left: `${p[0]}%`, top: `${p[1]}%`, marginLeft: -24, marginTop: -24 },
        showLabel ? { zIndex: 20 } : null, // label must not hide behind sibling chips
        pulseOpacity && !active ? { opacity: pulseOpacity } : null,
      ]}
    >
      <Icon name={k} stroke={active ? "#ffffff" : "#3f5c3b"} size={24} />
      {showLabel ? (
        <View style={styles.chipLabel} pointerEvents="none">
          <Text style={styles.chipLabelText}>{CHIP_LABEL[k]}</Text>
        </View>
      ) : null}
    </UIPressable>
  );
}

function HeaderIconBtn({ icon, label, onPress, disabled, badge }: {
  icon: string; label: string; onPress: () => void; disabled?: boolean; badge?: number;
}) {
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      lift={!disabled}
      radius={theme.radius.pill}
      onHoverIn={() => setHover(true)}
      onHoverOut={() => setHover(false)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={[styles.iconBtn, disabled && styles.iconBtnDisabled]}
    >
      <LinearGradient colors={["#ffffff", theme.color.surface2]} style={[StyleSheet.absoluteFill, { borderRadius: theme.radius.pill }]} pointerEvents="none" />
      <Hairline inset={14} />
      {/* zIndex keeps the icon above the absolutely-positioned gradient fill */}
      <View style={{ zIndex: 1 }} pointerEvents="none">
        <Icon name={icon} stroke={disabled ? theme.color.inkFaint : "#2f2823"} size={24} />
      </View>
      {badge ? <View pointerEvents="none" style={styles.hBadge}><Text style={styles.hBadgeText}>{badge}</Text></View> : null}
      {(hover || focus) && !disabled ? (
        <View style={styles.btnTip} pointerEvents="none">
          <Text style={styles.btnTipText}>{label}</Text>
        </View>
      ) : null}
    </UIPressable>
  );
}

const ringStyle = (r: [number, number, number, number]) => ({
  left: `${r[0] - 2}%` as any,
  top: `${r[1] - 1.4}%` as any,
  width: `${r[2] + 4}%` as any,
  height: `${r[3] + 2.8}%` as any,
});

const styles = StyleSheet.create({
  // overflow hidden: sheets translate below the viewport when closed — without the
  // clip they extend the document and the browser can scroll the header off-screen.
  root: { flex: 1, backgroundColor: theme.color.bg, overflow: "hidden" },

  header: { height: HDR, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 32, gap: 16, zIndex: 30 },
  wordmark: { fontFamily: theme.font.serif, fontSize: theme.type.display, color: theme.color.ink, lineHeight: 34 },
  wordmarkMe: { fontStyle: "italic", fontWeight: "600" },
  tagline: { fontSize: theme.type.md, fontWeight: "600", color: theme.color.inkSoft, marginTop: -2 },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 12 },

  iconBtn: { width: 56, height: 56, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: theme.color.line, backgroundColor: theme.color.surface, ...theme.shadow.sm },
  iconBtnDisabled: { opacity: 0.45 },
  btnTip: { position: "absolute", top: 60, backgroundColor: theme.color.ink, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: theme.radius.pill },
  btnTipText: { color: theme.color.surface, fontSize: theme.type.sm, fontWeight: "700" },
  savePill: { height: 64, minWidth: 118, paddingHorizontal: 24, borderRadius: theme.radius.pill,
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 9,
    backgroundColor: theme.color.terra, borderWidth: 1, borderColor: theme.color.terraDeep, ...theme.shadow.sm },
  savePillText: { color: theme.color.onAccent, fontSize: 19, fontWeight: "800" },
  hBadge: { position: "absolute", top: -6, right: -6, minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: theme.radius.pill,
    backgroundColor: theme.color.sageDeep, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#f6f0e4" },
  hBadgeText: { color: "#fff", fontSize: theme.type.xs, fontWeight: "800" },

  stage: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  card: { backgroundColor: theme.color.surface, borderRadius: theme.radius.mat, borderWidth: 1, borderColor: "#e4d8c6",
    alignItems: "center", justifyContent: "center", ...theme.shadow.lg },

  hintPill: { position: "absolute", bottom: 20, alignSelf: "center", backgroundColor: "rgba(251,248,242,0.85)",
    borderWidth: 1, borderColor: theme.color.line, paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: theme.radius.pill, ...theme.shadow.md },
  hintText: { fontSize: theme.type.base, fontWeight: "700", color: theme.color.inkSoft },

  ring: { position: "absolute", borderRadius: 20, zIndex: 6, borderWidth: 3, borderColor: "rgba(111,143,106,0.5)",
    backgroundColor: "rgba(111,143,106,0.06)" },

  chip: { position: "absolute", width: 48, height: 48, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center",
    zIndex: 12, borderWidth: 1, borderColor: theme.color.line, backgroundColor: "rgba(251,248,242,0.88)", ...theme.shadow.sm },
  chipActive: { borderColor: theme.color.sage, backgroundColor: theme.color.sage },
  chipLabel: { position: "absolute", top: 52, backgroundColor: theme.color.ink, paddingHorizontal: 11, paddingVertical: 5,
    borderRadius: theme.radius.pill },
  chipLabelText: { color: theme.color.surface, fontSize: theme.type.sm, fontWeight: "700" },

  toastWrap: { position: "absolute", top: 14, alignSelf: "center", zIndex: 40 },
  toast: { flexDirection: "row", alignItems: "center", gap: 9,
    backgroundColor: theme.color.ink, paddingHorizontal: 20, paddingVertical: 12, borderRadius: theme.radius.pill, ...theme.shadow.xl },
  toastText: { color: theme.color.surface, fontSize: theme.type.base, fontWeight: "700" },

  devToggle: { position: "absolute", left: 14, bottom: 12, zIndex: 24, height: 34, paddingHorizontal: 12,
    borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center",
    backgroundColor: "rgba(251,248,242,0.7)", borderWidth: 1, borderColor: theme.color.line },
  devToggleText: { fontSize: theme.type.xs, fontWeight: "800", color: theme.color.inkFaint, letterSpacing: 0.5 },

  scrim: { ...StyleSheet.absoluteFillObject, backgroundColor: "#362614", zIndex: 14 },

  sheet: { position: "absolute", left: 24, right: 24, bottom: 0, height: TRAY_H, paddingHorizontal: 28, paddingTop: 12,
    borderWidth: 1, borderColor: theme.color.line, borderBottomWidth: 0, backgroundColor: theme.color.surface,
    borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl, ...theme.shadow.xl, zIndex: 20,
    overflow: "hidden" },
  sheetBg: { borderTopLeftRadius: theme.radius.xxl, borderTopRightRadius: theme.radius.xxl },
  grip: { alignSelf: "center", width: 46, height: 5, borderRadius: theme.radius.pill, backgroundColor: theme.color.line2,
    marginBottom: 8 },

  trayHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  trayHeadText: { flexShrink: 1 },
  trayTitle: { fontSize: theme.type.xl, fontWeight: "800", color: theme.color.ink, lineHeight: 28 },
  trayHint: { fontSize: theme.type.md, fontWeight: "600", color: theme.color.inkSoft },
  closeBtn: { width: 48, height: 48, borderRadius: theme.radius.pill, borderWidth: 1, borderColor: theme.color.line,
    backgroundColor: theme.color.surface2, alignItems: "center", justifyContent: "center" },

  subTabScroll: { flexGrow: 0, marginTop: 8 },
  subTabRow: { gap: 8, alignItems: "center", paddingVertical: 2 },
  subTab: { minHeight: 40, paddingHorizontal: 16, borderRadius: theme.radius.pill, flexDirection: "row", alignItems: "center",
    gap: 7, justifyContent: "center", backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line2 },
  subTabActive: { backgroundColor: theme.color.sage, borderColor: theme.color.sageDeep },
  subTabText: { fontSize: theme.type.md, fontWeight: "800", color: theme.color.inkSoft },
  subTabTextActive: { color: theme.color.onAccent },
  subTabDot: { width: 7, height: 7, borderRadius: theme.radius.pill, backgroundColor: theme.color.sage },

  tileRow: { alignItems: "center", gap: 16, paddingVertical: 12, paddingHorizontal: 2 },

  colorSection: { marginTop: 2 },
  colorEyebrow: { ...theme.eyebrow, color: theme.color.inkSoft, marginBottom: 6, marginLeft: 2 },
  colorRow: { alignItems: "center", gap: 10, paddingHorizontal: 2, paddingBottom: 8 },

  lookRow: { alignItems: "center", gap: 16, paddingVertical: 14 },
  lookCard: { width: 136, height: 208, borderRadius: theme.radius.lg, borderWidth: 2, borderColor: theme.color.line,
    backgroundColor: theme.color.surface2, alignItems: "center", padding: 10, ...theme.shadow.md, overflow: "hidden" },
  lookPreview: { width: 108, height: 148, overflow: "hidden" },
  lookTitle: { marginTop: 10, fontSize: theme.type.md, fontWeight: "800", color: theme.color.ink },
  emptyLookbook: { flex: 1, minHeight: 210, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: theme.type.lg, fontWeight: "800", color: theme.color.ink },
  emptyText: { marginTop: 6, fontSize: theme.type.base, fontWeight: "600", color: theme.color.inkSoft },
});
