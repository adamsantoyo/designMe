import React from "react";

/**
 * designMe SubTab — a pill tab for switching sub-views (e.g. Eyes /
 * Nose / Lips within Face). Selected fills ink for strong contrast.
 */
export function SubTab({ children, selected = false, onClick, style, ...rest }) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      style={{
        minHeight: "var(--tap)",
        padding: "6px 14px",
        borderRadius: "var(--radius-pill)",
        border: "1.5px solid",
        borderColor: selected ? "var(--ink)" : "var(--line-2)",
        background: selected ? "var(--ink)" : "var(--surface-2)",
        color: selected ? "var(--on-accent)" : "var(--ink-soft)",
        fontFamily: "var(--font-rounded)",
        fontSize: "var(--text-md)",
        fontWeight: "var(--weight-bold)",
        cursor: "pointer",
        transition: "background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease)",
        ...style,
      }}
      {...rest}
    >
      {children}
    </button>
  );
}
