// designMe design tokens — ported from design-system/tokens (the validated palette).
// Single source of truth for color/spacing/radius. Keep these exact.
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
  },
  radius: { sm: 12, md: 18, lg: 22, xl: 26, pill: 999 },
  // 4px base scale
  space: (n: number) => n * 4,
  tap: 48,
  tapLg: 66,
  font: {
    // Nunito / Newsreader fall back to system until expo-font loads them (TODO).
    sans: 'Nunito, "SF Pro Rounded", system-ui, -apple-system, "Segoe UI", sans-serif',
    serif: 'Newsreader, Georgia, "Times New Roman", serif',
  },
  shadow: {
    // RN shadow (iOS) + elevation (Android); web maps shadow* to box-shadow.
    lg: {
      shadowColor: "#392b1c",
      shadowOpacity: 0.14,
      shadowRadius: 24,
      shadowOffset: { width: 0, height: 12 },
      elevation: 6,
    },
    sm: {
      shadowColor: "#3e2a16",
      shadowOpacity: 0.12,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
      elevation: 2,
    },
  },
} as const;

export type Theme = typeof theme;
