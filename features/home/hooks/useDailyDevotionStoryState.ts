import { useDailyDevotion } from "@/features/home/hooks/useDailyDevotion";
import type { DailyDevotionStoryScreenProps } from "@/features/home/types";
import { buildBibleChapterPath } from "@/features/bible/utils/chapterRoute";
import { useRouter, type Href } from "expo-router";
import { useCallback, useMemo, useState } from "react";

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
  const { devotion, progress, completeDevotion, dismissForToday } = useDailyDevotion(now);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  const goHomeSafely = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
      return;
    }

    router.replace("/(tabs)/home");
  }, [router]);

  const onOpenPassage = useCallback(() => {
    router.push(buildBibleChapterPath(devotion.passage.bookId, devotion.passage.chapter) as Href);
  }, [devotion.passage.bookId, devotion.passage.chapter, router]);

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
        caption: "Read in BSB",
        primaryActionLabel: "Open passage",
        onPrimaryActionPress: onOpenPassage,
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
        title: progress.isCompleted ? "Today's devotion is complete" : "Finish today's devotion",
        body: progress.isCompleted
          ? "You've already completed today's devotion. Come back anytime to read it again."
          : "When you finish this last step, today's devotion will be marked complete and locked in.",
      },
    ],
    [devotion, onOpenPassage, progress.isCompleted]
  );

  const onNext = useCallback(() => {
    setActiveStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }, [steps.length]);

  const onPrevious = useCallback(() => {
    setActiveStepIndex((current) => Math.max(current - 1, 0));
  }, []);

  const onBack = useCallback(() => {
    goHomeSafely();
  }, [goHomeSafely]);

  const onDismiss = useCallback(async () => {
    if (!progress.isCompleted) {
      await dismissForToday();
    }
    router.replace("/(tabs)/home");
  }, [dismissForToday, progress.isCompleted, router]);

  const finishIfNeeded = useCallback(async () => {
    if (!progress.isCompleted) {
      await completeDevotion();
    }
    goHomeSafely();
  }, [completeDevotion, goHomeSafely, progress.isCompleted]);

  return {
    dateLabel: formatDateLabel(now),
    title: devotion.theme,
    image: devotion.image,
    isCompleted: progress.isCompleted,
    canDismiss: !progress.isCompleted,
    activeStepIndex,
    totalSteps: steps.length,
    stepDurationMs: 6000,
    steps: steps.map((step, index) =>
      index === steps.length - 1
        ? {
            ...step,
            primaryActionLabel: progress.isCompleted ? "Back to home" : "Finish devotion",
            onPrimaryActionPress: finishIfNeeded,
          }
        : step
    ),
    onBack,
    onDismiss,
    onNext,
    onPrevious,
  };
}
