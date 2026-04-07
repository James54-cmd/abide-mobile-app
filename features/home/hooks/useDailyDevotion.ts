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
import { useFocusEffect } from "@react-navigation/native";
import { useAuthStore } from "@/store/useAuthStore";
import { useStreakStore } from "@/store/useStreakStore";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const MODULE_PROGRESS_KEY = {
  quote: "quoteCompleted",
  passage: "passageCompleted",
  devotional: "devotionalCompleted",
  prayer: "prayerCompleted",
} as const;

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

  const hydrate = useCallback(
    async (cancelledRef?: { current: boolean }) => {
      const [savedProgress, savedStreak] = await Promise.all([
        resolveDailyDevotionProgress(dateKey, userId),
        loadStoredStreakState(),
      ]);

      if (cancelledRef?.current) return;

      setProgress(savedProgress);
      progressRef.current = savedProgress;
      if (savedStreak) {
        setStreak(savedStreak);
      }
    },
    [dateKey, setStreak, userId]
  );

  useEffect(() => {
    const cancelledRef = { current: false };
    void hydrate(cancelledRef);

    return () => {
      cancelledRef.current = true;
    };
  }, [hydrate]);

  useFocusEffect(
    useCallback(() => {
      const cancelledRef = { current: false };
      void hydrate(cancelledRef);

      return () => {
        cancelledRef.current = true;
      };
    }, [hydrate])
  );

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

  const completePart = useCallback(
    async (part: keyof typeof MODULE_PROGRESS_KEY) => {
      const current = progressRef.current;
      const progressKey = MODULE_PROGRESS_KEY[part];
      if (current[progressKey]) return current;

      const next = await updateProgress((existing) => {
        const quoteCompleted =
          progressKey === "quoteCompleted" ? true : existing.quoteCompleted;
        const passageCompleted =
          progressKey === "passageCompleted" ? true : existing.passageCompleted;
        const devotionalCompleted =
          progressKey === "devotionalCompleted" ? true : existing.devotionalCompleted;
        const prayerCompleted =
          progressKey === "prayerCompleted" ? true : existing.prayerCompleted;
        const isCompleted =
          quoteCompleted && passageCompleted && devotionalCompleted && prayerCompleted;

        return {
          ...existing,
          quoteCompleted,
          passageCompleted,
          devotionalCompleted,
          prayerCompleted,
          isCompleted,
          completedAt: isCompleted ? existing.completedAt ?? now.toISOString() : null,
          dismissedAt: isCompleted ? null : existing.dismissedAt,
        };
      });

      await ensureDailyEngagement();
      return next;
    },
    [ensureDailyEngagement, now, updateProgress]
  );

  return {
    devotion,
    progress,
    completeDevotion,
    completePart,
    dismissForToday,
    toggleFavorite,
  };
}
