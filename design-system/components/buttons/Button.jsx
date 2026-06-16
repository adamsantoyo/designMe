import React from "react";

/**
 * designMe Button — a rounded pill action.
 * Variants: "primary" (terracotta filled, the warm commit action),
 * "secondary" (paper surface + hairline border, the default), and
 * "ghost" (transparent). Large rounded targets, gentle press settle.
 */
export function Button({
  children,
  variant = "secondary",
  size = "md",
  icon = null,
  disabled = false,
  type = "button",
  onClick,
  style,
  ...rest
}) {
  const sizes = {
    sm: { minHeight: 44, padding: "7px 14px", font: "var(--text-md)" },
    md: { minHeight: "var(--tap)", padding: "8px 18px", font: "var(--text-md)" },
    lg: { minHeight: 56, padding: "12px 24px", font: "var(--text-lg)" },
  };
  const variants = {
    primary: {
      background: "var(--terra)",
      borderColor: "var(--terra)",
      color: "var(--on-accent)",
      boxShadow: "var(--shadow-sm)",
    },
    secondary: {
      background: "var(--surface)",
      borderColor: "var(--line-2)",
      color: "var(--ink)",
      boxShadow: "var(--shadow-md)",
    },
    ghost: {
      background: "transparent",
      borderColor: "transparent",
      color: "var(--ink)",
      boxShadow: "none",
    },
  };
  const sz = sizes[size] || sizes.md;
  const vr = variants[variant] || variants.secondary;

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        minHeight: sz.minHeight,
        padding: sz.padding,
        border: "1.5px solid",
        borderColor: vr.borderColor,
        background: vr.background,
        color: vr.color,
        boxShadow: vr.boxShadow,
        borderRadius: "var(--radius-pill)",
        fontFamily: "var(--font-rounded)",
        fontSize: sz.font,
        fontWeight: "var(--weight-bold)",
        lineHeight: 1,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? 0.4 : 1,
        transition:
          "transform var(--dur-fast) var(--ease), background var(--dur-fast) var(--ease), border-color var(--dur-fast) var(--ease)",
        ...style,
      }}
      {...rest}
    >
      {icon ? (
        <span style={{ display: "inline-flex" }} aria-hidden="true">
          {icon}
        </span>
      ) : null}
      {children}
    </button>
  );
}
