import type { ChatThreadScreenProps } from "@/features/chat/types";
import type { ChatMessage } from "@/types";
import { triggerSend } from "@/lib/native/haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

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
      created_at: new Date().toISOString(),
      conversation_id: "c1",
      user_id: "user1",
    },
    {
      id: "a1",
      role: "assistant",
      content: "You are not alone in this moment.",
      created_at: new Date().toISOString(),
      conversation_id: "c1",
      user_id: "system",
      encouragement: {
        intro: "Breathe. God is near.",
        verses: [
          {
            reference: "Matthew 11:28",
            text: "Come to me, all you who are weary and burdened, and I will give you rest.",
          },
        ],
        closing: "You are carried in mercy.",
        practicalStep: "Take 3 slow breaths and pray this verse aloud.",
        rebuke: null,
      },
    },
  ],
  c2: [
    {
      id: "u2",
      role: "user",
      content: "Thank you for this day.",
      created_at: new Date().toISOString(),
      conversation_id: "c2",
      user_id: "user1",
    },
  ],
  c3: [],
};

function defaultMessages(): ChatMessage[] {
  return MOCK_BY_ID.c1 ?? [];
}

export function useChatThreadScreenState(conversationId: string): ChatThreadScreenProps {
  const router = useRouter();
  const [inputText, setInputText] = useState("");

  const title = useMemo(
    () => TITLES[conversationId] ?? "Conversation",
    [conversationId]
  );

  const messages = useMemo(() => {
    return MOCK_BY_ID[conversationId] ?? defaultMessages();
  }, [conversationId]);

  const canSend = useMemo(() => inputText.trim().length > 0, [inputText]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const onSend = useCallback(() => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    
    void triggerSend();
    // TODO: Wire to send message API when available
    console.log("Sending message:", trimmed);
    setInputText("");
  }, [inputText]);

  const onScrollToBottom = useCallback(() => {
    // Handler for FlatList onContentSizeChange - implementation handled in component
  }, []);

  return {
    conversationId,
    title,
    messages,
    inputText,
    canSend,
    onBack,
    onInputChange,
    onSend,
    onScrollToBottom,
  };
}
