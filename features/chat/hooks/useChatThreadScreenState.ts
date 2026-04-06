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

  // Validate conversationId to prevent undefined UUID errors
  const isValidConversationId = Boolean(conversationId && 
    conversationId !== 'undefined' && 
    conversationId.trim() !== '');

  // Rule 6: Data hooks in lib/ - feature hooks call them  
  const { 
    data: messages, 
    loadState, 
    errorMessage, 
    refetch 
  } = useGetConversationMessages(isValidConversationId ? conversationId : '');

  const { 
    sendUserMessage,
    sendForEncouragement, 
    sending 
  } = useSendMessage();

  const canSend = useMemo(() => 
    isValidConversationId && inputText.trim().length > 0 && !sending, 
    [isValidConversationId, inputText, sending]
  );

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const onSend = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !isValidConversationId) return;
    
    try {
      void triggerSend();
      setInputText("");
      
      // Natural chat flow:
      // 1. Send user message first (appears immediately)
      const userMessage = await sendUserMessage(conversationId, trimmed);
      
      // 2. Refresh to show user message right away
      refetch();
      
      // 3. Get AI response (user can see "AI is typing..." here)
      const currentMessages = [...(messages ?? []), userMessage];
      const aiResponse = await sendForEncouragement(conversationId, trimmed, currentMessages);
      
      // 4. Refresh again to show AI response when ready
      refetch();
      
    } catch (error) {
      console.error("Failed to send message:", error);
      // TODO: Show user-friendly error toast
    }
  }, [inputText, conversationId, isValidConversationId, sendUserMessage, sendForEncouragement, messages, refetch]);

  const onScrollToBottom = useCallback(() => {
    // Handler for FlatList onContentSizeChange - implementation handled in component
  }, []);

  return {
    conversationId,
    messages: messages ?? [],
    loading: loadState === "loading",
    error: isValidConversationId ? errorMessage : "Invalid conversation ID",
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
