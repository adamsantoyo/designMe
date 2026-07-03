// designMe — Avatar render surface.
// Pure function of state: buildOpts(av,ov) -> dmFigure SVG string -> <SvgXml>.
// `crop` swaps the viewBox to zoom a region (used by the tray tiles).
// `crossfade` (stage canvas only — never tray tiles) soft-swaps part changes with a
// 200ms opacity fade instead of an instant pop; reduced-motion snaps.

import { useEffect, useMemo, useRef, useState } from "react";
import { Animated, Easing, View, StyleSheet } from "react-native";
import SvgString from "./SvgString";
import PngFigure from "./PngFigure";
import FoundryHeroFigure from "./FoundryHeroFigure";
import dmFigure from "./engine/dmFigure";
import { supportsFoundryAv } from "./engine/dmFigureV2";
import useReducedMotion from "./useReducedMotion";
import { theme } from "./theme";
import { buildOpts, type Av } from "./dm";
import { coverage } from "./parts/layers";

export type AvatarEngine = "svg" | "png" | "foundry";

export default function AvatarCanvas({
  av, ov, crop, style, engine = "svg", crossfade = false,
}: {
  av: Av;
  ov?: Partial<Av>;
  crop?: string; // viewBox string, e.g. "74 14 92 94"
  style?: any;
  engine?: AvatarEngine; // "foundry" and "png" are explicit lab paths; SVG is the product default
  crossfade?: boolean;
}) {
  if (engine === "foundry") {
    if (!supportsFoundryAv(av, ov) || crop) {
      if (crossfade) return <CrossfadeCanvas av={av} ov={ov} crop={crop} style={style} />;
      return <SvgCanvas av={av} ov={ov} crop={crop} style={style} />;
    }
    return <FoundryHeroFigure style={style} />;
  }

  if (engine === "png") {
    const cov = coverage(av, ov);
    if (cov.have < cov.want) {
      // Never present a partial PNG stack as the product. Unsupported catalog
      // combinations stay complete through the deterministic SVG fallback until
      // their PNG layers exist.
      if (crossfade) return <CrossfadeCanvas av={av} ov={ov} crop={crop} style={style} />;
      return <SvgCanvas av={av} ov={ov} crop={crop} style={style} />;
    }
    return (
      <View style={[styles.fill, style]} pointerEvents="none">
        <PngFigure av={av} ov={ov} crop={crop} />
      </View>
    );
  }
  if (crossfade) return <CrossfadeCanvas av={av} ov={ov} crop={crop} style={style} />;
  return <SvgCanvas av={av} ov={ov} crop={crop} style={style} />;
}

function applyCrop(svg: string, crop?: string) {
  if (!crop) return svg;
  return svg
    .replace(/viewBox="[^"]+"/, `viewBox="${crop}"`)
    .replace(/preserveAspectRatio="[^"]+"/, 'preserveAspectRatio="xMidYMid meet"');
}

function fillSvg(svg: string) {
  return svg.replace('width="100%"', 'width="100%" height="100%"');
}

function useXml(av: Av, ov?: Partial<Av>, crop?: string) {
  return useMemo(() => {
    let svg = dmFigure(buildOpts(av, ov));
    svg = applyCrop(svg, crop);
    // ensure the <svg> fills its box in both dimensions
    return fillSvg(svg);
  }, [av, ov, crop]);
}

function SvgCanvas({ av, ov, crop, style }: { av: Av; ov?: Partial<Av>; crop?: string; style?: any }) {
  const xml = useXml(av, ov, crop);
  return (
    <View style={[styles.fill, style]} pointerEvents="none">
      <SvgString xml={xml} width="100%" height="100%" />
    </View>
  );
}

function CrossfadeCanvas({ av, ov, crop, style }: { av: Av; ov?: Partial<Av>; crop?: string; style?: any }) {
  const xml = useXml(av, ov, crop);
  const reduce = useReducedMotion();
  const [layers, setLayers] = useState<{ key: number; xml: string }[]>(() => [{ key: 0, xml }]);
  const fade = useRef(new Animated.Value(1)).current;
  const keyRef = useRef(0);
  const xmlRef = useRef(xml);

  useEffect(() => {
    if (xml === xmlRef.current) return;
    xmlRef.current = xml;
    keyRef.current += 1;
    if (reduce) {
      fade.setValue(1);
      setLayers([{ key: keyRef.current, xml }]);
      return;
    }
    setLayers((prev) => [prev[prev.length - 1], { key: keyRef.current, xml }]);
    fade.setValue(0);
    Animated.timing(fade, {
      toValue: 1,
      duration: theme.motion.dur.base,
      easing: Easing.bezier(...theme.motion.bezier),
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) setLayers((l) => l.slice(-1));
    });
  }, [xml, reduce, fade]);

  return (
    <View style={[styles.fill, style]} pointerEvents="none">
      {layers.map((l, i) => (
        <Animated.View
          key={l.key}
          style={[
            StyleSheet.absoluteFill,
            layers.length > 1 && i === layers.length - 1 ? { opacity: fade } : null,
          ]}
        >
          <SvgString xml={l.xml} width="100%" height="100%" />
        </Animated.View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
});
