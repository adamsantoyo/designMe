// designMe — Avatar Studio (the main screen).
// Full-bleed stage where the avatar IS the menu: visible body chips open calm
// trays, and the deterministic dmFigure SVG engine renders every preview.

import { useEffect, useRef, useState } from "react";
import {
  AccessibilityInfo,
  Animated,
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
import useReducedMotion from "./useReducedMotion";
import * as DM from "./dm";
import type { Av } from "./dm";

type Region = "hair" | "face" | "body" | "top" | "bottom" | "shoes" | "extras";
type SavedLook = { id: string; savedAt: number; av: Av };
type ColorChoice = { v: string; sel: boolean; onTap: () => void; aria: string };
type ColorRow = { key: string; title: string; colors: ColorChoice[] };
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
const LOOKBOOK_CAP = 24;
const AV_KEYS: (keyof Av)[] = [
  "skin", "body", "height", "hair", "hairColor", "expression", "feature",
  "glasses", "hearing", "headwear", "jewelry", "tool", "aac", "mobility",
  "carry", "top", "topColor", "pattern",
  "bottom", "bottomColor", "layer", "layerColor", "shoes",
];

const META: Record<Region, { title: string; hint: string }> = {
  hair: { title: "Hair", hint: "Tap a style. Recolor on the right." },
  face: { title: "Face", hint: "Skin tone, expression, and features" },
  body: { title: "Body", hint: "Body shape first, then height" },
  top: { title: "Top", hint: "Tops first, then outer layers. Recolor on the right." },
  bottom: { title: "Bottom", hint: "Tap to try it on. Recolor on the right." },
  shoes: { title: "Shoes", hint: "Tap to try them on" },
  extras: { title: "Extras", hint: "Glasses, hearing, headwear, tools, bags. Tap to add or remove." },
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
  hair: [65.8, 6.5],
  face: [33, 14],
  body: [19, 36],
  extras: [70, 21],
  top: [80, 31],
  bottom: [23, 60],
  shoes: [69, 92],
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

const TRAY_H = 356;

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
  vibe: '<rect x="3" y="5" width="8" height="14" rx="2.5"/><rect x="13" y="5" width="8" height="14" rx="2.5"/><path d="M7 11v2M17 11v2"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};
const svgIcon = (name: string, stroke: string, sw = 2) =>
  `<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${ICON[name]}</svg>`;
const Icon = ({ name, stroke, size = 24, sw = 2 }: { name: string; stroke: string; size?: number; sw?: number }) => (
  <SvgString xml={svgIcon(name, stroke, sw)} width={size} height={size} />
);

const copyAv = (av: Av): Av => ({
  skin: av.skin,
  body: av.body,
  height: av.height,
  hair: av.hair,
  hairColor: av.hairColor,
  expression: av.expression,
  feature: av.feature,
  glasses: av.glasses,
  hearing: av.hearing,
  headwear: av.headwear,
  jewelry: av.jewelry,
  tool: av.tool,
  aac: av.aac,
  mobility: av.mobility,
  carry: av.carry,
  top: av.top,
  topColor: av.topColor,
  pattern: av.pattern,
  bottom: av.bottom,
  bottomColor: av.bottomColor,
  layer: av.layer,
  layerColor: av.layerColor,
  shoes: av.shoes,
});

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

export default function AvatarStudio() {
  const [av, setAv] = useState<Av>(() => DM.shuffleAv(DM.defaultAv));
  const [region, setRegion] = useState<Region | null>(null);
  const [history, setHistory] = useState<Av[]>([]);
  const [looks, setLooks] = useState<SavedLook[]>([]);
  const [lookbookOpen, setLookbookOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [bump, setBump] = useState(0);
  const [engineMode, setEngineMode] = useState<"svg" | "png">("svg");
  const [hydrated, setHydrated] = useState(false);
  const [vibeOpen, setVibeOpen] = useState(false);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const reduceMotion = useReducedMotion();

  const { width: W, height: H } = useWindowDimensions();
  const settle = useRef(new Animated.Value(1)).current;
  const tray = useRef(new Animated.Value(0)).current;
  const lookbook = useRef(new Animated.Value(0)).current;

  function showToast(message: string) {
    setToast(message);
    // aria-live covers web; VoiceOver on iOS needs an explicit announcement.
    if (Platform.OS !== "web") AccessibilityInfo.announceForAccessibility(message);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
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

  useEffect(() => {
    if (reduceMotion || bump === 0) {
      settle.setValue(1);
      return;
    }
    settle.setValue(0.965);
    Animated.timing(settle, { toValue: 1, duration: 420, useNativeDriver: false }).start();
  }, [bump, reduceMotion, settle]);

  useEffect(() => {
    const toValue = region ? 1 : 0;
    if (reduceMotion) {
      tray.setValue(toValue);
      return;
    }
    Animated.timing(tray, { toValue, duration: 380, useNativeDriver: false }).start();
  }, [region, reduceMotion, tray]);

  useEffect(() => {
    const toValue = lookbookOpen ? 1 : 0;
    if (reduceMotion) {
      lookbook.setValue(toValue);
      return;
    }
    Animated.timing(lookbook, { toValue, duration: 320, useNativeDriver: false }).start();
  }, [lookbookOpen, lookbook, reduceMotion]);

  // The card must fit the space *left over* when a tray is open — otherwise the
  // page overflows and the browser scrolls the header (Save/Shuffle/Undo) off-screen.
  const sheetOpen = !!region || lookbookOpen;
  const stageH = H - 88 - (sheetOpen ? TRAY_H - 40 : 0);
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
    setLookbookOpen(false);
    setRegion((cur) => (cur === r ? null : r));
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
        "body_" + b.id,
        b.label,
        `Body shape ${b.label}`,
        { body: b.id },
        undefined,
        av.body === b.id,
        () => apply({ body: b.id }),
      ));
      const heights = DM.heights.map((h) => T(
        "height_" + h.id,
        h.label,
        `Height ${h.label}`,
        { height: h.id },
        undefined,
        av.height === h.id,
        () => apply({ height: h.id }),
      ));
      return [...shapes, ...heights];
    }
    if (r === "top") {
      const topTiles = DM.tops.map((t) => T("t_" + t.id, t.label, t.label, { top: t.id }, CROP.TOP, av.top === t.id, () => apply({ top: t.id })));
      const layerTiles = DM.layers.map((l) => T(
        "l_" + l.id,
        l.id === "none" ? "No layer" : l.label,
        l.id === "none" ? "No outer layer" : `Outer layer ${l.label}`,
        { layer: l.id },
        CROP.TOP,
        av.layer === l.id,
        () => apply({ layer: l.id }),
      ));
      return [...topTiles, ...layerTiles];
    }
    if (r === "bottom") return DM.bottoms.map((b) => T("b_" + b.id, b.label, b.label, { bottom: b.id }, CROP.BOT, av.bottom === b.id, () => apply({ bottom: b.id })));
    if (r === "shoes") return DM.shoes.map((s) => T("s_" + s.id, s.label, s.label, { shoes: s.id }, CROP.SHOE, av.shoes === s.id, () => apply({ shoes: s.id })));
    const out: Tile[] = [];
    const grp = (list: DM.Item[], dim: keyof Av, crop: string) =>
      list.filter((x) => x.id !== "none").forEach((x) =>
        out.push(T(String(dim) + "_" + x.id, x.label, x.label, { [dim]: x.id } as Partial<Av>, crop, (av as any)[dim] === x.id,
          () => apply({ [dim]: (av as any)[dim] === x.id ? "none" : x.id } as Partial<Av>))));
    grp(DM.glasses, "glasses", CROP.EX);
    grp(DM.hearing, "hearing", CROP.EX);
    grp(DM.headwear, "headwear", CROP.HAIR);
    grp(DM.jewelry, "jewelry", CROP.EX);
    grp(DM.tools, "tool", CROP.EX);
    grp(DM.aacs, "aac", CROP.CAR);
    grp(DM.mobilities, "mobility", CROP.CAR);
    grp(DM.carries, "carry", CROP.CAR);
    return out;
  };

  const tiles = region ? tilesFor(region) : [];
  const colorRows = region ? colorRowsFor(region) : [];

  return (
    <LinearGradient colors={["#f6f0e4", "#ece7dc", "#dcd4c5"]} locations={[0, 0.55, 1]}
      start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }} style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.wordmark}>
          design<Text style={styles.wordmarkMe}>Me</Text>
        </Text>
        <Text style={styles.headerHint} numberOfLines={1}>Tap a part of you to try things on</Text>
        <View style={styles.headerActions}>
          {/* Dev-only harness for the PNG pipeline. Never user-facing: the PNG path is
              partial (missing parts blank the avatar) and the label is dev jargon. */}
          {__DEV__ ? (
            <FocusPressable
              accessibilityRole="button"
              accessibilityLabel={`Avatar art: ${engineMode === "png" ? "PNG layers" : "SVG engine"}. Tap to switch.`}
              onPress={() => setEngineMode((m) => (m === "png" ? "svg" : "png"))}
              style={[styles.engineToggle, engineMode === "png" && styles.engineToggleOn]}
            >
              <Text style={[styles.engineToggleText, engineMode === "png" && styles.engineToggleTextOn]}>
                {engineMode === "png" ? "PNG" : "SVG"}
              </Text>
            </FocusPressable>
          ) : null}
          <HeaderBtn icon="vibe" label="Vibes" onPress={() => { setRegion(null); setLookbookOpen(false); setVibeOpen(true); }} />
          <HeaderBtn icon="shuffle" label="Shuffle" onPress={shuffle} />
          <HeaderBtn icon="heart" label="Save" onPress={save} primary />
          <HeaderBtn icon="looks" label="Looks" onPress={openLooks} badge={looks.length > 0 ? looks.length : undefined} />
          <HeaderBtn icon="undo" label="Undo" onPress={undo} disabled={history.length === 0} />
        </View>
      </View>

      <View style={[styles.stage, sheetOpen ? { paddingBottom: TRAY_H - 40 } : null]}>
        <View style={[styles.card, { width: cardW, height: cardH }]}>
          <LinearGradient colors={["#ffffff", "#fbf8f2", "#f4eee4"]} locations={[0, 0.44, 1]}
            start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
            style={[StyleSheet.absoluteFill, { borderRadius: 30 }]} pointerEvents="none" />
          <Animated.View style={{ width: wrapW, height: wrapH, position: "relative", transform: [{ scale: settle }] }}>
            <View style={StyleSheet.absoluteFill}>
              {hydrated ? <AvatarCanvas av={av} engine={engineMode} /> : null}
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

            {(Object.keys(CHIP_POS) as Region[]).map((k) => {
              const p = CHIP_POS[k];
              const active = region === k;
              return (
                <FocusPressable
                  key={k}
                  accessibilityRole="button"
                  accessibilityLabel={`Change ${CHIP_LABEL[k].toLowerCase()}`}
                  accessibilityState={{ selected: active }}
                  onPress={() => selectRegion(k)}
                  style={[styles.chip, active && styles.chipActive, { left: `${p[0]}%`, top: `${p[1]}%`, marginLeft: -24, marginTop: -24 }]}
                >
                  <Icon name={k} stroke={active ? "#ffffff" : "#3f5c3b"} size={24} />
                  {active ? (
                    <View style={styles.chipLabel}><Text style={styles.chipLabelText}>{CHIP_LABEL[k]}</Text></View>
                  ) : null}
                </FocusPressable>
              );
            })}
          </Animated.View>
        </View>

        {/* Always mounted so the live region exists before a message lands (aria-live
            regions added together with their content are often not announced). */}
        <View style={styles.toastWrap} accessibilityLiveRegion="polite" pointerEvents="none">
          {toast ? (
            <View style={styles.toast}>
              <Icon name="heart" stroke="#e3a679" size={18} sw={1.5} />
              <Text style={styles.toastText}>{toast}</Text>
            </View>
          ) : null}
        </View>
      </View>

      <Animated.View
        style={[styles.tray, { transform: [{ translateY: trayTranslate }] }]}
        pointerEvents={region ? "auto" : "none"}
        accessibilityElementsHidden={!region}
        importantForAccessibility={region ? "auto" : "no-hide-descendants"}
      >
        {region ? (
          <>
            <View style={styles.trayHead}>
              <View style={styles.trayHeadText}>
                <Text style={styles.trayTitle}>{META[region].title}</Text>
                <Text style={styles.trayHint}>{META[region].hint}</Text>
              </View>
              <View style={styles.trayHeadRight}>
                {colorRows.length ? (
                  <View style={styles.colorStack}>
                    {colorRows.map((row) => (
                      <View key={row.key} style={styles.colorStackRow}>
                        <Text style={styles.colorRowLabel} numberOfLines={1}>{row.title}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.colorRow}>
                          {row.colors.map((c) => (
                            <FocusPressable
                              key={`${row.key}_${c.v}`}
                              accessibilityRole="button"
                              accessibilityLabel={c.aria}
                              accessibilityState={{ selected: c.sel }}
                              onPress={c.onTap}
                              style={[styles.colorDot, { backgroundColor: c.v }, c.sel && styles.colorDotSel]}
                            />
                          ))}
                        </ScrollView>
                      </View>
                    ))}
                  </View>
                ) : null}
                <FocusPressable accessibilityRole="button" accessibilityLabel="Close options" onPress={() => setRegion(null)} style={styles.closeBtn}>
                  <Icon name="close" stroke="#2f2823" size={22} />
                </FocusPressable>
              </View>
            </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tileRow}>
              {tiles.map((t) => (
                <FocusPressable
                  key={t.key}
                  accessibilityRole="button"
                  accessibilityLabel={t.aria}
                  accessibilityState={{ selected: t.sel }}
                  onPress={t.onTap}
                  style={styles.tile}
                >
                  <View style={StyleSheet.absoluteFill}>
                    <AvatarCanvas av={av} ov={t.ov} crop={t.crop} />
                  </View>
                  <View pointerEvents="none" style={styles.tileLabelWrap}>
                    <Text style={styles.tileLabel} numberOfLines={1}>{t.label}</Text>
                  </View>
                  {t.sel ? (
                    <>
                      <View pointerEvents="none" style={styles.tileSelRing} />
                      <View pointerEvents="none" style={styles.tileCheck}><Icon name="check" stroke="#fff" size={15} sw={3} /></View>
                    </>
                  ) : null}
                </FocusPressable>
              ))}
            </ScrollView>
          </>
        ) : null}
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
        style={[styles.lookbook, { transform: [{ translateY: lookbookTranslate }] }]}
        pointerEvents={lookbookOpen ? "auto" : "none"}
        accessibilityElementsHidden={!lookbookOpen}
        importantForAccessibility={lookbookOpen ? "auto" : "no-hide-descendants"}
      >
        {lookbookOpen ? (
          <>
            <View style={styles.trayHead}>
              <View style={styles.trayHeadText}>
                <Text style={styles.trayTitle}>Lookbook</Text>
                <Text style={styles.trayHint}>Saved looks stay on this device</Text>
              </View>
              <FocusPressable accessibilityRole="button" accessibilityLabel="Close lookbook" onPress={() => setLookbookOpen(false)} style={styles.closeBtn}>
                <Icon name="close" stroke="#2f2823" size={22} />
              </FocusPressable>
            </View>

            {looks.length ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.lookRow}>
                {looks.map((look, index) => (
                  <FocusPressable
                    key={look.id}
                    accessibilityRole="button"
                    accessibilityLabel={`Wear saved look ${index + 1}`}
                    onPress={() => wearLook(look)}
                    style={styles.lookCard}
                  >
                    <View style={styles.lookPreview}>
                      <AvatarCanvas av={look.av} />
                    </View>
                    <Text style={styles.lookTitle} numberOfLines={1}>Look {looks.length - index}</Text>
                    <Text style={styles.lookDate} numberOfLines={1}>
                      {new Date(look.savedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                    </Text>
                  </FocusPressable>
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

function HeaderBtn({ icon, label, onPress, primary, disabled, badge }: {
  icon: string; label: string; onPress: () => void; primary?: boolean; disabled?: boolean; badge?: number;
}) {
  return (
    <FocusPressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      onPress={onPress}
      disabled={disabled}
      style={[styles.hBtn, primary && styles.hBtnPrimary, disabled && styles.hBtnDisabled]}
    >
      <Icon name={icon} stroke={primary ? "#ffffff" : "#2f2823"} size={25} />
      <Text style={[styles.hBtnText, primary && styles.hBtnTextPrimary]}>{label}</Text>
      {badge ? <View pointerEvents="none" style={styles.hBadge}><Text style={styles.hBadgeText}>{badge}</Text></View> : null}
    </FocusPressable>
  );
}

function FocusPressable({ style, focusStyle, onFocus, onBlur, ...props }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      onFocus={(event) => {
        setFocused(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setFocused(false);
        onBlur?.(event);
      }}
      style={(state) => [
        typeof style === "function" ? style(state) : style,
        focused && (focusStyle || styles.focusVisible),
      ]}
    />
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

  header: { height: 88, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 32, gap: 16 },
  wordmark: { fontFamily: theme.font.serif, fontSize: 32, color: theme.color.ink },
  wordmarkMe: { fontStyle: "italic", fontWeight: "700" },
  headerHint: { flex: 1, textAlign: "center", fontSize: 15, fontWeight: "600", color: theme.color.inkSoft },
  headerActions: { flexDirection: "row", alignItems: "center", gap: 10 },

  engineToggle: { height: 66, paddingHorizontal: 14, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, ...theme.shadow.sm },
  engineToggleOn: { backgroundColor: theme.color.sage, borderColor: theme.color.sageDeep },
  engineToggleText: { fontSize: 13, fontWeight: "800", color: theme.color.inkSoft, letterSpacing: 0.5 },
  engineToggleTextOn: { color: theme.color.onAccent },

  hBtn: { width: 74, height: 66, borderRadius: 18, alignItems: "center", justifyContent: "center", gap: 3,
    backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, ...theme.shadow.sm },
  hBtnPrimary: { backgroundColor: theme.color.terra, borderColor: theme.color.terraDeep },
  hBtnDisabled: { opacity: 0.4 },
  hBtnText: { fontSize: 12, fontWeight: "700", color: theme.color.ink },
  hBtnTextPrimary: { color: theme.color.onAccent },
  hBadge: { position: "absolute", top: -7, right: -7, minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 999,
    backgroundColor: theme.color.sageDeep, alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#f6f0e4" },
  hBadgeText: { color: "#fff", fontSize: 11, fontWeight: "800" },

  stage: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  card: { backgroundColor: theme.color.surface, borderRadius: 30, borderWidth: 1, borderColor: "#e4d8c6",
    alignItems: "center", justifyContent: "center", ...theme.shadow.lg },

  ring: { position: "absolute", borderRadius: 20, zIndex: 6, borderWidth: 3, borderColor: "rgba(111,143,106,0.5)",
    backgroundColor: "rgba(111,143,106,0.06)" },

  chip: { position: "absolute", width: 48, height: 48, borderRadius: 999, alignItems: "center", justifyContent: "center",
    zIndex: 12, borderWidth: 1, borderColor: theme.color.line, backgroundColor: theme.color.surface, ...theme.shadow.sm },
  chipActive: { borderColor: theme.color.sage, backgroundColor: theme.color.sage },
  chipLabel: { position: "absolute", top: -36, backgroundColor: theme.color.ink, paddingHorizontal: 11, paddingVertical: 5, borderRadius: 999 },
  chipLabelText: { color: theme.color.surface, fontSize: 12, fontWeight: "700" },

  toastWrap: { position: "absolute", top: 14, alignSelf: "center", zIndex: 40 },
  toast: { flexDirection: "row", alignItems: "center", gap: 9,
    backgroundColor: theme.color.ink, paddingHorizontal: 20, paddingVertical: 12, borderRadius: 999, ...theme.shadow.lg },
  toastText: { color: theme.color.surface, fontSize: 15, fontWeight: "700" },

  tray: { position: "absolute", left: 24, right: 24, bottom: 0, height: TRAY_H, paddingHorizontal: 28, paddingTop: 22,
    backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderBottomWidth: 0,
    borderTopLeftRadius: 30, borderTopRightRadius: 30, ...theme.shadow.lg, zIndex: 20 },
  lookbook: { position: "absolute", left: 24, right: 24, bottom: 0, height: TRAY_H, paddingHorizontal: 28, paddingTop: 22,
    backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, borderBottomWidth: 0,
    borderTopLeftRadius: 30, borderTopRightRadius: 30, ...theme.shadow.lg, zIndex: 22 },
  trayHead: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 16 },
  trayHeadText: { flexShrink: 1 },
  trayTitle: { fontSize: 23, fontWeight: "800", color: theme.color.ink, lineHeight: 26 },
  trayHint: { fontSize: 13, fontWeight: "600", color: theme.color.inkSoft },
  trayHeadRight: { flexDirection: "row", alignItems: "flex-start", gap: 14, flexShrink: 1 },
  colorStack: { gap: 7, maxWidth: 430, flexShrink: 1 },
  colorStackRow: { flexDirection: "row", alignItems: "center", gap: 9 },
  colorRowLabel: { width: 78, fontSize: 11, fontWeight: "800", color: theme.color.inkSoft },
  colorRow: { alignItems: "center", gap: 10, paddingHorizontal: 3 },
  colorDot: { width: 48, height: 48, borderRadius: 999, borderWidth: 1, borderColor: "rgba(0,0,0,0.1)" },
  colorDotSel: { borderWidth: 3, borderColor: theme.color.surface, ...theme.shadow.sm },
  closeBtn: { width: 48, height: 48, borderRadius: 999, borderWidth: 1, borderColor: theme.color.line,
    backgroundColor: theme.color.surface2, alignItems: "center", justifyContent: "center" },

  tileRow: { alignItems: "center", gap: 16, paddingVertical: 8 },
  tile: { width: 130, height: 130, borderRadius: 22, borderWidth: 1, borderColor: theme.color.line,
    backgroundColor: theme.color.surface2, overflow: "hidden", ...theme.shadow.sm },
  tileLabelWrap: { position: "absolute", left: 8, right: 8, bottom: 8, alignItems: "center" },
  tileLabel: { maxWidth: "100%", color: theme.color.ink, backgroundColor: "rgba(251,248,242,0.88)", borderRadius: 999,
    overflow: "hidden", paddingHorizontal: 9, paddingVertical: 3, fontSize: 11, fontWeight: "800" },
  tileSelRing: { ...StyleSheet.absoluteFillObject, borderRadius: 22, borderWidth: 3, borderColor: theme.color.sage, backgroundColor: "rgba(111,143,106,0.10)" },
  tileCheck: { position: "absolute", top: 9, right: 9, width: 26, height: 26, borderRadius: 999, backgroundColor: theme.color.sage, alignItems: "center", justifyContent: "center" },

  lookRow: { alignItems: "center", gap: 16, paddingVertical: 14 },
  lookCard: { width: 132, height: 198, borderRadius: 22, borderWidth: 1, borderColor: theme.color.line,
    backgroundColor: theme.color.surface2, alignItems: "center", padding: 10, ...theme.shadow.sm },
  lookPreview: { width: 106, height: 138, overflow: "hidden" },
  lookTitle: { marginTop: 8, fontSize: 13, fontWeight: "800", color: theme.color.ink },
  lookDate: { marginTop: 2, fontSize: 11, fontWeight: "700", color: theme.color.inkSoft },
  emptyLookbook: { flex: 1, minHeight: 210, alignItems: "center", justifyContent: "center" },
  emptyTitle: { fontSize: 18, fontWeight: "800", color: theme.color.ink },
  emptyText: { marginTop: 6, fontSize: 14, fontWeight: "600", color: theme.color.inkSoft },

  focusVisible: { borderColor: theme.color.focus, borderWidth: 3, shadowColor: theme.color.focus, shadowOpacity: 0.24,
    shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 5 },
});
