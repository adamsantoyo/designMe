import React from "react";

/**
 * designMe ColorDot — a round color choice. Used for skin tones, hair
 * color, garment color. Selected state shows a sage ring + lift. The
 * `color` may be any CSS color or gradient string.
 */
export function ColorDot({
  color = "#cdbfb0",
  label,
  selected = false,
  size = 56,
  onClick,
  style,
  ...rest
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={label}
      title={label}
      onClick={onClick}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        border: "2px solid rgba(255,255,255,.85)",
        boxShadow: selected
          ? "0 0 0 3px var(--sage), var(--shadow-sm)"
          : "var(--shadow-sm), inset 0 0 0 1px rgba(0,0,0,.06)",
        transform: selected ? "scale(1.04)" : "scale(1)",
        cursor: "pointer",
        transition: "transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)",
        ...style,
      }}
      {...rest}
    />
  );
}
