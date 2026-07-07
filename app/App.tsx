import * as React from "react";
import { Platform, Pressable, SafeAreaView, StatusBar, StyleSheet, View } from "react-native";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";
import { Newsreader_400Regular } from "@expo-google-fonts/newsreader";
import * as SplashScreen from "expo-splash-screen";
import "./src/loadFonts";
import { theme } from "./src/theme";
import Text from "./src/ui/Text";
import AvatarStudio from "./src/AvatarStudio";

// Hold the splash until the brand fonts are ready so text never flashes in the system
// font first (FOUT). Web loads its fonts via the CDN pre-warm in loadFonts.web.ts and
// has nothing to bundle/await, so it skips the native TTF load entirely.
SplashScreen.preventAutoHideAsync().catch(() => {});
const NATIVE_FONTS = {
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
  Newsreader_400Regular,
};

// A crash must never strand the user on a dead screen. Saved looks and the worn
// avatar live in AsyncStorage, so recovery is a plain re-mount — calm, no jargon.
class CalmBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; resetKey: number }
> {
  state = { hasError: false, resetKey: 0 };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("[designMe] recovered from render error", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.fallback}>
          <Text style={styles.fallbackTitle}>Something went wrong</Text>
          <Text style={styles.fallbackText}>Your saved looks are safe.</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Go back to your avatar"
            onPress={() => this.setState((s) => ({ hasError: false, resetKey: s.resetKey + 1 }))}
            style={styles.fallbackBtn}
          >
            <Text style={styles.fallbackBtnText}>Back to my avatar</Text>
          </Pressable>
        </View>
      );
    }
    return <React.Fragment key={this.state.resetKey}>{this.props.children}</React.Fragment>;
  }
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(Platform.OS === "web" ? {} : NATIVE_FONTS);

  React.useEffect(() => {
    if (fontsLoaded || fontError) SplashScreen.hideAsync().catch(() => {});
  }, [fontsLoaded, fontError]);

  // A font error must not strand the user on the splash — fall through to the system
  // font rather than a blank screen.
  if (!fontsLoaded && !fontError) return null;

  return (
    <SafeAreaView style={styles.root}>
      <StatusBar barStyle="dark-content" />
      <CalmBoundary>
        <AvatarStudio />
      </CalmBoundary>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: theme.color.bg },
  fallback: { flex: 1, alignItems: "center", justifyContent: "center", padding: 32, gap: 10, backgroundColor: theme.color.bg },
  fallbackTitle: { fontSize: 22, fontWeight: "800", color: theme.color.ink },
  fallbackText: { fontSize: 15, fontWeight: "600", color: theme.color.inkSoft },
  fallbackBtn: { marginTop: 14, minHeight: 64, paddingHorizontal: 28, borderRadius: 18, alignItems: "center",
    justifyContent: "center", backgroundColor: theme.color.sageDeep },
  fallbackBtnText: { color: theme.color.onAccent, fontSize: 16, fontWeight: "800" },
});
