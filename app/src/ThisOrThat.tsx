// designMe — This-or-that ("Find my vibe"), the second door.
// Binary choice is the gold standard for switch scanning: exactly two big targets
// per round, no grids, no scrolling. The winner meets the next challenger; five calm
// rounds; deterministic. A vibe only changes clothes — never the person.
// Each card's mat is tinted from its own outfit colors (the VibeCard pattern).

import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AvatarCanvas, { type AvatarEngine } from "./AvatarCanvas";
import UIPressable from "./ui/Pressable";
import Text from "./ui/Text";
import { Hairline, RadialMat } from "./ui/TopHighlight";
import useReducedMotion from "./useReducedMotion";
import { theme, mix } from "./theme";
import * as DM from "./dm";
import type { Av } from "./dm";

const BEZ = Easing.bezier(...theme.motion.bezier);

function balancedVibes(vibes: DM.Vibe[]): DM.Vibe[] {
  const tags: string[] = [];
  const byTag = new Map<string, DM.Vibe[]>();
  for (const vibe of vibes) {
    if (!byTag.has(vibe.tag)) {
      byTag.set(vibe.tag, []);
      tags.push(vibe.tag);
    }
    byTag.get(vibe.tag)!.push(vibe);
  }
  const out: DM.Vibe[] = [];
  for (let depth = 0; out.length < vibes.length; depth += 1) {
    let added = false;
    for (const tag of tags) {
      const vibe = byTag.get(tag)![depth];
      if (vibe) {
        out.push(vibe);
        added = true;
      }
    }
    if (!added) break;
  }
  return out;
}

function nextChallengerIndex(queue: DM.Vibe[], winner: DM.Vibe): number {
  const sameTag = queue.findIndex((vibe) => vibe.tag === winner.tag);
  return sameTag >= 0 ? sameTag : 0;
}

