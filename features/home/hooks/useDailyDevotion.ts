import type { DailyDevotionProgress } from "@/features/home/types";
import {
  getDailyDevotionForDate,
  getDateKey,
  getDefaultDailyDevotionProgress,
  loadDailyDevotionProgress,
  loadStoredStreakState,
  saveDailyDevotionProgress,
  saveStoredStreakState,
} from "@/lib/home/dailyDevotion";
import { computeStreak } from "@/lib/native/streak";
import { useStreakStore } from "@/store/useStreakStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function isSameDay(a: string | null, b: string): boolean {
  return a?.slice(0, 10) === b;
}

export function useDailyDevotion(now: Date) {
  const devotion = useMemo(() => getDailyDevotionForDate(now), [now]);
  const dateKey = useMemo(() => getDateKey(now), [now]);
  const setStreak = useStreakStore((s) => s.setStreak);
  const [progress, setProgress] = useState<DailyDevotionProgress>(() =>
    getDefaultDailyDevotionProgress(dateKey)
  );
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    let cancelled = false;

    async function hydrate() {
      const [savedProgress, savedStreak] = await Promise.all([
        loadDailyDevotionProgress(dateKey),
        loadStoredStreakState(),
      ]);

      if (cancelled) return;

      setProgress(savedProgress);
      progressRef.current = savedProgress;
      if (savedStreak) {
        setStreak(savedStreak);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [dateKey, setStreak]);

  const ensureDailyEngagement = useCallback(async () => {
    const streak = useStreakStore.getState();
    if (isSameDay(streak.streakLastActive, dateKey)) return;

    const next = computeStreak(streak.streakLastActive, streak.streakCount, now.toISOString());
    const nextState = {
      streakCount: next.streakCount,
      streakLastActive: now.toISOString(),
      treeStage: next.treeStage,
      longestStreak: Math.max(streak.longestStreak, next.streakCount),
    };

    setStreak(nextState);
    await saveStoredStreakState(nextState);
  }, [dateKey, now, setStreak]);

  const updateProgress = useCallback(
    async (updater: (current: DailyDevotionProgress) => DailyDevotionProgress) => {
      const next = updater(progressRef.current);
      progressRef.current = next;
      setProgress(next);
      await saveDailyDevotionProgress(next);
      return next;
    },
    []
  );

  const toggleQuoteComplete = useCallback(async () => {
    const next = await updateProgress((current) => ({
      ...current,
      quoteCompleted: !current.quoteCompleted,
    }));

    if (next.quoteCompleted) {
      await ensureDailyEngagement();
    }
  }, [ensureDailyEngagement, updateProgress]);

  const toggleModuleComplete = useCallback(
    async (moduleId: string) => {
      const next = await updateProgress((current) => {
        const completedModuleIds = current.completedModuleIds.includes(moduleId)
          ? current.completedModuleIds.filter((id) => id !== moduleId)
          : [...current.completedModuleIds, moduleId];

        return {
          ...current,
          completedModuleIds,
        };
      });

      if (next.completedModuleIds.includes(moduleId)) {
        await ensureDailyEngagement();
      }
    },
    [ensureDailyEngagement, updateProgress]
  );

  const toggleFavorite = useCallback(async () => {
    await updateProgress((current) => ({
      ...current,
      isFavorite: !current.isFavorite,
    }));
  }, [updateProgress]);

  return {
    devotion,
    progress,
    toggleQuoteComplete,
    toggleModuleComplete,
    toggleFavorite,
  };
}
