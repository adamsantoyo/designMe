// Types for the plain-JS svgparts engine core (see svgPartsFigure.js).
export function multiplyHex(fillHex: string, tintHex: string): string;
export function tintMarkup(markup: string, tintHex: string | null): string;
export function buildSvgPartsXml(
  layers: ReadonlyArray<{
    key: string;
    ref: number | string;
    tint: string | null;
    bbox?: readonly number[];
  }>,
  opts?: { heightScale?: number; crop?: string },
): string;
export default buildSvgPartsXml;
