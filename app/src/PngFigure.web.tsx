// PNG compositor — WEB. Stacks 1024×1536 part PNGs (object-fit: contain, so every
// layer co-registers regardless of container aspect) and recolors tintable parts by
// multiplying the color over the white-with-shading master, masked to the part's own
// alpha so color stays inside the shape and the soft shadows survive.
import * as React from "react";
import { Asset } from "expo-asset";
import { resolveLayers, heightScaleY, coverage, type Layer } from "./parts/layers";
import { partCount } from "./parts/registry";
import type { Av } from "./dm";

// Expo-canonical, sync on web. Guarded so a bad asset never takes down the figure.
function uriOf(ref: number): string {
  try {
    return Asset.fromModule(ref).uri || "";
  } catch (e: any) {
    console.warn("[png] could not resolve asset", ref, e?.message);
    return "";
  }
}

function LayerView({ layer }: { layer: Layer }) {
  const uri = uriOf(layer.ref);
  if (!uri) return null;

  const base = React.createElement("img", {
    key: "base",
    src: uri,
    style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain" },
    draggable: false,
    alt: "",
  });
  if (!layer.tint) return base;

  const tintOverlay = React.createElement("div", {
    key: "tint",
    style: {
      position: "absolute",
      inset: 0,
      backgroundColor: layer.tint,
      mixBlendMode: "multiply",
      WebkitMaskImage: `url(${uri})`,
      maskImage: `url(${uri})`,
      WebkitMaskSize: "contain",
      maskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      maskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      maskPosition: "center",
    },
  });
  return React.createElement(React.Fragment, null, base, tintOverlay);
}

function Hint() {
  return React.createElement(
    "div",
    {
      style: {
        width: "100%", height: "100%", display: "flex", alignItems: "center",
        justifyContent: "center", textAlign: "center", padding: 24, boxSizing: "border-box",
        color: "#6b5f53", fontFamily: "Nunito, system-ui, sans-serif", fontSize: 14, fontWeight: 700,
      },
    },
    "Drop ChatGPT PNGs into app/assets/parts/ and register them in src/parts/registry.ts — they appear here.",
  );
}

// Dev-only: label partial composites so an incomplete stack (e.g. faceless body)
// is visibly "in progress", never mistaken for the product.
function CoverageChip({ have, want }: { have: number; want: number }) {
  return React.createElement(
    "div",
    {
      style: {
        position: "absolute", bottom: 6, left: "50%", transform: "translateX(-50%)",
        padding: "3px 10px", borderRadius: 999, backgroundColor: "rgba(47,40,35,0.72)",
        color: "#fbf8f2", fontFamily: "Nunito, system-ui, sans-serif",
        fontSize: 11, fontWeight: 800, whiteSpace: "nowrap", pointerEvents: "none",
      },
    },
    `${have}/${want} parts`,
  );
}

export default function PngFigure({ av }: { av: Av; ov?: Partial<Av>; crop?: string }) {
  const layers = resolveLayers(av);
  if (partCount() === 0 || layers.length === 0) return React.createElement(Hint);
  const cov = coverage(av);

  return React.createElement(
    "div",
    {
      style: {
        position: "relative", width: "100%", height: "100%",
        transform: `scaleY(${heightScaleY(av.height)})`, transformOrigin: "bottom center",
      },
    },
    ...layers.map((l: Layer) => React.createElement(LayerView, { key: l.slot, layer: l })),
    __DEV__ && cov.have < cov.want
      ? React.createElement(CoverageChip, { key: "cov", have: cov.have, want: cov.want })
      : null,
  );
}
