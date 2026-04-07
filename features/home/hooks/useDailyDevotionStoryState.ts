import { useDailyDevotion } from "@/features/home/hooks/useDailyDevotion";
import type { DailyDevotionStoryScreenProps } from "@/features/home/types";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

const STEP_DURATION_MS = 6000;

function formatDateLabel(d: Date): string {
  const months = [
    "JAN",
    "FEB",
    "MAR",
    "APR",
    "MAY",
    "JUN",
    "JUL",
    "AUG",
    "SEP",
    "OCT",
    "NOV",
    "DEC",
  ];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

export function useDailyDevotionStoryState(): DailyDevotionStoryScreenProps {
  const router = useRouter();
  const now = useMemo(() => new Date(), []);
  const { devotion, progress, completePart, dismissForToday } = useDailyDevotion(now);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const goHomeSafely = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/home");
  }, [router]);

  const completeCurrentStepIfNeeded = useCallback(async () => {
    const stepPart =
      activeStepIndex === 0
        ? "quote"
        : activeStepIndex === 1
          ? "passage"
          : activeStepIndex === 2
            ? "devotional"
            : activeStepIndex === 3
              ? "prayer"
              : null;

    if (!stepPart) return;

    const alreadyCompleted =
      (stepPart === "quote" && progress.quoteCompleted) ||
      (stepPart === "passage" && progress.passageCompleted) ||
      (stepPart === "devotional" && progress.devotionalCompleted) ||
      (stepPart === "prayer" && progress.prayerCompleted);

    if (alreadyCompleted) return;
    await completePart(stepPart);
  }, [
    activeStepIndex,
    completePart,
    progress.devotionalCompleted,
    progress.passageCompleted,
    progress.prayerCompleted,
    progress.quoteCompleted,
  ]);

  const steps = useMemo<DailyDevotionStoryScreenProps["steps"]>(
    () => [
      {
        id: "quote",
        eyebrow: devotion.quote.sourceLabel,
        title: devotion.quote.text,
        body: devotion.quote.author,
        caption: `Theme: ${devotion.theme}`,
      },
      {
        id: "scripture",
        eyebrow: "SCRIPTURE",
        title: devotion.passage.reference,
        body: devotion.passage.summary,
        caption: progress.passageCompleted ? "Completed in BSB" : "Read in BSB",
      },
      {
        id: "devotional",
        eyebrow: "DEVOTIONAL",
        title: devotion.devotional.title,
        body: devotion.devotional.body,
      },
      {
        id: "prayer",
        eyebrow: "PRAYER",
        title: devotion.prayer.title,
        body: devotion.prayer.body,
      },
      {
        id: "finish",
        eyebrow: "COMPLETE",
        title: progress.isCompleted ? "Today's devotion is complete" : "Keep going through each part",
        body: progress.isCompleted
          ? "You've already completed today's devotion. Come back anytime to read it again."
          : "Each part completes on its own now. Finish quote, scripture, devotional, and prayer to complete the whole devotion.",
      },
    ],
    [
      devotion,
      progress.isCompleted,
      progress.passageCompleted,
    ]
  );

  const onNext = useCallback(() => {
    setActiveStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }, [steps.length]);

  const onStepTimeout = useCallback(async () => {
    await completeCurrentStepIfNeeded();
    setActiveStepIndex((current) => Math.min(current + 1, steps.length - 2));
  }, [completeCurrentStepIfNeeded, steps.length]);

  const onPrevious = useCallback(() => {
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const onDismiss = useCallback(async () => {
    if (!progress.isCompleted) {
      await dismissForToday();
    }
    goHomeSafely();
  }, [dismissForToday, goHomeSafely, progress.isCompleted]);

  const finishIfNeeded = useCallback(async () => {
    goHomeSafely();
  }, [goHomeSafely]);

  return {
    dateLabel: formatDateLabel(now),
    title: devotion.theme,
    image: devotion.image,
    isCompleted: progress.isCompleted,
    canDismiss: !progress.isCompleted,
    activeStepIndex,
    totalSteps: steps.length,
    stepDurationMs: STEP_DURATION_MS,
    steps: steps.map((step, index) =>
      index === steps.length - 1
        ? {
            ...step,
            primaryActionLabel: "Back to home",
            onPrimaryActionPress: finishIfNeeded,
          }
        : step
    ),
    onBack: goHomeSafely,
    onDismiss,
    onStepTimeout,
    onNext,
    onPrevious,
  };
}
