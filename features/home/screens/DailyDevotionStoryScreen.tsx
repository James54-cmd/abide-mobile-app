import { colors } from "@/constants/theme";
import { useDailyDevotionStoryState } from "@/features/home/hooks/useDailyDevotionStoryState";
import type { DailyDevotionStoryScreenProps } from "@/features/home/types";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";

export function DailyDevotionStoryScreen() {
  return <DailyDevotionStoryScreenView {...useDailyDevotionStoryState()} />;
}

export function DailyDevotionStoryScreenView({
  dateLabel,
  title,
  image,
  isCompleted,
  canDismiss,
  activeStepIndex,
  totalSteps,
  stepDurationMs,
  steps,
  onBack,
  onDismiss,
  onStepTimeout,
  onNext,
  onPrevious,
}: DailyDevotionStoryScreenProps) {
  const activeStep = steps[activeStepIndex]!;
  const isLastStep = activeStepIndex === totalSteps - 1;
  const isFirstStep = activeStepIndex === 0;
  const showSuccessState = isLastStep && isCompleted;
  const progressSteps = steps.slice(0, -1);
  const progressStepIndex = Math.min(activeStepIndex, progressSteps.length - 1);
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = 0;

    if (isLastStep) {
      return;
    }

    progress.value = withTiming(1, {
      duration: stepDurationMs,
      easing: Easing.linear,
    });

    const timeout = setTimeout(() => {
      void onStepTimeout?.();
    }, stepDurationMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [activeStepIndex, isLastStep, onStepTimeout, progress, stepDurationMs]);

  const activeProgressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(progress.value, 1)) * 100}%`,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <ImageBackground source={image} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.overlay} />
        {showSuccessState ? <View style={styles.successOverlay} /> : null}

        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Pressable
              onPress={onDismiss ?? onBack}
              accessibilityRole="button"
              accessibilityLabel="Close devotion"
              style={styles.iconButton}
            >
              <Feather name="x" size={22} color={colors.white} />
            </Pressable>
          </View>

          <View style={styles.progressRow}>
            {progressSteps.map((step, index) => (
              <View
                key={step.id}
                style={[
                  styles.progressBar,
                  index === progressStepIndex && styles.progressBarCurrent,
                ]}
              >
                {index < activeStepIndex ? (
                  <View style={[styles.progressFill, styles.progressBarComplete]} />
                ) : null}
                {index === progressStepIndex && !showSuccessState ? (
                  <Animated.View
                    style={[styles.progressFill, styles.progressBarActive, activeProgressStyle]}
                  />
                ) : null}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.screenTitle}>{title}</Text>

          <Animated.View
            key={activeStep.id}
            entering={FadeInRight.duration(320)}
            exiting={FadeOutLeft.duration(220)}
            style={styles.copyWrap}
          >
            {showSuccessState ? (
              <Animated.View entering={FadeIn.duration(220)} style={styles.successWrap}>
                <Animated.View entering={ZoomIn.duration(360)} style={styles.successBadge}>
                  <Feather name="check" size={34} color={colors.white} />
                </Animated.View>
                <Text style={styles.eyebrow}>{activeStep.eyebrow}</Text>
                <Text style={styles.stepTitle}>{activeStep.title}</Text>
                <Text style={styles.stepBody}>{activeStep.body}</Text>
              </Animated.View>
            ) : (
              <>
                <Text style={styles.eyebrow}>{activeStep.eyebrow}</Text>
                <Text style={styles.stepTitle}>{activeStep.title}</Text>
                <Text style={styles.stepBody}>{activeStep.body}</Text>
                {activeStep.caption ? <Text style={styles.caption}>{activeStep.caption}</Text> : null}
              </>
            )}

            {activeStep.onPrimaryActionPress && activeStep.primaryActionLabel ? (
              <Animated.View entering={FadeInDown.duration(300).delay(120)}>
                <Pressable
                  onPress={activeStep.onPrimaryActionPress}
                  accessibilityRole="button"
                  accessibilityLabel={activeStep.primaryActionLabel}
                  style={styles.primaryButton}
                >
                  <View style={styles.primaryButtonInner}>
                    {activeStep.primaryActionLabel === "Back to home" ? (
                      <Feather name="home" size={15} color={colors.white} />
                    ) : null}
                    <Text style={styles.primaryButtonText}>{activeStep.primaryActionLabel}</Text>
                  </View>
                </Pressable>
              </Animated.View>
            ) : null}
          </Animated.View>
        </View>

        <View pointerEvents="box-none" style={styles.tapLayer}>
          {showSuccessState ? (
            <Pressable
              onPress={onBack}
              accessibilityRole="button"
              accessibilityLabel="Close completed devotion"
              style={styles.tapZoneFull}
            />
          ) : (
            <Pressable
              onPress={onPrevious}
              disabled={isFirstStep}
              accessibilityRole="button"
              accessibilityLabel="Previous story"
              style={styles.tapZoneLeft}
            />
          )}
          {!isLastStep && !showSuccessState ? (
            <Pressable
              onPress={onNext}
              accessibilityRole="button"
              accessibilityLabel="Next story"
              style={styles.tapZoneRight}
            />
          ) : (
            <View style={styles.tapZoneRight} pointerEvents="none" />
          )}
        </View>
      </ImageBackground>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.darkBg,
  },
  hero: {
    flex: 1,
    paddingHorizontal: 18,
    paddingBottom: 20,
  },
  heroImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(22,16,10,0.58)",
  },
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5,5,7,0.72)",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  progressRow: {
    flex: 1,
    flexDirection: "row",
    gap: 6,
    paddingVertical: 6,
  },
  progressBar: {
    flex: 1,
    height: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.16)",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.18)",
  },
  progressBarCurrent: {
    height: 8,
    marginTop: -1,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderColor: "rgba(255,255,255,0.24)",
    shadowColor: colors.gold,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  progressFill: {
    height: "100%",
    width: "100%",
    borderRadius: 999,
  },
  progressBarActive: {
    backgroundColor: "#F4D07D",
  },
  progressBarComplete: {
    backgroundColor: "rgba(244,208,125,0.72)",
  },
  body: {
    flex: 1,
    justifyContent: "flex-end",
    paddingBottom: 200,
  },
  tapLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 88,
    bottom: 120,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 3,
  },
  tapZoneLeft: {
    width: "24%",
    height: "100%",
  },
  tapZoneRight: {
    width: "24%",
    height: "100%",
  },
  tapZoneFull: {
    width: "100%",
    height: "100%",
  },
  dateLabel: {
    fontFamily: "sans-medium",
    fontSize: 12,
    letterSpacing: 1.2,
    color: "rgba(255,255,255,0.78)",
    marginBottom: 8,
  },
  screenTitle: {
    fontFamily: "serif",
    fontSize: 34,
    lineHeight: 40,
    color: colors.white,
    marginBottom: 18,
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  copyWrap: {
    paddingRight: 18,
  },
  successWrap: {
    alignItems: "flex-start",
  },
  successBadge: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.teal,
    marginBottom: 18,
    shadowColor: colors.teal,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 16,
    elevation: 6,
  },
  eyebrow: {
    fontFamily: "sans-medium",
    fontSize: 11,
    letterSpacing: 1.6,
    color: "#F4D07D",
    marginBottom: 12,
    textShadowColor: "rgba(0,0,0,0.28)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  stepTitle: {
    fontFamily: "serif",
    fontSize: 34,
    lineHeight: 41,
    color: colors.white,
    marginBottom: 14,
    textAlign: "left",
    textShadowColor: "rgba(0,0,0,0.38)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 14,
  },
  stepBody: {
    fontFamily: "sans",
    fontSize: 16,
    lineHeight: 26,
    color: "rgba(255,255,255,0.9)",
    textAlign: "left",
    textShadowColor: "rgba(0,0,0,0.34)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 12,
  },
  caption: {
    marginTop: 12,
    fontFamily: "sans-medium",
    fontSize: 12,
    color: "rgba(255,255,255,0.76)",
    textAlign: "left",
    textShadowColor: "rgba(0,0,0,0.28)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  primaryButton: {
    marginTop: 18,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.14)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
  },
  primaryButtonText: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: colors.white,
  },
  primaryButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
