// designMe — This-or-that ("Find my vibe"), the second door.
// Binary choice is the gold standard for switch scanning: exactly two big targets
// per round, no grids, no scrolling. The app proposes two dressed looks; the user
// taps the one that feels right; the winner meets the next challenger. Five calm
// rounds, then the winning vibe can be worn. Deterministic: fixed pool, fixed
// order, no randomness. A vibe only changes clothes — never the person.

import { useState } from "react";
import { Pressable, StyleSheet, Text, View, useWindowDimensions } from "react-native";
import AvatarCanvas from "./AvatarCanvas";
import { theme } from "./theme";
import * as DM from "./dm";
import type { Av } from "./dm";

// Curated for spread: everyday / comfort / street / polished / soft / active.
const POOL_IDS = ["v_weekend", "v_cozyknit", "v_softstreet", "v_tailoring", "v_romantic", "v_athleisure"];

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

  const challenger = round + 1;
  const totalRounds = pool.length - 1;
  const pick = (idx: number) => {
    setChamp(idx);
    if (challenger >= pool.length - 1) setDone(true);
    else setRound((r) => r + 1);
  };
  const cardH = Math.min(H - 300, 520);
  const cardW = (cardH * 62) / 100;

  const card = (vibe: DM.Vibe, idx: number) => (
    <FocusPressable
      key={vibe.id}
      accessibilityRole="button"
      accessibilityLabel={`${vibe.label}: ${vibe.note}`}
      onPress={() => pick(idx)}
      style={[styles.card, { width: cardW, height: cardH + 74 }]}
    >
      <View style={{ width: cardW - 24, height: cardH - 10 }}>
        <AvatarCanvas av={av} ov={vibe.ov} />
      </View>
      <Text style={styles.cardLabel}>{vibe.label}</Text>
      <Text style={styles.cardNote} numberOfLines={1}>{vibe.note}</Text>
    </FocusPressable>
  );

  return (
    <View style={styles.root} accessibilityViewIsModal>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Find my vibe</Text>
          <Text style={styles.hint}>{done ? "This one felt right" : "Tap the one that feels more like you"}</Text>
        </View>
        <FocusPressable accessibilityRole="button" accessibilityLabel="Back to studio" onPress={onClose} style={styles.closeBtn}>
          <Text style={styles.closeText}>Back</Text>
        </FocusPressable>
      </View>

      {!done ? (
        <>
          <View style={styles.pair}>
            {card(pool[champ], champ)}
            {card(pool[challenger], challenger)}
          </View>
          <View style={styles.dots} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
            {Array.from({ length: totalRounds }, (_, i) => (
              <View key={i} style={[styles.dot, i < round && styles.dotDone, i === round && styles.dotNow]} />
            ))}
          </View>
        </>
      ) : (
        <View style={styles.result}>
          <View style={[styles.card, { width: cardW, height: cardH + 74 }]}>
            <View style={{ width: cardW - 24, height: cardH - 10 }}>
              <AvatarCanvas av={av} ov={pool[champ].ov} />
            </View>
            <Text style={styles.cardLabel}>{pool[champ].label}</Text>
            <Text style={styles.cardNote} numberOfLines={1}>{pool[champ].note}</Text>
          </View>
          <View style={styles.resultBtns}>
            <FocusPressable accessibilityRole="button" accessibilityLabel={`Wear ${pool[champ].label}`}
              onPress={() => onWear(pool[champ])} style={[styles.bigBtn, styles.bigBtnPrimary]}>
              <Text style={styles.bigBtnTextPrimary}>Wear it</Text>
            </FocusPressable>
            <FocusPressable accessibilityRole="button" accessibilityLabel="Keep my current look"
              onPress={onClose} style={styles.bigBtn}>
              <Text style={styles.bigBtnText}>Not today</Text>
            </FocusPressable>
          </View>
        </View>
      )}
    </View>
  );
}

function FocusPressable({ style, ...props }: any) {
  const [focused, setFocused] = useState(false);
  return (
    <Pressable
      {...props}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={(state: any) => [typeof style === "function" ? style(state) : style, focused && styles.focusVisible]}
    />
  );
}

const styles = StyleSheet.create({
  root: { ...StyleSheet.absoluteFillObject, backgroundColor: theme.color.bg, zIndex: 60, paddingTop: 8 },
  head: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 32, height: 80 },
  title: { fontFamily: theme.font.serif, fontSize: 28, color: theme.color.ink },
  hint: { marginTop: 2, fontSize: 15, fontWeight: "600", color: theme.color.inkSoft },
  closeBtn: { minHeight: 64, paddingHorizontal: 24, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, ...theme.shadow.sm },
  closeText: { fontSize: 16, fontWeight: "800", color: theme.color.ink },

  pair: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 28, paddingHorizontal: 24 },
  card: { alignItems: "center", paddingTop: 12, borderRadius: 26, backgroundColor: theme.color.surface,
    borderWidth: 1, borderColor: "#e4d8c6", ...theme.shadow.lg },
  cardLabel: { marginTop: 2, fontSize: 18, fontWeight: "800", color: theme.color.ink },
  cardNote: { marginTop: 1, marginBottom: 10, fontSize: 13, fontWeight: "600", color: theme.color.inkSoft, paddingHorizontal: 10 },

  dots: { flexDirection: "row", justifyContent: "center", gap: 9, paddingVertical: 18 },
  dot: { width: 9, height: 9, borderRadius: 999, backgroundColor: theme.color.line2 },
  dotDone: { backgroundColor: theme.color.sage },
  dotNow: { backgroundColor: theme.color.sageDeep },

  result: { flex: 1, alignItems: "center", justifyContent: "center", gap: 20, paddingBottom: 18 },
  resultBtns: { flexDirection: "row", gap: 14 },
  bigBtn: { minHeight: 66, paddingHorizontal: 30, borderRadius: 18, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.color.surface, borderWidth: 1, borderColor: theme.color.line, ...theme.shadow.sm },
  bigBtnPrimary: { backgroundColor: theme.color.terra, borderColor: theme.color.terraDeep },
  bigBtnText: { fontSize: 17, fontWeight: "800", color: theme.color.ink },
  bigBtnTextPrimary: { fontSize: 17, fontWeight: "800", color: theme.color.onAccent },

  focusVisible: { borderColor: theme.color.focus, borderWidth: 3, shadowColor: theme.color.focus, shadowOpacity: 0.24,
    shadowRadius: 10, shadowOffset: { width: 0, height: 0 }, elevation: 5 },
});
