import React from "react";

/**
 * designMe Swatch — the core recognition-first choice tile. Holds a
 * visual preview (mini avatar, color dot, garment) plus a label, and
 * shows a clear selected ring + checkmark. Large target, no text input.
 */
export function Swatch({
  children,
  label,
  selected = false,
  size = "md",
  onClick,
  style,
  ...rest
}) {
  const minH = size === "lg" ? "var(--tap-lg)" : "var(--tap)";
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      onClick={onClick}
      style={{
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 4,
        minHeight: minH,
        padding: 6,
        border: "2px solid",
        borderColor: selected ? "var(--selected)" : "var(--line-2)",
        background: selected ? "var(--sage-wash)" : "var(--surface-2)",
        borderRadius: 16,
        boxShadow: selected ? "var(--ring-selected-glow)" : "none",
        cursor: "pointer",
        fontFamily: "var(--font-rounded)",
        color: "var(--ink)",
        transition:
          "transform var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)",
        ...style,
      }}
      {...rest}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: -8,
          right: -8,
          width: 22,
          height: 22,
          borderRadius: "50%",
          background: "var(--selected)",
          color: "#fff",
          display: selected ? "flex" : "none",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 13,
          boxShadow: "0 1px 4px rgba(0,0,0,.25)",
        }}
      >
        ✓
      </span>
      <span style={{ display: "block", pointerEvents: "none" }}>{children}</span>
      {label ? (
        <span
          style={{
            fontSize: "var(--text-xs)",
            fontWeight: "var(--weight-bold)",
            color: selected ? "var(--sage-deep)" : "var(--ink-soft)",
            textAlign: "center",
            lineHeight: 1.1,
          }}
        >
          {label}
        </span>
      ) : null}
    </button>
  );
}
