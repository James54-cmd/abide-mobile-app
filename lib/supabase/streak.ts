import { computeStreak } from "@/lib/native/streak";
import { supabase } from "@/lib/supabase";

export type StreakActivityType =
  | "daily_devotion_completed"
  | "bible_read"
  | "chat_opened"
  | "prayer_completed";

export interface SyncedStreakState {
  streakCount: number;
  streakLastActive: string;
  treeStage: number;
  longestStreak: number;
}

export class StreakSyncError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "StreakSyncError";
  }
}

function toDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function recordDailyStreakActivity({
  userId,
  activityType,
  now,
}: {
  userId: string;
  activityType: StreakActivityType;
  now?: Date;
}): Promise<SyncedStreakState> {
  const currentDate = now ?? new Date();
  const todayKey = toDateKey(currentDate);

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, streak_count, streak_last_active, tree_stage, longest_streak")
    .eq("id", userId)
    .maybeSingle();

  if (profileError) {
    throw new StreakSyncError(`Failed to load profile streak state: ${profileError.message}`, profileError.code);
  }

  if (!profile) {
    throw new StreakSyncError("Could not find the signed-in profile.");
  }

  const { error: logError } = await supabase.from("streak_log").upsert(
    {
      user_id: userId,
      date: todayKey,
      activity_type: activityType,
    },
    { onConflict: "user_id,date" }
  );

  if (logError) {
    throw new StreakSyncError(`Failed to write streak log: ${logError.message}`, logError.code);
  }

  const currentCount = profile.streak_count ?? 0;
  const computed = computeStreak(
    profile.streak_last_active,
    currentCount,
    currentDate.toISOString()
  );

  const nextState: SyncedStreakState = {
    streakCount: computed.streakCount,
    streakLastActive: todayKey,
    treeStage: computed.treeStage,
    longestStreak: Math.max(profile.longest_streak ?? 0, computed.streakCount),
  };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      streak_count: nextState.streakCount,
      streak_last_active: nextState.streakLastActive,
      tree_stage: nextState.treeStage,
      longest_streak: nextState.longestStreak,
    })
    .eq("id", userId);

  if (updateError) {
    throw new StreakSyncError(`Failed to update profile streak state: ${updateError.message}`, updateError.code);
  }

  return nextState;
}
