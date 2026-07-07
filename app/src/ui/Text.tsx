// designMe — the app's default Text. Every string in the UI should render in the
// brand sans (Nunito); before this, no component set fontFamily, so all body text fell
// back to the system font. Import this as `Text` and existing <Text> usages upgrade for
// free.
//
// Web: react-native-web maps a CSS font stack + fontWeight to CSS, so one family value
// ("Nunito, ...") plus the caller's fontWeight is enough. Native: RN can't select a
// weight off a single custom family, so each weight is its own loaded family — we read
// the style's fontWeight and swap in the matching Nunito_* family. A caller that already
// sets a fontFamily (e.g. the serif wordmark) passes straight through untouched.

import { Platform, StyleSheet, Text as RNText, type TextProps, type TextStyle } from "react-native";
import { theme } from "../theme";

const WEB_BASE = { fontFamily: theme.font.sans } as const;

// Every value here must be a family loaded in App.tsx useFonts. The app only uses
// 400/600/700/800; the off-scale weights map to the nearest loaded family so an
// unexpected weight still renders Nunito instead of falling back to the system font.
const NUNITO_NATIVE: Record<string, string> = {
  "300": "Nunito_400Regular",
  "400": "Nunito_400Regular",
  normal: "Nunito_400Regular",
  "500": "Nunito_600SemiBold",
  "600": "Nunito_600SemiBold",
  "700": "Nunito_700Bold",
  bold: "Nunito_700Bold",
  "800": "Nunito_800ExtraBold",
  "900": "Nunito_800ExtraBold",
};

export default function Text({ style, ...rest }: TextProps) {
  if (Platform.OS === "web") {
    return <RNText style={[WEB_BASE, style]} {...rest} />;
  }
  const flat = StyleSheet.flatten(style) as TextStyle | undefined;
  // Respect an explicit family (the serif titles set their own).
  if (flat?.fontFamily) return <RNText style={style} {...rest} />;
  const weight = flat?.fontWeight != null ? String(flat.fontWeight) : "400";
  const fontFamily = NUNITO_NATIVE[weight] ?? NUNITO_NATIVE["400"];
  // The family already encodes the weight; pin fontWeight to normal so the OS doesn't
  // synthesize a second bold on top of an already-bold family.
  return <RNText style={[style, { fontFamily, fontWeight: "400" }]} {...rest} />;
}
