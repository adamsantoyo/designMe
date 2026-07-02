// Color swatch dot — circular, selected = sage ring + slight scale lift.

import { View, StyleSheet } from "react-native";
import UIPressable from "./Pressable";
import { theme } from "../theme";

export default function ColorSwatch({
  color, aria, selected, onPress, size = 48,
}: {
  color: string;
  aria: string;
  selected: boolean;
  onPress: () => void;
  size?: number;
}) {
  return (
    <UIPressable
      accessibilityRole="button"
      accessibilityLabel={aria}
      accessibilityState={{ selected }}
      onPress={onPress}
      radius={theme.radius.pill}
      style={[
        styles.wrap,
        { width: size, height: size, borderRadius: size / 2 },
        selected && styles.wrapSel,
        selected && { transform: [{ scale: 1.04 }] },
      ]}
    >
      <View
        pointerEvents="none"
        style={[
          styles.dot,
          { backgroundColor: color, borderRadius: (size - 8) / 2, margin: 4, flex: 1 },
        ]}
      />
    </UIPressable>
  );
}

const styles = StyleSheet.create({
  wrap: { borderWidth: 2, borderColor: "rgba(0,0,0,0.08)", backgroundColor: theme.color.surface, ...theme.shadow.md },
  wrapSel: { borderWidth: 3, borderColor: theme.color.sage },
  dot: { borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
});
