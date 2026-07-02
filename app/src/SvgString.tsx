// Render an SVG markup string. NATIVE variant: react-native-svg exports SvgXml
// on iOS/Android. (Metro uses SvgString.web.tsx on web.)
import { SvgXml } from "react-native-svg";

export default function SvgString({
  xml, width = "100%", height = "100%",
}: { xml: string; width?: number | string; height?: number | string }) {
  return <SvgXml xml={xml} width={width} height={height} />;
}
