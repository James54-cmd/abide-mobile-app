import type { ChatThreadScreenProps } from "@/features/chat/types";
import { useGetConversationMessages, useSendMessage } from "@/lib/api/chat/hooks";
import { triggerSend } from "@/lib/native/haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

/**
 * Feature hook for chat thread screen - follows SKILL.md Rule 10 (calls data hooks, not clients)
 * Composes data hooks and provides screen-specific logic and handlers.
 */
export function useChatThreadScreenState(conversationId: string): ChatThreadScreenProps {
  const router = useRouter();
  const [inputText, setInputText] = useState("");

  // Rule 6: Data hooks in lib/ - feature hooks call them  
  const { 
    data: messages, 
    loadState, 
    errorMessage, 
    refetch 
  } = useGetConversationMessages(conversationId);

  const { 
    sendUserMessage, 
    sendForEncouragement, 
    sending 
  } = useSendMessage();

  const canSend = useMemo(() => 
    inputText.trim().length > 0 && !sending, 
    [inputText, sending]
  );

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const onSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    
    try {
      void triggerSend();
      
      // Send user message
      await sendUserMessage(conversationId, trimmed);
      setInputText("");
      
      // Get AI encouragement (with current messages + new message)
      const currentMessages = messages ?? [];
      await sendForEncouragement(conversationId, trimmed, currentMessages);
      
      // Refetch to get latest messages including AI response
      refetch();
      
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Show user-friendly error toast
    }
  }, [inputText, conversationId, sendUserMessage, sendForEncouragement, messages, refetch]);

  const onScrollToBottom = useCallback(() => {
    // Handler for FlatList onContentSizeChange - implementation handled in component
  }, []);

  return {
    conversationId,
    messages: messages ?? [],
    loading: loadState === "loading",
    error: errorMessage,
    inputText,
    canSend,
    sending,
    onBack,
    onInputChange,
    onSend,
    onScrollToBottom,
    refetch,
  };
}
