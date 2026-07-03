import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  Canvas,
  ColorMatrix,
  FitBox,
  Group,
  Image as SkiaImage,
  useImage,
} from "@shopify/react-native-skia";
import { coverage, heightScaleY, resolveLayers, type Layer } from "./parts/layers";
import { partCount } from "./parts/registry";
import { theme } from "./theme";
import type { Av } from "./dm";

const PNG_W = 1024;
const PNG_H = 1536;
const SVG_W = 240;
const SVG_H = 490;

type Props = { av: Av; ov?: Partial<Av>; crop?: string };
type Rect = { x: number; y: number; width: number; height: number };

const FULL_RECT: Rect = { x: 0, y: 0, width: PNG_W, height: PNG_H };

function sourceRect(crop?: string): Rect {
  if (!crop) return FULL_RECT;
  const n = crop.trim().split(/\s+/).map(Number);
  if (n.length !== 4 || n.some((x) => !Number.isFinite(x))) return FULL_RECT;
  return {
    x: (n[0] / SVG_W) * PNG_W,
    y: (n[1] / SVG_H) * PNG_H,
    width: (n[2] / SVG_W) * PNG_W,
    height: (n[3] / SVG_H) * PNG_H,
  };
}

function tintMatrix(hex: string): number[] {
  const raw = hex.replace("#", "");
  const n = raw.length === 6 ? parseInt(raw, 16) : 0xffffff;
  const r = ((n >> 16) & 255) / 255;
  const g = ((n >> 8) & 255) / 255;
  const b = (n & 255) / 255;
  return [
    r, 0, 0, 0, 0,
    0, g, 0, 0, 0,
    0, 0, b, 0, 0,
    0, 0, 0, 1, 0,
  ];
}

function LayerImage({ layer }: { layer: Layer }) {
  const image = useImage(layer.ref);
  const body = (
    <SkiaImage
      image={image}
      x={0}
      y={0}
      width={PNG_W}
      height={PNG_H}
      fit="fill"
    />
  );

  if (!layer.tint) return body;
  return (
    <Group>
      <ColorMatrix matrix={tintMatrix(layer.tint)} />
      {body}
    </Group>
  );
}

export default function SkiaFigure({ av, ov, crop }: Props) {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const layers = useMemo(() => resolveLayers(av, ov), [av, ov]);
  const src = useMemo(() => sourceRect(crop), [crop]);
  const cov = useMemo(() => coverage(av, ov), [av, ov]);

  if (partCount() === 0 || layers.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>PNG art is not registered for this look yet.</Text>
      </View>
    );
  }

  return (
    <View
      style={[styles.fill, { transform: [{ scaleY: heightScaleY(av.height) }] }]}
      onLayout={(e) => {
        const { width, height } = e.nativeEvent.layout;
        setSize({ width, height });
      }}
    >
      {size.width > 0 && size.height > 0 ? (
        <Canvas style={StyleSheet.absoluteFill} mode="default">
          <FitBox fit="contain" src={src} dst={{ x: 0, y: 0, width: size.width, height: size.height }}>
            {layers.map((layer) => (
              <LayerImage key={`${layer.slot}:${layer.key}`} layer={layer} />
            ))}
          </FitBox>
        </Canvas>
      ) : null}

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
