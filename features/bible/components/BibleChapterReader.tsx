import { colors } from "@/constants/theme";
import { PageLoader } from "@/components/ui/PageLoader";
import type { BibleChapterLoadState, BibleVerseLine } from "@/features/bible/types";
import { Feather } from "@expo/vector-icons";
import FontText from "react-native-fontext";
import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from "react-native-reanimated";

const passthroughComputeFont = (fontFamily: string) => fontFamily;
const SWIPE_DISTANCE_THRESHOLD = 56;
const SWIPE_VELOCITY_THRESHOLD = 520;
const PEEK_THRESHOLD = 80;

export interface BibleChapterReaderProps {
  loadState: BibleChapterLoadState;
  verses: BibleVerseLine[];
  errorMessage: string | null;
  onRetry: () => void;
  canGoPrevChapter: boolean;
  canGoNextChapter: boolean;
  onGoPrevChapter: () => void;
  onGoNextChapter: () => void;
  prevChapterLabel: string | null;
  nextChapterLabel: string | null;
  verseTextStyle?: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
  };
}

export function BibleChapterReader({
  loadState,
  verses,
  errorMessage,
  onRetry,
  canGoPrevChapter,
  canGoNextChapter,
  onGoPrevChapter,
  onGoNextChapter,
  prevChapterLabel,
  nextChapterLabel,
  verseTextStyle,
}: BibleChapterReaderProps) {
  const edgeHintOpacity = useSharedValue(0);
  const dragX = useSharedValue(0);
  const readerHeight = useSharedValue(0);
  const [viewportHeight, setViewportHeight] = useState(0);
  const viewportAnchorY = Math.max(80, viewportHeight * 0.42);
  const [edgeHintLabel, setEdgeHintLabel] = useState("");

  const edgeHintMotion = useAnimatedStyle(() => ({
    opacity: edgeHintOpacity.value,
  }));

  const contentDragMotion = useAnimatedStyle(() => ({
    transform: [{ translateX: dragX.value * 0.06 }],
  }));

  const prevPeekStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(1, dragX.value / PEEK_THRESHOLD)),
    transform: [
      {
        translateY: Math.max(
          10,
          Math.min(viewportAnchorY - 34, Math.max(10, readerHeight.value - 68))
        ),
      },
    ],
  }));

  const nextPeekStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(1, -dragX.value / PEEK_THRESHOLD)),
    transform: [
      {
        translateY: Math.max(
          10,
          Math.min(viewportAnchorY - 34, Math.max(10, readerHeight.value - 68))
        ),
      },
    ],
  }));

  const prevFadeStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(0.95, dragX.value / PEEK_THRESHOLD)),
  }));

  const nextFadeStyle = useAnimatedStyle(() => ({
    opacity: Math.max(0, Math.min(0.95, -dragX.value / PEEK_THRESHOLD)),
  }));

  const showEdgeHint = useCallback(() => {
    edgeHintOpacity.value = withTiming(1, { duration: 130 });
    edgeHintOpacity.value = withDelay(460, withTiming(0, { duration: 220 }));
  }, [edgeHintOpacity]);

  const onSwipeEnd = useCallback(
    (translationX: number, translationY: number, velocityX: number) => {
      const horizontalIntent =
        Math.abs(translationX) > Math.abs(translationY) &&
        (Math.abs(translationX) > SWIPE_DISTANCE_THRESHOLD ||
          Math.abs(velocityX) > SWIPE_VELOCITY_THRESHOLD);

      if (!horizontalIntent) return;

      if (translationX > 0) {
        if (canGoPrevChapter) onGoPrevChapter();
        else {
          setEdgeHintLabel("No previous chapter");
          showEdgeHint();
        }
      } else {
        if (canGoNextChapter) onGoNextChapter();
        else {
          setEdgeHintLabel("No next chapter");
          showEdgeHint();
        }
      }
    },
    [canGoNextChapter, canGoPrevChapter, onGoNextChapter, onGoPrevChapter, showEdgeHint]
  );

  const swipeGesture = Gesture.Pan()
    .activeOffsetX([-18, 18])
    .failOffsetY([-18, 18])
    .onUpdate((event) => {
      dragX.value = event.translationX;
    })
    .onEnd((event) => {
      dragX.value = withTiming(0, { duration: 220 });
      runOnJS(onSwipeEnd)(event.translationX, event.translationY, event.velocityX);
    })
    .onFinalize(() => {
      dragX.value = withTiming(0, { duration: 220 });
    });

  const content = (() => {
    if (loadState === "loading") {
      return (
        <PageLoader />
      );
    }

    if (loadState === "error") {
      return (
        <View style={styles.centered}>
          <Feather name="wifi-off" size={36} color={colors.muted} style={styles.errorIcon} />
          <FontText style={styles.errorTitle} computeFont={passthroughComputeFont}>
            We couldn't load this chapter
          </FontText>
          <FontText style={styles.errorBody} computeFont={passthroughComputeFont}>
            {errorMessage ?? "Check your connection and try again."}
          </FontText>
          <Pressable
            style={styles.retryBtn}
            onPress={onRetry}
            accessibilityRole="button"
            accessibilityLabel="Retry loading chapter"
          >
            <FontText style={styles.retryLabel} computeFont={passthroughComputeFont}>
              Try again
            </FontText>
          </Pressable>
        </View>
      );
    }

    return (
      <FlatList
        data={verses}
        keyExtractor={(item) => String(item.verse)}
        showsVerticalScrollIndicator={false}
        onLayout={(e) => setViewportHeight(e.nativeEvent.layout.height)}
        contentContainerStyle={styles.listContent}
        ListFooterComponent={<View style={styles.listFooter} />}
        ListEmptyComponent={
          <View style={styles.centered}>
            <FontText style={styles.empty} computeFont={passthroughComputeFont}>
              No verses for this chapter.
            </FontText>
          </View>
        }
        renderItem={({ item: line }) => (
          <View style={styles.verseRow}>
            <FontText style={styles.verseNum} computeFont={passthroughComputeFont}>
              {line.verse}
            </FontText>
            <FontText
              style={[styles.verseText, verseTextStyle]}
              computeFont={passthroughComputeFont}
            >
              {line.text}
            </FontText>
          </View>
        )}
      />
    );
  })();

  return (
    <GestureDetector gesture={swipeGesture}>
      <View
        style={styles.container}
        onLayout={(e) => {
          readerHeight.value = e.nativeEvent.layout.height;
        }}
      >
        <Animated.View style={contentDragMotion}>{content}</Animated.View>

        {canGoPrevChapter && prevChapterLabel ? (
          <>
            <Animated.View style={[styles.peekLeftFade, prevFadeStyle]} pointerEvents="none" />
            <Animated.View style={[styles.peekLeft, prevPeekStyle]} pointerEvents="none">
              {prevChapterLabel.split("").map((char, i) => (
                <FontText key={`prev-${i}`} style={styles.peekChar} computeFont={passthroughComputeFont}>
                  {char === " " ? "\n" : char}
                </FontText>
              ))}
            </Animated.View>
          </>
        ) : null}

        {canGoNextChapter && nextChapterLabel ? (
          <>
            <Animated.View style={[styles.peekRightFade, nextFadeStyle]} pointerEvents="none" />
            <Animated.View style={[styles.peekRight, nextPeekStyle]} pointerEvents="none">
              {nextChapterLabel.split("").map((char, i) => (
                <FontText key={`next-${i}`} style={styles.peekChar} computeFont={passthroughComputeFont}>
                  {char === " " ? "\n" : char}
                </FontText>
              ))}
            </Animated.View>
          </>
        ) : null}

        <Animated.View style={[styles.edgeHintWrap, edgeHintMotion]} pointerEvents="none">
          <FontText style={styles.edgeHintText} computeFont={passthroughComputeFont}>
            {edgeHintLabel}
          </FontText>
        </Animated.View>
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  listFooter: {
    height: 40,
  },
  centered: {
    minHeight: 200,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 24,
    paddingHorizontal: 12,
  },
  errorIcon: {
    opacity: 0.55,
    marginBottom: 12,
  },
  errorTitle: {
    fontFamily: "sans-medium",
    fontSize: 16,
    color: colors.ink,
    textAlign: "center",
    marginBottom: 8,
  },
  errorBody: {
    fontFamily: "sans",
    fontSize: 14,
    lineHeight: 20,
    color: colors.muted,
    textAlign: "center",
    marginBottom: 16,
  },
  retryBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: "rgba(201,151,58,0.35)",
  },
  retryLabel: {
    fontFamily: "sans-medium",
    fontSize: 14,
    color: colors.gold,
  },
  empty: {
    fontFamily: "sans",
    fontSize: 15,
    color: colors.muted,
    textAlign: "center",
  },
  verseRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  verseNum: {
    width: 28,
    fontFamily: "sans-medium",
    fontSize: 11,
    color: colors.gold,
    paddingTop: 4,
  },
  verseText: {
    flex: 1,
    fontFamily: "serif",
    fontSize: 19,
    lineHeight: 30,
    color: colors.ink,
  },
  peekLeft: {
    position: "absolute",
    left: 10,
    top: 0,
    minHeight: 68,
    width: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  peekRight: {
    position: "absolute",
    right: 10,
    top: 0,
    minHeight: 68,
    width: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  peekLeftFade: {
    position: "absolute",
    left: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(201,151,58,1)",
  },
  peekRightFade: {
    position: "absolute",
    right: 0,
    top: 0,
    bottom: 0,
    width: 60,
    backgroundColor: "rgba(201,151,58,1)",
  },
  peekChar: {
    fontSize: 13,
    color: colors.white,
    letterSpacing: 0.5,
    textAlign: "center",
    lineHeight: 17,
    textTransform: "uppercase",
  },
  edgeHintWrap: {
    position: "absolute",
    right: 14,
    bottom: 16,
    minWidth: 64,
    backgroundColor: "rgba(44,31,14,0.78)",
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.22)",
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: "center",
  },
  edgeHintText: {
    fontFamily: "sans-medium",
    color: colors.white,
    fontSize: 13,
    lineHeight: 17,
    textAlign: "center",
  },
});