export default function ThisOrThat({
  av, onWear, onClose, engine = "svg",
}: {
  av: Av;
  onWear: (vibe: DM.Vibe) => void;
  onClose: () => void;
  engine?: AvatarEngine;
}) {
  const initialPool = useMemo(() => balancedVibes(DM.vibes), []);
  const [champ, setChamp] = useState(initialPool[0]);
  const [challenger, setChallenger] = useState(initialPool[1]);
  const [queue, setQueue] = useState(() => initialPool.slice(2));
  const [round, setRound] = useState(0);
  const [done, setDone] = useState(false);
  const { width: W, height: H } = useWindowDimensions();
  const reduce = useReducedMotion();
  const enter = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (reduce) {
      enter.setValue(1);
      return;
    }
    enter.setValue(0);
    Animated.timing(enter, { toValue: 1, duration: theme.motion.dur.base, easing: BEZ, useNativeDriver: false }).start();
  }, [round, done, reduce, enter]);

  const totalRounds = initialPool.length - 1;
  const pick = (winner: DM.Vibe) => {
    setChamp(winner);
    if (!queue.length) {
      setDone(true);
      return;
    }
    const nextIndex = nextChallengerIndex(queue, winner);
    setChallenger(queue[nextIndex]);
    setQueue((q) => q.filter((_, i) => i !== nextIndex));
    setRound((r) => r + 1);
  };
  const narrow = W < 760;
  const cardH = narrow ? Math.max(210, Math.min((H - 210) / 2, 360)) : Math.min(H - 250, 620);
  const cardW = narrow ? Math.min(W - 44, cardH * 0.78) : Math.min((W - 104) / 2, cardH * 0.68);

  return (
    <View style={styles.root} accessibilityViewIsModal>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Find my vibe</Text>
          <Text style={styles.hint}>{done ? "This one felt right" : "Tap the one that feels more like you"}</Text>
        </View>
        <UIPressable accessibilityRole="button" accessibilityLabel="Back to studio" onPress={onClose}
          radius={theme.radius.pill} lift style={styles.closeBtn}>
          <Text style={styles.closeText}>Back</Text>
        </UIPressable>
      </View>

      {!done ? (
        <>
          <Animated.View style={[styles.pair, narrow && styles.pairNarrow, { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
            <VibeCard av={av} vibe={champ} w={cardW} h={cardH} engine={engine} onPress={() => pick(champ)} />
            <VibeCard av={av} vibe={challenger} w={cardW} h={cardH} engine={engine} onPress={() => pick(challenger)} />
          </Animated.View>
          <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {Array.from({ length: totalRounds }, (_, i) => (
              <View key={i} style={[styles.dot, i < round && styles.dotDone, i === round && styles.dotNow]} />
            ))}
          </View>
        </>
      ) : (
        <Animated.View style={[styles.result, { opacity: enter }]}>
              <VibeCard av={av} vibe={champ} w={cardW} h={cardH} engine={engine} />
          <View style={styles.resultBtns}>
            <UIPressable accessibilityRole="button" accessibilityLabel={`Wear ${champ.label}`}
              onPress={() => onWear(champ)} lift radius={theme.radius.pill}
              style={[styles.bigBtn, styles.bigBtnPrimary]}>
              <Hairline inset={16} />
              <Text style={styles.bigBtnTextPrimary}>Wear it</Text>
            </UIPressable>
            <UIPressable accessibilityRole="button" accessibilityLabel="Keep my current look"
              onPress={onClose} lift radius={theme.radius.pill} style={styles.bigBtn}>
              <Text style={styles.bigBtnText}>Not today</Text>
            </UIPressable>
          </View>
        </Animated.View>
      )}
    </View>
  );
}

// Card mat tinted from the vibe's own garment colors — quiet coordinated variation
// instead of uniform white tiles.
function VibeCard({ av, vibe, w, h, engine = "svg", onPress }: {
  av: Av;
  vibe: DM.Vibe;
  w: number;
  h: number;
  engine?: AvatarEngine;
  onPress?: () => void;
}) {
  const tintA = mix(vibe.ov.topColor ?? av.topColor, "#ffffff", 0.76);
  const tintB = mix(vibe.ov.bottomColor ?? av.bottomColor, "#ffffff", 0.86);
  const body = (
    <>
      <LinearGradient colors={[tintA, tintB]} start={{ x: 0, y: 0 }} end={{ x: 0.65, y: 1 }}
        style={[StyleSheet.absoluteFill, { borderRadius: theme.radius.xl - 2 }]} pointerEvents="none" />
      <RadialMat opacity={0.6} />
      <Hairline inset={18} />
      <View style={styles.tagPill}>
        <Text style={styles.tagText}>{vibe.tag}</Text>
      </View>
      <View style={{ width: w - 22, height: h }} pointerEvents="none">
        <AvatarCanvas av={av} ov={vibe.ov} engine={engine} />
      </View>
      <Text style={styles.cardLabel}>{vibe.label}</Text>
      <Text style={styles.cardNote} numberOfLines={1}>{vibe.note}</Text>
    </>
  );
  if (!onPress) {
    return <View style={[styles.card, { width: w, height: h + 84 }]}>{body}</View>;
  }
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={`${vibe.label}: ${vibe.note}`}
      onPress={onPress}
      lift
      radius={theme.radius.xl}
      style={[styles.card, { width: w, height: h + 84 }]}
    >
      {body}
    </UIPressable>
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.color.bg, zIndex: 60, paddingTop: 8 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 32, height: 80 },
  title: { fontFamily: theme.font.serif, fontSize: 28, color: theme.color.ink },
  hint: { marginTop: 2, fontSize: theme.type.base, fontWeight: "600", color: theme.color.inkSoft },
  closeBtn: { minHeight: 56, paddingHorizontal: 26, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, ...theme.shadow.sm },
  closeText: { fontSize: theme.type.body, fontWeight: "800", color: theme.color.ink },

  pair: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, paddingHorizontal: 24 },
  pairNarrow: { flexDirection: "column", gap: 14, paddingHorizontal: 16 },
  card: { alignItems: "center", paddingTop: 14, borderRadius: theme.radius.xl, backgroundColor: theme.color.surface,
    borderWidth: 1, borderColor: theme.color.line2, overflow: "hidden", ...theme.shadow.lg },
  tagPill: { alignSelf: "center", backgroundColor: "rgba(47,40,35,0.08)", paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: theme.radius.pill, marginBottom: 6 },
  tagText: { ...theme.eyebrow, color: theme.color.inkSoft },
  cardLabel: { marginTop: 4, fontSize: theme.type.lg, fontWeight: "800", color: theme.color.ink },
  cardNote: { marginTop: 1, marginBottom: 12, fontSize: theme.type.md, fontWeight: "600", color: theme.color.inkSoft, paddingHorizontal: 10 },

  dots: { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", gap: 7, paddingVertical: 14, paddingHorizontal: 24 },
  dot: { width: 9, height: 9, borderRadius: theme.radius.pill, backgroundColor: theme.color.line2 },
  dotDone: { backgroundColor: theme.color.sage },
  dotNow: { backgroundColor: theme.color.sageDeep },

  result: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, paddingBottom: 18 },
  resultBtns: { flexDirection: "row", gap: 14 },
  bigBtn: { minHeight: theme.tapLg, paddingHorizontal: 30, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, ...theme.shadow.sm },
  bigBtnPrimary: { backgroundColor: theme.color.terra, borderColor: theme.color.terraDeep },
  bigBtnText: { fontSize: theme.type.body + 1, fontWeight: "800", color: theme.color.ink },
  bigBtnTextPrimary: { fontSize: 19, fontWeight: "800", color: theme.color.onAccent },
});
