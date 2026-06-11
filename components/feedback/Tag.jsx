import React from "react";

/**
 * designMe Tag — an editorial eyebrow chip used to demote trend/
 * jargon words (e.g. "monochrome", "soft romantic"). Tiny, uppercase,
 * low-contrast so the concrete label stays primary.
 */
export function Tag({ children, style, ...rest }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 8px",
        borderRadius: "var(--radius-pill)",
        background: "rgba(41,35,31,.08)",
        color: "var(--ink-soft)",
        fontFamily: "var(--font-rounded)",
        fontSize: "var(--text-2xs)",
        fontWeight: "var(--weight-black)",
        letterSpacing: "var(--tracking-eyebrow)",
        textTransform: "uppercase",
        ...style,
      }}
      {...rest}
    >
      {children}
    </span>
  );
}
