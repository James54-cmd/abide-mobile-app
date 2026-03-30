import type { Conversation, Verse } from "@/types";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

const MOCK_VERSE: Verse = {
  id: "votd",
  reference: "Psalm 46:10",
  text: "Be still, and know that I am God.",
  translation: "NIV",
};

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
  {
    id: "c3",
    title: "Family prayer",
    lastMessage: "Peace over your home.",
    updatedAt: new Date().toISOString(),
  },
];

export function useHomeScreenState() {
  const router = useRouter();
  const authName = useAuthStore((s) => s.name);

  const name = useMemo(() => (authName?.trim() ? authName : "Beloved"), [authName]);

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

  return {
    name,
    verse: MOCK_VERSE,
    streakDays: 3,
    conversations: MOCK_CONVERSATIONS,
    onHeartPress,
    onConversationPress,
    onSettingsPress,
  };
}
