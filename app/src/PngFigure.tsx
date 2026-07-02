// PNG compositor — NATIVE (iOS). Stacks part PNGs with resizeMode "contain" so every
// 1024×1536 layer co-registers. Recolor here uses Image `tintColor`, which FLATTENS
// to one color (loses the master's soft shading) — a stopgap. The real native path is
// a Skia multiply ColorFilter (needs an Expo dev build); see docs/avatar-engine.md.
import { Image, StyleSheet, Text, View } from "react-native";
import { resolveLayers, heightScaleY, coverage } from "./parts/layers";
import { partCount } from "./parts/registry";
import { theme } from "./theme";
import type { Av } from "./dm";

export default function PngFigure({ av }: { av: Av; ov?: Partial<Av>; crop?: string }) {
  const layers = resolveLayers(av);

  if (partCount() === 0 || layers.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>
          Drop ChatGPT PNGs into app/assets/parts/ and register them in
          src/parts/registry.ts — they appear here.
        </Text>
      </View>
    );
  }

  const cov = coverage(av);
  return (
    <View style={[styles.fill, { transform: [{ scaleY: heightScaleY(av.height) }] }]}>
      {layers.map((l) => (
        <Image
          key={l.slot}
          source={l.ref}
          resizeMode="contain"
          style={StyleSheet.absoluteFill}
          // tintColor flattens shading — stopgap until Skia multiply.
          {...(l.tint ? { tintColor: l.tint } : {})}
        />
      ))}
      {__DEV__ && cov.have < cov.want ? (
        // Dev-only: mark partial composites as in-progress, never product.
        <View style={styles.covChip} pointerEvents="none">
          <Text style={styles.covChipText}>{cov.have}/{cov.want} parts</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
  empty: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  emptyText: { color: theme.color.inkSoft, fontSize: 14, fontWeight: "700", textAlign: "center" },
  covChip: { position: "absolute", bottom: 6, alignSelf: "center", paddingHorizontal: 10, paddingVertical: 3,
    borderRadius: 999, backgroundColor: "rgba(47,40,35,0.72)" },
  covChipText: { color: "#fbf8f2", fontSize: 11, fontWeight: "800" },
});
