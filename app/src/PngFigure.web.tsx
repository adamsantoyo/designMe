import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { theme } from "./theme";
import type { Av } from "./dm";

type Props = { av: Av; ov?: Partial<Av>; crop?: string };
type FigureComponent = (props: Props) => JSX.Element;
declare const require: (path: string) => any;

export default function PngFigure(props: Props) {
  const [Figure, setFigure] = useState<FigureComponent | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const skiaWeb = require("@shopify/react-native-skia/lib/module/web");
        await skiaWeb.LoadSkiaWeb({ locateFile: () => "/canvaskit.wasm" });
        const mod = require("./SkiaFigure");
        if (mounted) setFigure(() => mod.default);
      } catch (error) {
        console.warn("[designMe] Skia web failed to load", error);
        if (mounted) setFailed(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (Figure) return <Figure {...props} />;

  return (
    <View style={styles.fill} pointerEvents="none">
      {failed ? <Text style={styles.hint}>PNG renderer unavailable</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  hint: { color: theme.color.inkSoft, fontSize: 12, fontWeight: "800" },
});
