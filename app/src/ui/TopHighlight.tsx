// The "studio light on paper" material pieces.
// Hairline ≈ CSS `inset 0 1px 0 rgba(255,255,255,.7)` (RN has no inset shadows).
// RadialMat = the radial top-highlight (soft light hitting the mat from above),
// a true radial gradient via react-native-svg (already a dependency; its primitive
// components work on web — only SvgXml doesn't).

import * as React from "react";
import { View } from "react-native";
import Svg, { Defs, RadialGradient, Stop, Rect } from "react-native-svg";

export function Hairline({ radius = 1, inset = 10 }: { radius?: number; inset?: number }) {
  return (
    <View
      pointerEvents="none"
      style={{
        position: "absolute",
        top: 0,
        left: inset,
        right: inset,
        height: 1,
        borderRadius: radius,
        backgroundColor: "rgba(255,255,255,0.7)",
      }}
    />
  );
}

let uid = 0;

export function RadialMat({ opacity = 0.8 }: { opacity?: number }) {
  const id = React.useRef(`mat${++uid}`).current;
  return (
    <View pointerEvents="none" style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}>
      <Svg width="100%" height="100%">
        <Defs>
          <RadialGradient id={id} cx="50%" cy="14%" rx="86%" ry="70%">
            <Stop offset="0" stopColor="#fffaf1" stopOpacity={opacity} />
            <Stop offset="0.55" stopColor="#fffaf1" stopOpacity={opacity * 0.35} />
            <Stop offset="1" stopColor="#fffaf1" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <Rect x="0" y="0" width="100%" height="100%" fill={`url(#${id})`} />
      </Svg>
    </View>
  );
}
