import { useApiRequest } from "@/lib/api/hooks/useApiRequest";
import { 
  getConversations, 
  getConversationMessages,
  createConversation,
  sendChatMessage 
} from "@/lib/api/conversations/requests";
import { postAiEncouragement, debugAiEncouragement } from "@/lib/api/chat/requests";
import type { ChatMessage, Conversation } from "@/types";
import { useCallback, useState } from "react";

/**
 * Data hooks for chat functionality - follows SKILL.md Rule 6 (data hooks in lib/)
 * These hooks handle all data fetching and caching, consumed by feature hooks.
 * 
 * Security Note: Now uses secure Supabase Edge Functions instead of client-side OpenAI calls.
 */

// ── Conversations ──

export function useGetConversations() {
  return useApiRequest(
    () => getConversations(),
    [],
    "Failed to load conversations"
  );
}

export function useGetConversationMessages(conversationId: string) {
  return useApiRequest(
    () => {
      if (!conversationId || conversationId === 'undefined' || conversationId.trim() === '') {
        throw new Error("Valid conversation ID is required");
      }
      return getConversationMessages(conversationId);
    },
    [conversationId],
    "Failed to load conversation messages"
  );
}

export function useCreateConversation() {
  const [loading, setLoading] = useState(false);
  
  const createNew = useCallback(async (title: string): Promise<Conversation> => {
    setLoading(true);
    try {
      const conversation = await createConversation(title);
      return conversation;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { createNew, loading };
}

// ── Chat Messages ──

export function useSendMessage() {
  const [sending, setSending] = useState(false);
  
  const sendUserMessage = useCallback(async (
    conversationId: string,
    content: string
  ): Promise<ChatMessage> => {
    // Note: User messages are now stored automatically by the AI Edge Function
    // This function is kept for API compatibility but should not be used directly.
    // Use sendForEncouragement instead - it handles both user message storage and AI response.
    throw new Error("Use sendForEncouragement instead - user messages are stored automatically");
  }, []);

  /**
   * Send message for AI encouragement using secure Edge Function
   * 
   * This replaces the old postEncouragement that used client-side API calls.
   * Now routes through Supabase Edge Function for proper security.
   */
  const sendForEncouragement = useCallback(async (
    conversationId: string,
    message: string,
    history: ChatMessage[]
  ): Promise<ChatMessage> => {
    setSending(true);
    try {
      // Back to production function - should work with --no-verify-jwt
      return await postAiEncouragement({
        conversationId,
        message,
        history
      });
    } finally {
      setSending(false);
    }
  }, []);
  
  return { sendUserMessage, sendForEncouragement, sending };
}