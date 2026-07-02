// designMe — This-or-that ("Find my vibe"), the second door.
// Binary choice is the gold standard for switch scanning: exactly two big targets
// per round, no grids, no scrolling. The winner meets the next challenger; five calm
// rounds; deterministic. A vibe only changes clothes — never the person.
// Each card's mat is tinted from its own outfit colors (the VibeCard pattern).

import { useEffect, useRef, useState } from "react";
import { Animated, Easing, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import AvatarCanvas from "./AvatarCanvas";
import UIPressable from "./ui/Pressable";
import { Hairline, RadialMat } from "./ui/TopHighlight";
import useReducedMotion from "./useReducedMotion";
import { theme, mix } from "./theme";
import * as DM from "./dm";
import type { Av } from "./dm";

// Curated for spread: everyday / comfort / street / polished / soft / active.
const POOL_IDS = ["v_weekend", "v_cozyknit", "v_softstreet", "v_tailoring", "v_romantic", "v_athleisure"];
const BEZ = Easing.bezier(...theme.motion.bezier);

export default function ThisOrThat({
  av, onWear, onClose,
}: {
  av: Av;
  onWear: (vibe: DM.Vibe) => void;
  onClose: () => void;
}) {
  const pool = POOL_IDS
    .map((id) => DM.vibes.find((v) => v.id === id))
    .filter((v): v is DM.Vibe => !!v);
  const [champ, setChamp] = useState(0);
  const [round, setRound] = useState(0); // challenger = pool[round + 1]
  const [done, setDone] = useState(false);
  const { height: H } = useWindowDimensions();
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

  const challenger = round + 1;
  const totalRounds = pool.length - 1;
  const pick = (idx: number) => {
    setChamp(idx);
    if (challenger >= pool.length - 1) setDone(true);
    else setRound((r) => r + 1);
  };
  const cardH = Math.min(H - 310, 520);
  const cardW = (cardH * 62) / 100;

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
          <Animated.View style={[styles.pair, { opacity: enter, transform: [{ translateY: enter.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }] }]}>
            <VibeCard av={av} vibe={pool[champ]} w={cardW} h={cardH} onPress={() => pick(champ)} />
            <VibeCard av={av} vibe={pool[challenger]} w={cardW} h={cardH} onPress={() => pick(challenger)} />
          </Animated.View>
          <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {Array.from({ length: totalRounds }, (_, i) => (
              <View key={i} style={[styles.dot, i < round && styles.dotDone, i === round && styles.dotNow]} />
            ))}
          </View>
        </>
      ) : (
        <Animated.View style={[styles.result, { opacity: enter }]}>
          <VibeCard av={av} vibe={pool[champ]} w={cardW} h={cardH} />
          <View style={styles.resultBtns}>
            <UIPressable accessibilityRole="button" accessibilityLabel={`Wear ${pool[champ].label}`}
              onPress={() => onWear(pool[champ])} lift radius={theme.radius.pill}
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
function VibeCard({ av, vibe, w, h, onPress }: {
  av: Av;
  vibe: DM.Vibe;
  w: number;
  h: number;
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
      <View style={{ width: w - 28, height: h - 66 }} pointerEvents="none">
        <AvatarCanvas av={av} ov={vibe.ov} />
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
  card: { alignItems: "center", paddingTop: 14, borderRadius: theme.radius.xl, backgroundColor: theme.color.surface,
    borderWidth: 1, borderColor: "#e4d8c6", overflow: "hidden", ...theme.shadow.lg },
  tagPill: { alignSelf: "center", backgroundColor: "rgba(47,40,35,0.08)", paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: theme.radius.pill, marginBottom: 6 },
  tagText: { ...theme.eyebrow, color: theme.color.inkSoft },
  cardLabel: { marginTop: 4, fontSize: theme.type.lg, fontWeight: "800", color: theme.color.ink },
  cardNote: { marginTop: 1, marginBottom: 12, fontSize: theme.type.md, fontWeight: "600", color: theme.color.inkSoft, paddingHorizontal: 10 },

  dots: { flexDirection: "row", justifyContent: "center", gap: 9, paddingVertical: 18 },
  dot: { width: 9, height: 9, borderRadius: theme.radius.pill, backgroundColor: theme.color.line2 },
  dotDone: { backgroundColor: theme.color.sage },
  dotNow: { backgroundColor: theme.color.sageDeep },

  result: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, paddingBottom: 18 },
  resultBtns: { flexDirection: "row", gap: 14 },
  bigBtn: { minHeight: 64, paddingHorizontal: 30, borderRadius: theme.radius.pill, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, ...theme.shadow.sm },
  bigBtnPrimary: { backgroundColor: theme.color.terra, borderColor: theme.color.terraDeep },
  bigBtnText: { fontSize: theme.type.body + 1, fontWeight: "800", color: theme.color.ink },
  bigBtnTextPrimary: { fontSize: 19, fontWeight: "800", color: theme.color.onAccent },
});
