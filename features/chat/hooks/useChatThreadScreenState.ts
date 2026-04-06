import type { ChatMessage } from "@/types";
import type { ChatThreadScreenProps } from "@/features/chat/types";
import { useConversationMessagesRealtime, useSendMessage } from "@/lib/api/chat/hooks";
import { useAuthStore } from "@/store/useAuthStore";
import { triggerSend } from "@/lib/native/haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState, useEffect } from "react";
import { 
  createOptimisticUserMessage,
  createAssistantPlaceholder,
  replacePlaceholderMessage,
  updateMessageStatus,
  isDuplicateSendInProgress,
  sortMessagesByDate,
  deduplicateMessages
} from "@/features/chat/utils/messageHelpers";
import {
  type ChatError,
  ChatErrorCodes,
  createChatError
} from "@/features/chat/utils/chatErrors";

/**
 * Feature hook for chat thread screen - follows SKILL.md Rule 10 (calls data hooks, not clients)
 * Composes data hooks and provides screen-specific logic and handlers.
 * 
 * Enhanced with optimistic updates for smooth, production-quality chat UX.
 */
export function useChatThreadScreenState(conversationId: string): ChatThreadScreenProps {
  const router = useRouter();
  const [inputText, setInputText] = useState("");
  const { userId } = useAuthStore();
  
  // Local optimistic message state for smooth UX
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  // Local error state for user feedback (SKILL.md Rule 14)
  const [sendError, setSendError] = useState<ChatError | null>(null);

  // Validate conversationId to prevent undefined UUID errors
  const isValidConversationId = Boolean(conversationId && 
    conversationId !== 'undefined' && 
    conversationId.trim() !== '');

  // Rule 6: Data hooks in lib/ - feature hooks call them (now with realtime)
  const { 
    data: serverMessages, 
    loadState, 
    errorMessage, 
    refetch 
  } = useConversationMessagesRealtime(isValidConversationId ? conversationId : '');

  const { 
    sendUserMessage,
    sendForEncouragement, 
    sending,
    error: dataHookError
  } = useSendMessage();

  // Business logic: Map data hook errors to user feedback (SKILL.md Rule 14)
  useEffect(() => {
    if (dataHookError) {
      setSendError(dataHookError);
      // TODO: Show toast notification for user feedback
      console.error("Send error:", dataHookError.userMessage);
    }
  }, [dataHookError]);

  // Combine server messages with optimistic messages for display, with deduplication
  const messages = useMemo(() => {
    const all = [...(serverMessages ?? []), ...optimisticMessages];
    const sorted = sortMessagesByDate(all);
    const deduplicated = deduplicateMessages(sorted);
    return deduplicated;
  }, [serverMessages, optimisticMessages]);

  // Clear optimistic messages that now have corresponding server messages (enhanced for realtime)
  useEffect(() => {
    if (!serverMessages || serverMessages.length === 0) return;
    
    setOptimisticMessages(prev => {
      // More aggressive cleanup since realtime updates arrive instantly
      return prev.filter(optimistic => {
        // Keep loading/sending/failed messages
        if (optimistic.status === 'loading' || optimistic.status === 'sending' || optimistic.status === 'failed') {
          return true;
        }
        
        // For realtime, check exact content match with any server message
        const hasServerVersion = serverMessages.some(server => 
          server.content.trim() === optimistic.content.trim() && 
          server.role === optimistic.role
        );
        
        // If there's a server version, remove the optimistic one
        return !hasServerVersion;
      });
    });
  }, [serverMessages]);

  const canSend = useMemo(() => {
    const trimmed = inputText.trim();
    return (
      isValidConversationId && 
      trimmed.length > 0 && 
      !sending && 
      !isDuplicateSendInProgress(optimisticMessages, trimmed)
    );
  }, [isValidConversationId, inputText, sending, optimisticMessages]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const onInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !isValidConversationId || !canSend || !userId) return;
    
    // Clear any previous errors
    setSendError(null);
    
    // Create optimistic messages with local IDs
    let optimisticUserMsg: ChatMessage | undefined;
    let assistantPlaceholder: ChatMessage | undefined;
    
    try {
      // Haptics feedback (SKILL.md Rule 9 - wrapped native module)
      await triggerSend();
      
      // 1. Immediately create and render optimistic user message
      optimisticUserMsg = createOptimisticUserMessage(trimmed, conversationId, userId);
      
      // Clear input and add user message optimistically (NO assistant placeholder yet)
      setInputText("");
      setOptimisticMessages(prev => [...prev, optimisticUserMsg!]);
      
      // 2. Send user message to server (SKILL.md Rule 14 - handle errors)
      const userResult = await sendUserMessage(conversationId, trimmed);
      
      if (userResult.error) {
        // Handle user message send failure
        setOptimisticMessages(prev => 
          updateMessageStatus(prev, optimisticUserMsg!.localId!, "failed")
        );
        setSendError(userResult.error);
        return;
      }
      
      // Update optimistic user message to sent status
      setOptimisticMessages(prev => 
        updateMessageStatus(prev, optimisticUserMsg!.localId!, "sent")
      );
      
      // 3. NOW show assistant placeholder - Abide starts reflecting after receiving the message
      assistantPlaceholder = createAssistantPlaceholder(conversationId, userId);
      setOptimisticMessages(prev => [...prev, assistantPlaceholder!]);
      
      // 4. Get AI response (placeholder is now showing)
      const currentMessages = [...(serverMessages ?? []), userResult.message!];
      const aiResult = await sendForEncouragement(conversationId, trimmed, currentMessages);
      
      if (aiResult.error) {
        // Handle AI response failure
        setOptimisticMessages(prev => 
          updateMessageStatus(
            prev, 
            assistantPlaceholder!.localId!, 
            "failed",
            "Sorry, I'm unable to respond right now. Please try again."
          )
        );
        setSendError(aiResult.error);
        return;
      }
      
      // 5. Replace placeholder with actual AI response
      setOptimisticMessages(prev => 
        replacePlaceholderMessage(prev, assistantPlaceholder!.localId!, aiResult.result!.message)
      );
      
      // Handle conversation title updates
      if (aiResult.result!.conversation?.title_updated) {
        console.log('Title updated for conversation:', conversationId);
      }
      
      // 6. Refresh server data (this will clear optimistic messages via useEffect)
      refetch();
      
    } catch (error) {
      // Fallback error handling for unexpected errors
      console.error("Unexpected send error:", error);
      
      const chatError = createChatError(
        ChatErrorCodes.UNKNOWN_ERROR,
        error instanceof Error ? error.message : String(error)
      );
      
      // Mark messages as failed appropriately
      if (optimisticUserMsg) {
        setOptimisticMessages(prev => {
          let updated = updateMessageStatus(prev, optimisticUserMsg!.localId!, "failed");
          
          // Only mark assistant placeholder as failed if it exists
          if (assistantPlaceholder) {
            updated = updateMessageStatus(
              updated, 
              assistantPlaceholder.localId!, 
              "failed",
              "Something went wrong. Please try again."
            );
          }
          
          return updated;
        });
      }
      
      setSendError(chatError);
    }
  }, [inputText, conversationId, isValidConversationId, canSend, userId, sendUserMessage, sendForEncouragement, serverMessages, refetch]);

  const onScrollToBottom = useCallback(() => {
    // Handler for FlatList onContentSizeChange - implementation handled in component
  }, []);

  return {
    conversationId,
    messages,
    loading: loadState === "loading",
    error: isValidConversationId ? errorMessage : "Invalid conversation ID",
    inputText,
    canSend,
    sending,
    sendError: sendError?.userMessage || null, // Expose user-friendly error message
    onBack,
    onInputChange,
    onSend: handleSendMessage, // Use proper async handler name
    onScrollToBottom,
    refetch,
  };
}
