// designMe svgparts engine core — pure string builder (Story 2.4).
// buildSvgPartsXml(layers, opts) -> SVG document string. No RN imports, no DOM,
// no randomness: byte-identical output for identical input (NFR4). Plain JS so
// the same module serves SvgPartsFigure.tsx (Metro) and the Node determinism
// gate (tools/engine-smoke-svgparts.mjs) — the dmFigure.js pattern, without a
// .runtime.js mirror.
//
// Layers come from resolveLayers(av, ov, svgSource): [{ key, ref, tint }] where
// `ref` is the part's inner <g> markup in the canonical 1024x1536 frame
// (registration baked in — zero per-part offset, manifest z-order preserved).
//
// Tint = per-fill multiply (fill_c * tint_c / 255), the exact semantic of
// SkiaFigure's ColorMatrix multiply, applied at string-build time. Chosen over
// <feColorMatrix> because react-native-svg 15.2.0 (Expo SDK 51's pin) silently
// drops <filter> elements on native; plain fills render identically everywhere.

const CANVAS_W = 1024;
const CANVAS_H = 1536;
// Crop strings are authored in the procedural engine's 240x490 space
// (AvatarStudio tray tiles); remap ratios mirror SkiaFigure.sourceRect().
const CROP_W = 240;
const CROP_H = 490;

export function multiplyHex(fillHex, tintHex) {
  const f = parseInt(fillHex.slice(1), 16);
  const t = parseInt(tintHex.slice(1), 16);
  if (Number.isNaN(f) || Number.isNaN(t)) return fillHex;
  const ch = (shift) =>
    Math.round(((f >> shift) & 255) * ((t >> shift) & 255) / 255);
  const n = (ch(16) << 16) | (ch(8) << 8) | ch(0);
  return `#${n.toString(16).padStart(6, "0")}`;
}

// Multiply every 6-hex fill in the part markup by the tint. Matches the PNG
// path's ColorMatrix, which multiplies every pixel of the layer.
export function tintMarkup(markup, tintHex) {
  if (!tintHex || !/^#[0-9a-fA-F]{6}$/.test(tintHex)) return markup;
  return markup.replace(
    /fill="(#[0-9a-fA-F]{6})"/g,
    (_, fill) => `fill="${multiplyHex(fill, tintHex)}"`,
  );
}

function cropViewBox(crop) {
  if (!crop) return null;
  const n = crop.trim().split(/\s+/).map(Number);
  if (n.length !== 4 || n.some((x) => !Number.isFinite(x))) return null;
  return [
    (n[0] / CROP_W) * CANVAS_W,
    (n[1] / CROP_H) * CANVAS_H,
    (n[2] / CROP_W) * CANVAS_W,
    (n[3] / CROP_H) * CANVAS_H,
  ];
}

// bbox: [x0,y0,x1,y1] (trace-time ink bounds); vb: [x,y,w,h] crop rect.
function rectsIntersect(bbox, vb) {
  return bbox[0] <= vb[0] + vb[2] && bbox[2] >= vb[0]
    && bbox[1] <= vb[1] + vb[3] && bbox[3] >= vb[1];
}

// layers: [{ key, ref (markup string), tint (hex|null), bbox? ([x0,y0,x1,y1]) }]
// in draw order. opts: { heightScale?: number, crop?: string }
export function buildSvgPartsXml(layers, opts = {}) {
  const { heightScale = 1, crop } = opts;
  const vb = cropViewBox(crop);
  // Cropped tray tiles render the UNSCALED canonical space (parity with
  // SkiaFigure.sourceRect and the procedural engine's height-invariant head):
  // applying the height transform under a crop viewBox would shift the region
  // by up to ~86px and cut heads off in tiles.
  const scale = vb ? 1 : heightScale;
  // A crop views a fixed sub-rect, so parts that cannot intersect it (per
  // their trace-time ink bbox) are dropped — a face tile need not carry shoe
  // paths through the native SVG parser. Pure function of the same inputs.
  const visible = vb
    ? layers.filter((l) => !l.bbox || rectsIntersect(l.bbox, vb))
    : layers;
  const body = visible
    .map((l) => (l.tint ? tintMarkup(String(l.ref), l.tint) : String(l.ref)))
    .join("");
  // Height: scale about the BOTTOM edge (feet stay planted, head moves) —
  // SVG-native, no View transform, no seams between parts (one shared group).
  const wrapped = scale === 1
    ? body
    : `<g transform="translate(0,${CANVAS_H * (1 - scale)}) scale(1,${scale})">${body}</g>`;
  const viewBox = vb ? vb.join(" ") : `0 0 ${CANVAS_W} ${CANVAS_H}`;
  // Full figure sits on the frame bottom (xMidYMax); crops center their region
  // (xMidYMid) — parity with AvatarCanvas.applyCrop on the procedural engine.
  const par = vb ? "xMidYMid meet" : "xMidYMax meet";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" ` +
    `preserveAspectRatio="${par}" width="100%" height="100%">${wrapped}</svg>`
  );
}

export default buildSvgPartsXml;
