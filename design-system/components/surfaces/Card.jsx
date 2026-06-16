import React from "react";

/**
 * designMe Card — a soft paper panel with warm shadow and hairline
 * border. The default surface for grouping controls and content.
 * `tone="raised"` adds the radial highlight used by the avatar card.
 */
export function Card({ children, tone = "flat", padding = 12, style, ...rest }) {
  const tones = {
    flat: { background: "var(--surface)" },
    raised: {
      background:
        "radial-gradient(120% 80% at 50% 12%, #fcf9f4 0%, var(--surface) 55%, var(--surface-2) 100%)",
    },
    inset: { background: "var(--surface-2)" },
  };
  const t = tones[tone] || tones.flat;
  return (
    <div
      style={{
        background: t.background,
        border: "1.5px solid var(--line)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-md)",
        padding,
        ...style,
      }}
      {...rest}
    >
      {children}
    </div>
  );
}
