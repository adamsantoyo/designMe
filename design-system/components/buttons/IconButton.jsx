import React from "react";

/**
 * designMe IconButton — a circular or pill icon-only control.
 * Soft paper material with a subtle gradient + warm shadow, gentle
 * hover lift and press settle. Always pass an accessible `label`.
 */
export function IconButton({
  children,
  label,
  shape = "circle",
  variant = "surface",
  size = 56,
  disabled = false,
  onClick,
  style,
  ...rest
}) {
  const variants = {
    surface: {
      background: "linear-gradient(180deg,#fff,var(--surface-2))",
      border: "1px solid var(--line)",
      color: "var(--ink)",
    },
    primary: {
      background: "var(--terra)",
      border: "1px solid var(--terra)",
      color: "var(--on-accent)",
    },
    ghost: {
      background: "transparent",
      border: "1px solid transparent",
      color: "var(--ink)",
    },
  };
  const vr = variants[variant] || variants.surface;
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        display: "grid",
        placeItems: "center",
        borderRadius: shape === "circle" ? "50%" : "var(--radius-md)",
        background: vr.background,
        border: vr.border,
        color: vr.color,
        boxShadow: variant === "ghost" ? "none" : "var(--shadow-sm)",
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition:
          "transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)",
        ...style,
      }}
      {...rest}
    >
      <span style={{ display: "inline-flex" }} aria-hidden="true">
        {children}
      </span>
    </button>
  );
}
