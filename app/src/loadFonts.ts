// Native font loading. Per-weight SUBPATH imports so Metro bundles only these 5 TTFs —
// importing from the package index (`@expo-google-fonts/nunito`) pulls in all 30 weight
// files (~3.8 MB), because the CJS index defeats tree-shaking. Web loads fonts from the
// CDN (loadFonts.web.ts) and bundles no TTFs at all.
import { useFonts } from "expo-font";
import { Nunito_400Regular } from "@expo-google-fonts/nunito/400Regular";
import { Nunito_600SemiBold } from "@expo-google-fonts/nunito/600SemiBold";
import { Nunito_700Bold } from "@expo-google-fonts/nunito/700Bold";
import { Nunito_800ExtraBold } from "@expo-google-fonts/nunito/800ExtraBold";
import { Newsreader_400Regular } from "@expo-google-fonts/newsreader/400Regular";

export function useAppFonts(): [boolean, Error | null] {
  return useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
    Newsreader_400Regular,
  });
}
