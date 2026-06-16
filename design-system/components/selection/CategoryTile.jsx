import React from "react";

/**
 * designMe CategoryTile — a vertical icon + label tile for the primary
 * "what do you want to change" navigation (Vibe / Fit / Hair / …).
 * Selected uses a sage tint + ring. Pass a Lucide-style `icon` node.
 */
export function CategoryTile({
  icon = null,
  label,
  selected = false,
  onClick,
  style,
  ...rest
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
      style={{
        minHeight: "var(--tap-lg)",
        minWidth: 70,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 4,
        padding: "8px 6px",
        border: "1.5px solid",
        borderColor: selected ? "var(--sage)" : "var(--line-2)",
        background: selected ? "var(--sage-wash)" : "var(--surface)",
        borderRadius: "var(--radius-md)",
        color: selected ? "var(--sage-deep)" : "var(--ink-soft)",
        boxShadow: selected ? "var(--ring-sage-glow)" : "none",
        cursor: "pointer",
        fontFamily: "var(--font-rounded)",
        transition:
          "transform var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease), color var(--dur-fast) var(--ease)",
        ...style,
      }}
      {...rest}
    >
      {icon ? (
        <span style={{ display: "inline-flex", width: 26, height: 26 }} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-bold)" }}>{label}</span>
    </button>
  );
}
