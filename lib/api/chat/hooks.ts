import { useApiRequest } from "@/lib/api/hooks/useApiRequest";
import { 
  getConversations, 
  getConversationMessages,
  createConversation,
  sendChatMessage 
} from "@/lib/api/conversations/requests";
import { postAiEncouragement } from "@/lib/api/chat/requests";
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

  // Send user message immediately (appears right away in chat)
  const sendUserMessage = useCallback(async (
    conversationId: string,
    content: string
  ): Promise<ChatMessage> => {
    return await sendChatMessage(conversationId, content);
  }, []);

  /**
   * Get AI response only - user message should already be saved and visible
   * 
   * This creates a natural chat flow:
   * 1. User message appears immediately
   * 2. "AI is typing..." can be shown
   * 3. AI response appears when ready
   */
  const sendForEncouragement = useCallback(async (
    conversationId: string,
    message: string,
    history: ChatMessage[]
  ): Promise<ChatMessage> => {
    setSending(true);
    try {
      // AI function now only returns AI response (doesn't store user message)
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