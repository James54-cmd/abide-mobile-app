import { colors } from "@/constants/theme";
import { useDailyDevotionStoryState } from "@/features/home/hooks/useDailyDevotionStoryState";
import type { DailyDevotionStoryScreenProps } from "@/features/home/types";
import { Feather } from "@expo/vector-icons";
import { useEffect } from "react";
import { ImageBackground, Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Animated, {
  Easing,
  FadeInDown,
  FadeInRight,
  FadeOutLeft,
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
  activeStepIndex,
  totalSteps,
  stepDurationMs,
  steps,
  onBack,
  onNext,
  onPrevious,
}: DailyDevotionStoryScreenProps) {
  const activeStep = steps[activeStepIndex]!;
  const isLastStep = activeStepIndex === totalSteps - 1;
  const isFirstStep = activeStepIndex === 0;
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
      onNext?.();
    }, stepDurationMs);

    return () => {
      clearTimeout(timeout);
    };
  }, [activeStepIndex, isLastStep, onNext, progress, stepDurationMs]);

  const activeProgressStyle = useAnimatedStyle(() => ({
    width: `${Math.max(0, Math.min(progress.value, 1)) * 100}%`,
  }));

  return (
    <SafeAreaView style={styles.safe} edges={["top", "left", "right", "bottom"]}>
      <ImageBackground source={image} style={styles.hero} imageStyle={styles.heroImage}>
        <View style={styles.overlay} />

        <View style={styles.header}>
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Back to home"
            style={styles.iconButton}
          >
            <Feather name="chevron-left" size={22} color={colors.white} />
          </Pressable>

          <View style={styles.progressRow}>
            {steps.map((step, index) => (
              <View key={step.id} style={styles.progressBar}>
                {index < activeStepIndex ? <View style={[styles.progressFill, styles.progressBarActive]} /> : null}
                {index === activeStepIndex ? (
                  <Animated.View style={[styles.progressFill, styles.progressBarActive, activeProgressStyle]} />
                ) : null}
              </View>
            ))}
          </View>

          <View style={styles.donePill}>
            <Text style={styles.donePillText}>{isCompleted ? "DONE" : `${activeStepIndex + 1}/${totalSteps}`}</Text>
          </View>
        </View>

        <View style={styles.body}>
          <Text style={styles.dateLabel}>{dateLabel}</Text>
          <Text style={styles.screenTitle}>{title}</Text>

          <Animated.View
            key={activeStep.id}
            entering={FadeInRight.duration(320)}
            exiting={FadeOutLeft.duration(220)}
            style={styles.card}
          >
            <Text style={styles.eyebrow}>{activeStep.eyebrow}</Text>
            <Text style={styles.stepTitle}>{activeStep.title}</Text>
            <Text style={styles.stepBody}>{activeStep.body}</Text>
            {activeStep.caption ? <Text style={styles.caption}>{activeStep.caption}</Text> : null}

            {activeStep.onPrimaryActionPress && activeStep.primaryActionLabel ? (
              <Animated.View entering={FadeInDown.duration(300).delay(120)}>
                <Pressable
                onPress={activeStep.onPrimaryActionPress}
                accessibilityRole="button"
                accessibilityLabel={activeStep.primaryActionLabel}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>{activeStep.primaryActionLabel}</Text>
                </Pressable>
              </Animated.View>
            ) : null}
          </Animated.View>
        </View>

        <View style={styles.footer}>
          <Pressable
            onPress={onPrevious}
            disabled={isFirstStep}
            accessibilityRole="button"
            accessibilityLabel="Previous story"
            style={[styles.secondaryButton, isFirstStep && styles.secondaryButtonDisabled]}
          >
            <Text style={[styles.secondaryButtonText, isFirstStep && styles.secondaryButtonTextDisabled]}>
              Previous
            </Text>
          </Pressable>

          {!isLastStep ? (
            <Pressable
              onPress={onNext}
              accessibilityRole="button"
              accessibilityLabel="Next story"
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>Next</Text>
            </Pressable>
          ) : null}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingTop: 8,
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
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.22)",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    width: "100%",
    borderRadius: 999,
  },
  progressBarActive: {
    backgroundColor: colors.gold,
  },
  donePill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "rgba(255,255,255,0.14)",
  },
  donePillText: {
    fontFamily: "sans-medium",
    fontSize: 11,
    color: colors.white,
    letterSpacing: 0.7,
  },
  body: {
    flex: 1,
    justifyContent: "center",
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
    fontSize: 32,
    lineHeight: 38,
    color: colors.white,
    marginBottom: 20,
  },
  card: {
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingVertical: 22,
    backgroundColor: "rgba(250,247,242,0.92)",
  },
  eyebrow: {
    fontFamily: "sans-medium",
    fontSize: 11,
    letterSpacing: 1.3,
    color: colors.gold,
    marginBottom: 12,
  },
  stepTitle: {
    fontFamily: "serif",
    fontSize: 28,
    lineHeight: 35,
    color: colors.ink,
    marginBottom: 12,
  },
  stepBody: {
    fontFamily: "sans",
    fontSize: 15,
    lineHeight: 24,
    color: colors.muted,
  },
  caption: {
    marginTop: 12,
    fontFamily: "sans-medium",
    fontSize: 12,
    color: colors.ink,
  },
  primaryButton: {
    marginTop: 18,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 12,
    backgroundColor: colors.ink,
  },
  primaryButtonText: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: colors.white,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  secondaryButton: {
    minWidth: 110,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
  },
  secondaryButtonDisabled: {
    backgroundColor: "rgba(255,255,255,0.07)",
  },
  secondaryButtonText: {
    fontFamily: "sans-medium",
    fontSize: 13,
    color: colors.white,
  },
  secondaryButtonTextDisabled: {
    color: "rgba(255,255,255,0.42)",
  },
  nextButton: {
    flex: 1,
    borderRadius: 999,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: colors.gold,
    alignItems: "center",
  },
  nextButtonText: {
    fontFamily: "sans-medium",
    fontSize: 14,
    color: colors.ink,
  },
});
