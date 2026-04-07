import { useDailyDevotion } from "@/features/home/hooks/useDailyDevotion";
import type { DevotionalModuleKind, HomeScreenProps } from "@/features/home/types";
import { buildBibleChapterPath } from "@/features/bible/utils/chapterRoute";
import type { Conversation } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useStreakStore } from "@/store/useStreakStore";
import { useRouter, type Href } from "expo-router";
import { useCallback, useMemo } from "react";

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    user_id: "demo-user",
    title: "Anxious heart",
    last_message: "You are held in grace.",
    title_status: "generated",
    message_count: 2,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "c2",
    user_id: "demo-user",
    title: "Purpose today",
    last_message: "Walk in gentle obedience.",
    title_status: "generated",
    message_count: 3,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

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

function buildWeekDays(now: Date) {
  const labels = ["M", "T", "W", "T", "F", "S", "S"];
  const day = now.getDay();
  const mondayFirstIndex = (day + 6) % 7;
  return labels.map((label, i) => ({
    id: `dow-${i}`,
    label,
    highlighted: i === mondayFirstIndex,
  }));
}

export function useHomeScreenState(): HomeScreenProps {
  const router = useRouter();
  const authName = useAuthStore((s) => s.name);
  const streakCount = useStreakStore((s) => s.streakCount);

  const name = useMemo(() => (authName?.trim() ? authName : "Beloved"), [authName]);
  const userInitial = useMemo(
    () => (name.trim().length > 0 ? name.trim()[0]!.toUpperCase() : "B"),
    [name]
  );

  const now = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => buildWeekDays(now), [now]);
  const { devotion, progress, toggleFavorite } = useDailyDevotion(now);

  const openDailyDevotion = useCallback(() => {
    router.push("/daily-devotion");
  }, [router]);

  const onHeartPress = useCallback(() => {
    router.push("/(tabs)/chat");
  }, [router]);

  const onConversationPress = useCallback(
    (id: string) => {
      router.push(`/(tabs)/chat/${id}`);
    },
    [router]
  );

  const onSettingsPress = useCallback(() => {
    router.push("/(tabs)/profile");
  }, [router]);

  const onCalendarPress = useCallback(() => {
    router.push("/(tabs)/garden");
  }, [router]);

  const onCommunityPress = useCallback(() => {
    router.push("/(tabs)/chat");
  }, [router]);

  const onModulePress = useCallback(
    (_id: string, kind: DevotionalModuleKind) => {
      if (kind === "passage") {
        router.push(
          buildBibleChapterPath(devotion.passage.bookId, devotion.passage.chapter) as Href
        );
        return;
      }

      openDailyDevotion();
    },
    [devotion.passage.bookId, devotion.passage.chapter, openDailyDevotion, router]
  );

  const onPassageListen = useCallback(
    (_moduleId: string) => {
      router.push(buildBibleChapterPath(devotion.passage.bookId, devotion.passage.chapter) as Href);
    },
    [devotion.passage.bookId, devotion.passage.chapter, router]
  );

  const onPassageRead = useCallback(
    (_moduleId: string) => {
      router.push(buildBibleChapterPath(devotion.passage.bookId, devotion.passage.chapter) as Href);
    },
    [devotion.passage.bookId, devotion.passage.chapter, router]
  );

  return {
    userInitial,
    headerTitle: "Daily Abide",
    streakCount,
    weekDays,
    calendarLinkLabel: "CALENDAR COMING SOON",
    onCalendarPress,
    onCommunityPress,
    quoteImage: devotion.image,
    quoteText: devotion.quote.text,
    quoteAuthor: devotion.quote.author,
    quoteSourceLabel: devotion.quote.sourceLabel,
    quoteTheme: devotion.theme,
    quoteCompleted: progress.quoteCompleted,
    onQuoteCompletePress: openDailyDevotion,
    dateLabel: formatDateLabel(now),
    dailyTopicTitle: devotion.theme,
    dailySectionLabel: "DAILY DEVOTIONAL",
    isFavorite: progress.isFavorite,
    onFavoritePress: () => {
      void toggleFavorite();
    },
    modules: [
      {
        id: "mod-passage",
        kind: "passage",
        title: "Scripture",
        durationMinutes: 2,
        completed: progress.passageCompleted,
        summary: devotion.passage.summary,
        passageReference: devotion.passage.reference,
      },
      {
        id: "mod-devotional",
        kind: "devotional",
        title: "Devotional",
        durationMinutes: 4,
        completed: progress.devotionalCompleted,
        summary: devotion.devotional.title,
        body: devotion.devotional.body,
        actionLabel: progress.devotionalCompleted ? "Completed today" : "Open daily devotion",
      },
      {
        id: "mod-prayer",
        kind: "prayer",
        title: "Prayer",
        durationMinutes: 2,
        completed: progress.prayerCompleted,
        summary: devotion.prayer.title,
        body: devotion.prayer.body,
        actionLabel: progress.prayerCompleted ? "Completed today" : "Open daily devotion",
      },
    ],
    onModulePress,
    onPassageListen,
    onPassageRead,
    onPrimaryPromptPress: onHeartPress,
    primaryPromptTitle: "What's on your heart?",
    primaryPromptSubtitle: "Talk with Abide after today's devotion",
    conversations: MOCK_CONVERSATIONS,
    onConversationPress,
    onSettingsPress,
  };
}
