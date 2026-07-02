// Render an SVG markup string. WEB variant: react-native-svg's web build does
// not export SvgXml, so we drop the markup into a real DOM <div>. (Metro resolves
// this .web file on web; SvgString.tsx is used on native.)
import * as React from "react";

export default function SvgString({
  xml, width = "100%", height = "100%",
}: { xml: string; width?: number | string; height?: number | string }) {
  return React.createElement("div", {
    style: { width, height, display: "flex", alignItems: "stretch", justifyContent: "center", overflow: "hidden" },
    dangerouslySetInnerHTML: { __html: xml },
  });
}
