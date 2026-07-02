import * as React from "react";
import { Pressable, SafeAreaView, StatusBar, StyleSheet, Text, View } from "react-native";
import "./src/loadFonts";
import { theme } from "./src/theme";
import AvatarStudio from "./src/AvatarStudio";

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
