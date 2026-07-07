// The one interactive primitive: focus ring without layout shift, hover lift
// (web only — no-op on touch), press scale, all reduced-motion-gated.
// Replaces the duplicated FocusPressable implementations.

import * as React from "react";
import { Animated, Easing, Pressable as RNPressable, View, StyleSheet } from "react-native";
import { theme } from "../theme";
import useReducedMotion from "../useReducedMotion";

const APressable = Animated.createAnimatedComponent(RNPressable);

function Pressable({
  style,
  radius = theme.radius.md,
  lift = false,
  pressScale = true,
  children,
  onPressIn,
  onPressOut,
  onHoverIn,
  onHoverOut,
  onFocus,
  onBlur,
  ...props
}: any, ref: any) {
  const [focused, setFocused] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const press = React.useRef(new Animated.Value(0)).current;
  const reduce = useReducedMotion();

  const drive = (v: number) => {
    if (!pressScale) return;
    if (reduce) {
      press.setValue(v);
      return;
    }
    Animated.timing(press, {
      toValue: v,
      duration: theme.motion.dur.fast,
      easing: Easing.bezier(...theme.motion.bezier),
      useNativeDriver: false,
    }).start();
  };

  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.96] });
  const liftY = lift && hovered && !reduce ? -2 : 0;

  return (
    <APressable
      ref={ref}
      {...props}
      onFocus={(e: any) => {
        setFocused(true);
        onFocus?.(e);
      }}
      onBlur={(e: any) => {
        setFocused(false);
        onBlur?.(e);
      }}
      onHoverIn={(e: any) => {
        setHovered(true);
        onHoverIn?.(e);
      }}
      onHoverOut={(e: any) => {
        setHovered(false);
        onHoverOut?.(e);
      }}
      onPressIn={(e: any) => {
        drive(1);
        onPressIn?.(e);
      }}
      onPressOut={(e: any) => {
        drive(0);
        onPressOut?.(e);
      }}
      style={[
        ...(Array.isArray(style) ? style : [style]),
        lift && hovered ? theme.shadow.lg : null,
        { transform: [{ scale }, { translateY: liftY }] },
      ]}
    >
      {children}
      {/* Inner focus ring: overlay, zero layout impact, never clipped by overflow. */}
      {focused ? (
        <View
          pointerEvents="none"
          style={[styles.ring, { borderRadius: Math.max(4, radius - 2) }]}
        />
      ) : null}
    </APressable>
  );
}

export default React.forwardRef(Pressable);

const styles = StyleSheet.create({
  ring: {
    ...StyleSheet.absoluteFillObject,
    margin: 2,
    borderWidth: 3,
    borderColor: theme.color.focus,
  },
});
