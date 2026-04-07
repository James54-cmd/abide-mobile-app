import type { DailyDevotionProgress } from "@/features/home/types";
import { supabase } from "@/lib/supabase";

type DailyDevotionProgressRow = {
  quote_completed: boolean | null;
  passage_completed: boolean | null;
  devotional_completed: boolean | null;
  prayer_completed: boolean | null;
  is_completed: boolean | null;
  completed_at: string | null;
  dismissed_at: string | null;
  is_favorite: boolean | null;
};

export class DailyDevotionSyncError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "DailyDevotionSyncError";
  }
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function normalizeDailyDevotionProgress(
  dateKey: string,
  row: Partial<DailyDevotionProgressRow> | null | undefined
): DailyDevotionProgress {
  const quoteCompleted = row?.quote_completed ?? row?.is_completed ?? false;
  const passageCompleted = row?.passage_completed ?? row?.is_completed ?? false;
  const devotionalCompleted = row?.devotional_completed ?? row?.is_completed ?? false;
  const prayerCompleted = row?.prayer_completed ?? row?.is_completed ?? false;
  const isCompleted =
    quoteCompleted && passageCompleted && devotionalCompleted && prayerCompleted;

  return {
    dateKey,
    quoteCompleted,
    passageCompleted,
    devotionalCompleted,
    prayerCompleted,
    isCompleted,
    completedAt: isCompleted ? row?.completed_at ?? null : null,
    dismissedAt: row?.dismissed_at ?? null,
    isFavorite: row?.is_favorite ?? false,
  };
}

export async function loadRemoteDailyDevotionProgress(
  userId: string,
  dateKey: string
): Promise<DailyDevotionProgress | null> {
  const { data, error } = await supabase
    .from("daily_devotion_progress")
    .select(
      "quote_completed, passage_completed, devotional_completed, prayer_completed, is_completed, completed_at, dismissed_at, is_favorite"
    )
    .eq("user_id", userId)
    .eq("date", dateKey)
    .maybeSingle();

  if (error) {
    throw new DailyDevotionSyncError(
      `Failed to load daily devotion progress: ${error.message}`,
      error.code
    );
  }

  if (!data) return null;
  return normalizeDailyDevotionProgress(dateKey, data);
}

export async function saveRemoteDailyDevotionProgress(
  userId: string,
  progress: DailyDevotionProgress
): Promise<DailyDevotionProgress> {
  const { data, error } = await supabase
    .from("daily_devotion_progress")
    .upsert(
      {
        user_id: userId,
        date: progress.dateKey,
        quote_completed: progress.quoteCompleted,
        passage_completed: progress.passageCompleted,
        devotional_completed: progress.devotionalCompleted,
        prayer_completed: progress.prayerCompleted,
        is_completed: progress.isCompleted,
        completed_at: progress.completedAt,
        dismissed_at: progress.dismissedAt,
        is_favorite: progress.isFavorite,
      },
      { onConflict: "user_id,date" }
    )
    .select(
      "quote_completed, passage_completed, devotional_completed, prayer_completed, is_completed, completed_at, dismissed_at, is_favorite"
    )
    .single();

  if (error) {
    throw new DailyDevotionSyncError(
      `Failed to save daily devotion progress: ${error.message}`,
      error.code
    );
  }

  return normalizeDailyDevotionProgress(progress.dateKey, data);
}

export async function shouldPresentRemoteDailyDevotionOnLaunch(
  userId: string,
  date?: Date
): Promise<boolean> {
  const dateKey = toDateKey(date ?? new Date());
  const progress = await loadRemoteDailyDevotionProgress(userId, dateKey);
  return !progress?.isCompleted && !progress?.dismissedAt;
}
