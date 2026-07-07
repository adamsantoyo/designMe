// designMe design tokens — ported from design-system/tokens (the validated palette,
// type scale, elevation, and motion system). Single source of truth; components
// consume tokens, never ad-hoc values. Keep these exact.
import { Platform } from "react-native";

export const theme = {
  color: {
    bg: "#ece7dc",
    bg2: "#dcd4c5",
    surface: "#fbf8f2",
    surface2: "#f4eee4",
    surface3: "#efe7d9",
    ink: "#2f2823",
    inkSoft: "#6b5f53",
    inkFaint: "#978a7b",
    line: "#ddd0bd",
    line2: "#cabfa9",
    sage: "#6f8f6a",
    sageDeep: "#3f5c3b",
    sageWash: "#eef3ea",
    terra: "#bd7a4f",
    terraDeep: "#8a5430",
    onAccent: "#ffffff",
    selected: "#355c39",
    focus: "#1f4d2c",
    danger: "#b23b43",
    // Dim behind an open tray/lookbook (animated 0 → ~0.3). Warm near-black, never gray.
    scrim: "#362614",
  },
  radius: { sm: 12, md: 18, lg: 22, xl: 26, xxl: 30, mat: 36, pill: 999 },
  // 4px base scale
  space: (n: number) => n * 4,
  tap: 48,
  tapLg: 66,
  font: {
    // Web reads a CSS font stack (react-native-web -> CSS + fontWeight); native can't
    // pick a weight off one custom family, so DMText (ui/Text) maps each weight to its
    // own loaded Nunito family. The serif is a single editorial weight, so it resolves
    // to the loaded Newsreader family directly on native.
    sans: 'Nunito, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", sans-serif',
    serif: Platform.select({
      web: 'Newsreader, Georgia, "Times New Roman", serif',
      default: "Newsreader_400Regular",
    }) as string,
  },
  // Type scale from design-system/tokens/typography.css (px, rounded for RN).
  // Serif is wordmark/editorial ONLY — never body.
  type: {
    xs: 11, // tags / eyebrows / badges
    sm: 12, // captions / tile labels
    md: 13, // secondary / hints
    base: 15, // controls / labels
    body: 16,
    lg: 18, // emphasized / tray titles
    xl: 25, // section titles
    display: 30, // wordmark
  },
  // Uppercase eyebrow label style (tracking is absolute px in RN, ≈0.07em @ 11px).
  eyebrow: {
    fontSize: 11,
    fontWeight: "800" as const,
    letterSpacing: 0.8,
    textTransform: "uppercase" as const,
  },
  // Signature motion system: one easing curve everywhere, three durations.
  // Consume via Easing.bezier(...theme.motion.bezier).
  motion: {
    bezier: [0.22, 0.61, 0.36, 1] as const,
    dur: { fast: 120, base: 200, slow: 420 },
  },
  shadow: {
    // Warm-brown shadows only (never gray/black) — the "handcrafted" material rule.
    // Android elevation can't tint; the gray fallback there is an accepted platform gap.
    sm: {
      shadowColor: "#3e2a16",
      shadowOpacity: 0.14,
      shadowRadius: 9,
      shadowOffset: { width: 0, height: 5 },
      elevation: 3,
    },
    md: {
      shadowColor: "#3e2a16",
      shadowOpacity: 0.09,
      shadowRadius: 6,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    },
    lg: {
      shadowColor: "#392b1c",
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6,
    },
    xl: {
      shadowColor: "#3e2a16",
      shadowOpacity: 0.2,
      shadowRadius: 28,
      shadowOffset: { width: 0, height: 14 },
      elevation: 10,
    },
  },
} as const;

// Linear blend of two hex colors (t=0 → a, t=1 → b) — JS stand-in for CSS
// color-mix(); used for per-vibe tinted card mats. Same math as the engine's shade().
export function mix(a: string, b: string, t: number): string {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (sa: number, sb: number) => Math.round(sa + (sb - sa) * t);
  const r = ch((pa >> 16) & 255, (pb >> 16) & 255);
  const g = ch((pa >> 8) & 255, (pb >> 8) & 255);
  const bl = ch(pa & 255, pb & 255);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + bl).toString(16).slice(1);
}

export type Theme = typeof theme;
