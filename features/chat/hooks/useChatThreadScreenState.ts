import type { ChatThreadScreenProps } from "@/features/chat/types";
import type { ChatMessage } from "@/types";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

const TITLES: Record<string, string> = {
  c1: "Anxious heart",
  c2: "Evening prayer",
  c3: "Purpose today",
};

const MOCK_BY_ID: Record<string, ChatMessage[]> = {
  c1: [
    {
      id: "u1",
      role: "user",
      content: "I feel overwhelmed today.",
      createdAt: new Date().toISOString(),
    },
    {
      id: "a1",
      role: "assistant",
      content: "You are not alone in this moment.",
      createdAt: new Date().toISOString(),
      response: {
        intro: "Breathe. God is near.",
        verses: [
          {
            id: "v1",
            reference: "Matthew 11:28",
            text: "Come to me, all you who are weary and burdened, and I will give you rest.",
            translation: "NIV",
            relevance: "Jesus invites your tired heart.",
          },
        ],
        closing: "You are carried in mercy.",
        rebuke: null,
        practicalStep: "Take 3 slow breaths and pray this verse aloud.",
      },
    },
  ],
  c2: [
    {
      id: "u2",
      role: "user",
      content: "Thank you for this day.",
      createdAt: new Date().toISOString(),
    },
  ],
  c3: [],
};

function defaultMessages(): ChatMessage[] {
  return MOCK_BY_ID.c1 ?? [];
}

export function useChatThreadScreenState(conversationId: string): ChatThreadScreenProps {
  const router = useRouter();

  const title = useMemo(
    () => TITLES[conversationId] ?? "Conversation",
    [conversationId]
  );

  const messages = useMemo(() => {
    return MOCK_BY_ID[conversationId] ?? defaultMessages();
  }, [conversationId]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onSendPress = useCallback(() => {
    // Wire to send message API when available
  }, []);

  return {
    conversationId,
    title,
    messages,
    onBack,
    onSendPress,
  };
}
