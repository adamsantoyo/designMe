import React from "react";

/**
 * designMe Badge — a small rounded status/count pill on a tinted
 * surface. Use for soft labels like "New" or a saved count.
 */
export function Badge({ children, tone = "neutral", style, ...rest }) {
  const tones = {
    neutral: { background: "var(--bg-2)", color: "var(--ink-soft)", border: "var(--line-2)" },
    sage: { background: "var(--sage-wash)", color: "var(--sage-deep)", border: "var(--sage)" },
    terra: { background: "rgba(189,122,79,.14)", color: "var(--terra-deep)", border: "var(--terra)" },
    ink: { background: "var(--ink)", color: "var(--on-accent)", border: "var(--ink)" },
  };
  const t = tones[tone] || tones.neutral;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        padding: "3px 9px",
        borderRadius: "var(--radius-pill)",
        background: t.background,
        color: t.color,
        border: `1px solid ${t.border}`,
        fontFamily: "var(--font-rounded)",
        fontSize: "var(--text-2xs)",
        fontWeight: "var(--weight-extra)",
        letterSpacing: ".4px",
        textTransform: "uppercase",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
