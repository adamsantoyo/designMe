import React from "react";

/**
 * designMe Toast — a gentle, low-arousal confirmation pill. Two tones:
 * "ink" (dark, neutral confirmation, as in the prototype) and "sage"
 * (the in-card "Saved" affirmation). No auto-stacking, no urgency.
 */
export function Toast({ children, tone = "ink", icon = null, show = true, style, ...rest }) {
  const tones = {
    ink: { background: "var(--ink)", color: "var(--on-accent)" },
    sage: { background: "var(--sage-deep)", color: "var(--on-accent)" },
  };
  const t = tones[tone] || tones.ink;
  return (
    <div
      role="status"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "11px 20px",
        borderRadius: "var(--radius-pill)",
        background: t.background,
        color: t.color,
        fontFamily: "var(--font-rounded)",
        fontSize: "var(--text-md)",
        fontWeight: "var(--weight-bold)",
        boxShadow: "var(--shadow-xl)",
        opacity: show ? 1 : 0,
        transform: show ? "translateY(0)" : "translateY(-8px)",
        transition: "opacity var(--dur-base) var(--ease), transform var(--dur-base) var(--ease)",
        pointerEvents: "none",
        ...style,
      }}
      {...rest}
    >
      {icon ? <span style={{ display: "inline-flex" }} aria-hidden="true">{icon}</span> : null}
      {children}
    </div>
  );
}
