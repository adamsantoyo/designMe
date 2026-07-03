import { Image, StyleSheet, View } from "react-native";

declare const require: (path: string) => number;

const HERO = require("../assets/foundry/hero-cutout.png");

export default function FoundryHeroFigure({ style }: { style?: any }) {
  return (
    <View style={[styles.fill, style]} pointerEvents="none">
      <Image source={HERO} resizeMode="contain" style={styles.image} />
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { width: "100%", height: "100%" },
  image: { width: "100%", height: "100%" },
});
