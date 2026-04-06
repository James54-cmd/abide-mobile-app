import { colors } from "@/constants/theme";
import { Feather } from "@expo/vector-icons";
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

/**
 * Typing indicator for when AI is generating a response
 */
export function TypingIndicator() {
  const dotAnimation1 = useRef(new Animated.Value(0.3)).current;
  const dotAnimation2 = useRef(new Animated.Value(0.3)).current;
  const dotAnimation3 = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    const animateDots = () => {
      const createAnimation = (animatedValue: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(animatedValue, {
              toValue: 1,
              duration: 600,
              delay,
              useNativeDriver: true,
            }),
            Animated.timing(animatedValue, {
              toValue: 0.3,
              duration: 600,
              useNativeDriver: true,
            }),
          ])
        );

      Animated.stagger(200, [
        createAnimation(dotAnimation1, 0),
        createAnimation(dotAnimation2, 0),
        createAnimation(dotAnimation3, 0),
      ]).start();
    };

    animateDots();
  }, [dotAnimation1, dotAnimation2, dotAnimation3]);

  return (
    <View style={styles.container}>
      <View style={styles.assistantRow}>
        <View style={styles.accentBar} />
        <View style={styles.bubbleAssistant}>
          <View style={styles.content}>
            <Feather name="book-open" size={16} color={colors.gold} />
            <Text style={styles.text}>Abide is reflecting...</Text>
            <View style={styles.dotsContainer}>
              <Animated.View style={[styles.dot, { opacity: dotAnimation1 }]} />
              <Animated.View style={[styles.dot, { opacity: dotAnimation2 }]} />
              <Animated.View style={[styles.dot, { opacity: dotAnimation3 }]} />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "flex-start",
    marginBottom: 4,
    paddingHorizontal: 16,
    paddingVertical: 1,
  },
  assistantRow: {
    flexDirection: "row",
    alignItems: "stretch",
    maxWidth: "82%",
    borderRadius: 20,
    borderBottomLeftRadius: 5,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(201,151,58,0.18)",
    backgroundColor: colors.white,
  },
  accentBar: {
    width: 3,
    backgroundColor: colors.gold,
  },
  bubbleAssistant: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
  },
  text: {
    fontFamily: "sans",
    fontSize: 14,
    color: colors.muted,
    fontStyle: "italic",
    marginLeft: 6,
    marginRight: 8,
  },
  dotsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold,
    marginHorizontal: 1,
  },
});