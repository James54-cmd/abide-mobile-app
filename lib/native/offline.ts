import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "abide_cache";
const CHAT_QUEUE_KEY = `${PREFIX}:chat_queue`;

export const offlineKeys = {
  verseOfDay: `${PREFIX}:verse_of_day`,
  dailyDevotionProgress: `${PREFIX}:daily_devotion_progress`,
  streakState: `${PREFIX}:streak_state`,
  bible: (book: string, chapter: number, translation: string) =>
    `${PREFIX}:bible_${book}_${chapter}_${translation}`
};

export async function cacheJson<T>(key: string, value: T): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(value));
}

export async function getCachedJson<T>(key: string): Promise<T | null> {
  const value = await AsyncStorage.getItem(key);
  return value ? (JSON.parse(value) as T) : null;
}

export async function queueChatMessage(payload: Record<string, unknown>): Promise<void> {
  const existing = (await getCachedJson<Record<string, unknown>[]>(CHAT_QUEUE_KEY)) ?? [];
  await cacheJson(CHAT_QUEUE_KEY, [...existing, payload]);
}

export async function getQueuedChatMessages(): Promise<Record<string, unknown>[]> {
  return (await getCachedJson<Record<string, unknown>[]>(CHAT_QUEUE_KEY)) ?? [];
}

export async function clearQueuedChatMessages(): Promise<void> {
  await AsyncStorage.removeItem(CHAT_QUEUE_KEY);
}
