// designMe — Avatar render surface.
// Pure function of state: buildOpts(av,ov) -> dmFigure SVG string -> <SvgXml>.
// `crop` swaps the viewBox to zoom a region (used by the tray tiles), exactly
// as the Claude Design export did. Memoized so re-renders only recompute on change.

import { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import SvgString from "./SvgString";
import PngFigure from "./PngFigure";
import dmFigure from "./engine/dmFigure";
import { buildOpts, type Av } from "./dm";

export default function AvatarCanvas({
  av, ov, crop, style, engine = "svg",
}: {
  av: Av;
  ov?: Partial<Av>;
  crop?: string; // viewBox string, e.g. "74 14 92 94"
  style?: any;
  engine?: "svg" | "png"; // "png" = the layered-PNG compositor; default stays the SVG engine
}) {
  if (engine === "png") {
    return (
      <View style={[styles.fill, style]} pointerEvents="none">
        <PngFigure av={av} ov={ov} crop={crop} />
      </View>
    );
  }

  return <SvgCanvas av={av} ov={ov} crop={crop} style={style} />;
}

function SvgCanvas({ av, ov, crop, style }: { av: Av; ov?: Partial<Av>; crop?: string; style?: any }) {
  const xml = useMemo(() => {
    let svg = dmFigure(buildOpts(av, ov));
    if (crop) {
      svg = svg
        .replace(/viewBox="[^"]+"/, `viewBox="${crop}"`)
        .replace(/preserveAspectRatio="[^"]+"/, 'preserveAspectRatio="xMidYMid meet"');
    }
    // ensure the <svg> fills its box in both dimensions
    svg = svg.replace('width="100%"', 'width="100%" height="100%"');
    return svg;
  }, [av, ov, crop]);

  return (
    <View style={[styles.fill, style]} pointerEvents="none">
      <SvgString xml={xml} width="100%" height="100%" />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
});
