// Tray option tile — the design-system CategoryTile/Swatch pattern:
// gradient surface, 2px border, selected = sage border + soft glow wash + corner
// check badge, hover lift. Label never truncates weirdly small (12px, one line).

import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Path } from "react-native-svg";
import UIPressable from "./Pressable";
import Text from "./Text";
import AvatarCanvas, { type AvatarEngine } from "../AvatarCanvas";
import { theme } from "../theme";
import type { Av } from "../dm";

export default function OptionTile({
  av, ov, crop, label, aria, selected, onPress, size = 130, engine = "svg",
}: {
  av: Av;
  ov?: Partial<Av>;
  crop?: string;
  label: string;
  aria: string;
  selected: boolean;
  onPress: () => void;
  size?: number;
  engine?: AvatarEngine;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={aria}
      accessibilityState={{ selected }}
      onPress={onPress}
      lift
      radius={theme.radius.lg}
      style={[styles.tile, { width: size, height: size }, selected && styles.tileSel]}
    >
      <LinearGradient
        colors={[theme.color.surface, theme.color.surface2]}
        style={[StyleSheet.absoluteFill, { borderRadius: theme.radius.lg - 2 }]}
        pointerEvents="none"
      />
      {selected ? (
        <View pointerEvents="none" style={[StyleSheet.absoluteFillObject, styles.selWash]} />
      ) : null}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <AvatarCanvas av={av} ov={ov} crop={crop} engine={engine} />
      </View>
      <View pointerEvents="none" style={styles.labelWrap}>
        <Text style={styles.label} numberOfLines={1}>{label}</Text>
      </View>
      {selected ? (
        <View pointerEvents="none" style={styles.check}>
          <Svg viewBox="0 0 24 24" width={13} height={13}>
            <Path d="M20 6 9 17l-5-5" stroke="#fff" strokeWidth={3.6} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          </Svg>
        </View>
      ) : null}
    </UIPressable>
  );
}

const styles = StyleSheet.create({
  tile: { borderRadius: theme.radius.lg, borderWidth: 2, borderColor: theme.color.line,
    backgroundColor: theme.color.surface2, overflow: "hidden", ...theme.shadow.md },
  tileSel: { borderColor: theme.color.sage },
  selWash: { backgroundColor: "rgba(111,143,106,0.10)", borderRadius: theme.radius.lg - 2 },
  labelWrap: { position: "absolute", left: 8, right: 8, bottom: 8, alignItems: "center" },
  label: { maxWidth: "100%", color: theme.color.ink, backgroundColor: "rgba(251,248,242,0.9)",
    borderRadius: theme.radius.pill, overflow: "hidden", paddingHorizontal: 10, paddingVertical: 3.5,
    fontSize: theme.type.sm, fontWeight: "800" },
  check: { position: "absolute", top: 8, right: 8, width: 24, height: 24, borderRadius: theme.radius.pill,
    backgroundColor: theme.color.sage, alignItems: "center", justifyContent: "center",
    borderWidth: 2, borderColor: theme.color.surface },
});
