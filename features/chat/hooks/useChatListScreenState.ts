import type { ChatListScreenProps } from "@/features/chat/types";
import type { Conversation } from "@/types";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: "c1",
    title: "Anxious heart",
    last_message: "He is near to the brokenhearted.",
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    message_count: 2,
    unread_count: 0,
    user_id: "user1",
  },
  {
    id: "c2",
    title: "Evening prayer",
    last_message: "Rest in His faithfulness tonight.",
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    message_count: 1,
    unread_count: 1,
    user_id: "user1",
  },
  {
    id: "c3",
    title: "Purpose today",
    last_message: "Walk in gentle obedience.",
    updated_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    message_count: 0,
    unread_count: 0,
    user_id: "user1",
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

  const onNewConversation = useCallback(() => {
    // Generate new conversation ID
    const newId = `c${Date.now()}`;
    router.push(`/(tabs)/chat/${newId}`);
  }, [router]);

  return { conversations, onOpen, onNewConversation };
}
