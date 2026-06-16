import React from "react";

/**
 * designMe DiscoverHero — the "Find my vibe" call to action. A warm
 * terracotta gradient panel that opens the this-or-that discovery flow
 * (the second door for switch / eye-gaze users). One per screen.
 */
export function DiscoverHero({
  title = "Find my vibe",
  subtitle = "Tap looks you like — we'll build it for you",
  icon = "✨",
  onClick,
  style,
  ...rest
}) {
  return (
    <button
      type="button"
      aria-label={title + " — " + subtitle}
      onClick={onClick}
      style={{
        width: "100%",
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "16px 18px",
        borderRadius: "var(--radius-lg)",
        border: "1px solid rgba(126,63,42,.30)",
        background: "linear-gradient(135deg, #b86c4d, #8f4730)",
        color: "#fff",
        textAlign: "left",
        fontFamily: "var(--font-rounded)",
        cursor: "pointer",
        boxShadow: "0 14px 30px rgba(95,48,28,.28), inset 0 1px 0 rgba(255,255,255,.25)",
        transition: "transform var(--dur-base) var(--ease), box-shadow var(--dur-base) var(--ease)",
        ...style,
      }}
      {...rest}
    >
      <span style={{ fontSize: "1.6rem", lineHeight: 1 }} aria-hidden="true">
        {icon}
      </span>
      <span style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        <span style={{ fontWeight: "var(--weight-black)", fontSize: "var(--text-lg)" }}>{title}</span>
        <span style={{ fontWeight: 650, opacity: 0.92, fontSize: "var(--text-sm)" }}>{subtitle}</span>
      </span>
      <span style={{ fontSize: "1.4rem", fontWeight: "var(--weight-black)" }} aria-hidden="true">
        →
      </span>
    </button>
  );
}
