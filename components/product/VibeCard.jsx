import React from "react";

/**
 * designMe VibeCard — the signature "look" card. A tinted paper tile
 * holding a look preview, a demoted trend `tag`, a concrete `name`,
 * the two garment color chips, and a plain-language `note`. Selecting
 * shows the sage selection ring. The three-tier label (tag / name /
 * note) is the product's recognition-first copy pattern.
 */
export function VibeCard({
  preview = null,
  tag,
  name,
  note,
  colors = [],
  selected = false,
  onClick,
  style,
  ...rest
}) {
  const top = colors[0] || "#e6dcc6";
  const bottom = colors[1] || top;
  return (
    <button
      type="button"
      aria-pressed={selected}
      aria-label={name + " vibe"}
      onClick={onClick}
      style={{
        position: "relative",
        display: "grid",
        gridTemplateRows: "minmax(184px, 1fr) auto",
        gap: 8,
        width: 220,
        padding: 10,
        border: "1.5px solid",
        borderColor: selected ? "var(--selected)" : "var(--line)",
        borderRadius: "var(--radius-xl)",
        background: `linear-gradient(160deg, color-mix(in srgb, ${top} 24%, #fff), color-mix(in srgb, ${bottom} 14%, #fff)), var(--surface-2)`,
        boxShadow: selected
          ? "0 0 0 3px rgba(31,79,53,.18), 0 16px 38px rgba(57,43,28,.14)"
          : "inset 0 1px 0 rgba(255,255,255,.72), 0 12px 30px rgba(57,43,28,.10)",
        cursor: "pointer",
        color: "var(--ink)",
        fontFamily: "var(--font-rounded)",
        textAlign: "left",
        overflow: "hidden",
        transition: "transform var(--dur-fast) var(--ease), box-shadow var(--dur-fast) var(--ease)",
        ...style,
      }}
      {...rest}
    >
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 184,
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          background:
            "radial-gradient(80% 64% at 50% 14%, rgba(255,255,255,.82), rgba(255,255,255,0)), linear-gradient(180deg, rgba(255,255,255,.55), rgba(205,191,176,.22))",
        }}
      >
        {preview}
      </span>
      <span style={{ display: "grid", gap: 6 }}>
        {tag ? (
          <span
            style={{
              justifySelf: "start",
              padding: "3px 8px",
              borderRadius: "var(--radius-pill)",
              background: "rgba(41,35,31,.08)",
              color: "var(--ink-soft)",
              fontSize: "var(--text-2xs)",
              fontWeight: "var(--weight-black)",
              letterSpacing: "var(--tracking-eyebrow)",
              textTransform: "uppercase",
            }}
          >
            {tag}
          </span>
        ) : null}
        <span style={{ fontWeight: "var(--weight-black)", fontSize: "var(--text-md)" }}>{name}</span>
        <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
          {colors.slice(0, 2).map((c, i) => (
            <i
              key={i}
              style={{
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: c,
                border: "1px solid rgba(0,0,0,.12)",
                display: "block",
              }}
            />
          ))}
          {note ? (
            <span style={{ color: "var(--ink-soft)", fontSize: "var(--text-xs)", fontWeight: 700 }}>
              {note}
            </span>
          ) : null}
        </span>
      </span>
    </button>
  );
}
