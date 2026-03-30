import type { ChatListScreenProps } from "@/features/chat/types";
import type { Conversation } from "@/types";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "Anxious heart",
    lastMessage: "He is near to the brokenhearted.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c2",
    title: "Evening prayer",
    lastMessage: "Rest in His faithfulness tonight.",
    updatedAt: new Date().toISOString(),
  },
  {
    id: "c3",
    title: "Purpose today",
    lastMessage: "Walk in gentle obedience.",
    updatedAt: new Date().toISOString(),
  },
];

export function useChatListScreenState(): ChatListScreenProps {
  const router = useRouter();

  const conversations = useMemo(() => MOCK_CONVERSATIONS, []);

  const onOpen = useCallback(
    (id: string) => {
      router.push(`/(tabs)/chat/${id}`);
    },
    [router]
  );

  return { conversations, onOpen };
}
