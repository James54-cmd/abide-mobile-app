import type { DevotionalModuleKind, HomeScreenProps } from "@/features/home/types";
import type { Conversation } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "Anxious heart",
    lastMessage: "You are held in grace.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c2",
    title: "Purpose today",
    lastMessage: "Walk in gentle obedience.",
    updatedAt: new Date().toISOString(),
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

  const name = useMemo(() => (authName?.trim() ? authName : "Beloved"), [authName]);
  const userInitial = useMemo(
    () => (name.trim().length > 0 ? name.trim()[0]!.toUpperCase() : "B"),
    [name]
  );

  const now = useMemo(() => new Date(), []);
  const weekDays = useMemo(() => buildWeekDays(now), [now]);

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
    (_id: string, _kind: DevotionalModuleKind) => {
      router.push("/(tabs)/chat");
    },
    [router]
  );

  const onPassageListen = useCallback(
    (_moduleId: string) => {
      router.push("/(tabs)/bible");
    },
    [router]
  );

  const onPassageRead = useCallback(
    (_moduleId: string) => {
      router.push("/(tabs)/bible");
    },
    [router]
  );

  const onFavoritePress = useCallback(() => {
    // Reserved for favorites / save flow
  }, []);

  return {
    userInitial,
    headerTitle: "Grow With God",
    streakCount: 0,
    weekDays,
    calendarLinkLabel: "VIEW CALENDAR & FAVORITES",
    onCalendarPress,
    onCommunityPress,
    dateLabel: formatDateLabel(now),
    dailyTopicTitle: "Goodness",
    dailySectionLabel: "DAILY DEVOTIONAL",
    onFavoritePress,
    modules: [
      {
        id: "mod-quote",
        kind: "quote",
        title: "Quote",
        completed: true,
      },
      {
        id: "mod-passage",
        kind: "passage",
        title: "Passage",
        durationMinutes: 2,
        passageReference: "Genesis 1:26-31",
      },
      {
        id: "mod-devotional",
        kind: "devotional",
        title: "Devotional",
        durationMinutes: 4,
      },
      {
        id: "mod-prayer",
        kind: "prayer",
        title: "Prayer",
        durationMinutes: 2,
      },
    ],
    onModulePress,
    onPassageListen,
    onPassageRead,
    onPrimaryPromptPress: onHeartPress,
    primaryPromptTitle: "What's on your heart?",
    primaryPromptSubtitle: "Start a conversation with Abide",
    conversations: MOCK_CONVERSATIONS,
    onConversationPress,
    onSettingsPress,
  };
}
