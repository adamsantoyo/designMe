// designMe — SVG-parts avatar figure (Story 2.4, the premium vector path).
// Pure function of state: resolveLayers(av, ov, svgSource) -> tinted part markup
// -> one <svg> string -> <SvgString> (SvgXml native / innerHTML web). Bypasses
// the Skia PNG compositor entirely; same manifest z-order, same recolor matrix.
// `crop` zooms a tray-tile region (240x490-authored string, remapped in the
// engine core); height renders as an SVG-native bottom-anchored scale.

import { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import SvgString from "./SvgString";
import { buildSvgPartsXml } from "./engine/svgPartsFigure";
import { coverage, heightScaleY, resolveLayers, type PartSource } from "./parts/layers";
import { PARTS_SVG_BBOX, hasSvgPart, svgPartCount, svgPartRef } from "./parts/svgRegistry";
import { theme } from "./theme";
import type { Av } from "./dm";

// The svgparts asset source: same manifest contract, markup strings for refs.
// AvatarCanvas uses this for its coverage gate before choosing this engine.
export const svgSource: PartSource = { hasPart: hasSvgPart, partRef: svgPartRef };

type Props = { av: Av; ov?: Partial<Av>; crop?: string };

export default function SvgPartsFigure({ av, ov, crop }: Props) {
  // Key on serialized state, not object identity — a fresh `ov` literal per tray tile
  // would otherwise re-resolve every visible tile's full layer stack on each render.
  const stateKey = `${JSON.stringify(av)}|${ov ? JSON.stringify(ov) : ""}`;
  const layers = useMemo(
    () => resolveLayers(av, ov, svgSource).map((l) => ({ ...l, bbox: PARTS_SVG_BBOX[l.key] })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [stateKey],
  );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cov = useMemo(() => coverage(av, ov, svgSource), [stateKey]);
  // ov must win for height too — the body tray previews heights via ov.height.
  const hScale = heightScaleY(String(ov?.height ?? av.height));
  const xml = useMemo(
    () => buildSvgPartsXml(layers, { heightScale: hScale, crop }),
    [layers, hScale, crop],
  );

  if (svgPartCount() === 0 || layers.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>SVG art is not registered for this look yet.</Text>
      </View>
    );
  }

  return (
    <View style={styles.fill} pointerEvents="none">
      <SvgString xml={xml} width="100%" height="100%" />

      {__DEV__ && cov.have < cov.want ? (
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
