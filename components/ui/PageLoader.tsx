import { colors } from "@/constants/theme";
import { brandLogoSymbol } from "@/constants/brand";
import { useEffect, useMemo, useRef } from "react";
import { Animated, Easing, Image, StyleSheet, View } from "react-native";
import FontText from "react-native-fontext";

const loaderComputeFont = (fontFamily: string) => (fontFamily === "serif" ? "Georgia" : fontFamily);
const LOADER_VERSES = [
  { text: '"Be still, and know that I am God."', reference: "Psalm 46:10" },
  { text: '"The Lord is my shepherd; I shall not want."', reference: "Psalm 23:1" },
  {
    text: '"Your word is a lamp to my feet and a light to my path."',
    reference: "Psalm 119:105",
  },
  {
    text: '"I can do all things through Christ who strengthens me."',
    reference: "Philippians 4:13",
  },
  { text: '"Let all that you do be done in love."', reference: "1 Corinthians 16:14" },
  { text: '"Rejoice always, pray without ceasing."', reference: "1 Thessalonians 5:16-17" },
];

export interface PageLoaderProps {
  size?: number;
  showRandomVerse?: boolean;
}

export function PageLoader({
  size = 76,
  showRandomVerse = true,
}: PageLoaderProps) {
  const pulse = useRef(new Animated.Value(1)).current;
  const randomVerse = useMemo(
    () => LOADER_VERSES[Math.floor(Math.random() * LOADER_VERSES.length)],
    []
  );

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.09,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 420,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1.04,
          duration: 260,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 260,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );

    pulseLoop.start();

    return () => {
      pulseLoop.stop();
    };
  }, [pulse]);

  return (
    <View style={styles.wrap} accessibilityLabel="Loading">
      <Animated.View style={{ transform: [{ scale: pulse }] }}>
        <Image source={brandLogoSymbol} style={{ width: size, height: size }} resizeMode="contain" />
      </Animated.View>
      {showRandomVerse ? (
        <View style={styles.verseWrap}>
          <FontText style={styles.verse} computeFont={loaderComputeFont}>
            {randomVerse.text}
          </FontText>
          <FontText style={styles.verseRef} computeFont={loaderComputeFont}>
            {randomVerse.reference}
          </FontText>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
    gap: 14,
  },
  verse: {
    maxWidth: 280,
    fontFamily: "serif",
    fontSize: 14,
    lineHeight: 22,
    color: colors.ink,
    textAlign: "center",
    opacity: 0.85,
  },
  verseWrap: {
    gap: 4,
    alignItems: "center",
  },
  verseRef: {
    fontFamily: "serif",
    fontSize: 13,
    lineHeight: 18,
    color: colors.muted,
    textAlign: "center",
  },
});
