export function getTreeStage(streakCount: number): number {
  if (streakCount >= 90) return 7;
  if (streakCount >= 30) return 6;
  if (streakCount >= 14) return 5;
  if (streakCount >= 7) return 4;
  if (streakCount >= 4) return 3;
  if (streakCount >= 2) return 2;
  return 1;
}

export interface StreakComputation {
  streakCount: number;
  treeStage: number;
  didLevelUp: boolean;
}

export function computeStreak(lastActive: string | null, currentCount: number, todayISO: string): StreakComputation {
  const today = new Date(todayISO);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  let nextCount = currentCount;
  const last = lastActive ? new Date(lastActive) : null;
  const todayDate = today.toISOString().slice(0, 10);
  const yesterdayDate = yesterday.toISOString().slice(0, 10);

  if (!lastActive) nextCount = 1;
  else if (last?.toISOString().slice(0, 10) === todayDate) nextCount = currentCount;
  else if (last?.toISOString().slice(0, 10) === yesterdayDate) nextCount = currentCount + 1;
  else nextCount = 1;

  const oldStage = getTreeStage(currentCount);
  const newStage = getTreeStage(nextCount);

  return { streakCount: nextCount, treeStage: newStage, didLevelUp: newStage > oldStage };
}
