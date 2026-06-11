import React from "react";

/**
 * designMe Chip — a rounded filter/toggle pill (e.g. the vibe "style
 * world" filters). aria-pressed selected state fills sage.
 */
export function Chip({ children, selected = false, onClick, style, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        minHeight: 40,
        padding: "8px 16px",
        borderRadius: "var(--radius-pill)",
        border: "1.5px solid",
        borderColor: selected ? "var(--sage)" : "var(--line-2)",
        background: selected ? "var(--sage)" : "var(--surface)",
        color: selected ? "var(--on-accent)" : "var(--ink-soft)",
        fontFamily: "var(--font-rounded)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-extra)",
        cursor: "pointer",
        boxShadow: selected ? "var(--ring-sage-glow)" : "none",
        transition: "background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
