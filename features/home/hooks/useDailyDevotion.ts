import type { DailyDevotionProgress } from "@/features/home/types";
import {
  getDailyDevotionForDate,
  getDateKey,
  getDefaultDailyDevotionProgress,
  loadStoredStreakState,
  resolveDailyDevotionProgress,
  saveDailyDevotionProgress,
  saveStoredStreakState,
} from "@/lib/home/dailyDevotion";
import { computeStreak } from "@/lib/native/streak";
import { saveRemoteDailyDevotionProgress } from "@/lib/supabase/dailyDevotion";
import { recordDailyStreakActivity } from "@/lib/supabase/streak";
import { useAuthStore } from "@/store/useAuthStore";
import { useStreakStore } from "@/store/useStreakStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function isSameDay(a: string | null, b: string): boolean {
  return a?.slice(0, 10) === b;
}

export function useDailyDevotion(now: Date) {
  const devotion = useMemo(() => getDailyDevotionForDate(now), [now]);
  const dateKey = useMemo(() => getDateKey(now), [now]);
  const userId = useAuthStore((s) => s.userId);
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
        resolveDailyDevotionProgress(dateKey, userId),
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
  }, [dateKey, setStreak, userId]);

  const ensureDailyEngagement = useCallback(async () => {
    if (userId) {
      try {
        const synced = await recordDailyStreakActivity({
          userId,
          activityType: "daily_devotion_completed",
          now,
        });

        setStreak(synced);
        await saveStoredStreakState(synced);
        return;
      } catch (error) {
        console.warn("Falling back to local streak persistence.", error);
      }
    }

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
  }, [dateKey, now, setStreak, userId]);

  const updateProgress = useCallback(
    async (updater: (current: DailyDevotionProgress) => DailyDevotionProgress) => {
      const next = updater(progressRef.current);
      progressRef.current = next;
      setProgress(next);

      if (userId) {
        try {
          const synced = await saveRemoteDailyDevotionProgress(userId, next);
          progressRef.current = synced;
          setProgress(synced);
          await saveDailyDevotionProgress(synced);
          return synced;
        } catch (error) {
          console.warn("Skipping local persistence because remote daily devotion save failed.", error);
          return next;
        }
      }

      await saveDailyDevotionProgress(next);
      return next;
    },
    [userId]
  );

  const completeDevotion = useCallback(async () => {
    const current = progressRef.current;
    if (current.isCompleted) return;

    await updateProgress(() => ({
      ...current,
      isCompleted: true,
      completedAt: now.toISOString(),
      dismissedAt: null,
    }));
    await ensureDailyEngagement();
  }, [ensureDailyEngagement, now, updateProgress]);

  const dismissForToday = useCallback(async () => {
    const current = progressRef.current;
    if (current.isCompleted || current.dismissedAt) return;

    await updateProgress(() => ({
      ...current,
      dismissedAt: now.toISOString(),
    }));
  }, [now, updateProgress]);

  const toggleFavorite = useCallback(async () => {
    await updateProgress((current) => ({
      ...current,
      isFavorite: !current.isFavorite,
    }));
  }, [updateProgress]);

  return {
    devotion,
    progress,
    completeDevotion,
    dismissForToday,
    toggleFavorite,
  };
}
