import { useApiRequest } from "@/lib/api/hooks/useApiRequest";
import { 
  getConversations, 
  getConversationMessages,
  createConversation,
  sendChatMessage 
} from "@/lib/api/conversations/requests";
import { postEncouragement } from "@/lib/api/chat/requests";
import { useAuthStore } from "@/store/useAuthStore";
import type { ChatMessage, Conversation, EncouragementResponse } from "@/types";
import { useCallback, useState } from "react";

/**
 * Data hooks for chat functionality - follows SKILL.md Rule 6 (data hooks in lib/)
 * These hooks handle all data fetching and caching, consumed by feature hooks.
 */

// ── Conversations ──

export function useGetConversations() {
  const { jwt } = useAuthStore();
  
  return useApiRequest(
    () => {
      if (!jwt) throw new Error("Authentication required");
      return getConversations(jwt);
    },
    [jwt],
    "Failed to load conversations"
  );
}

export function useGetConversationMessages(conversationId: string) {
  const { jwt } = useAuthStore();
  
  return useApiRequest(
    () => {
      if (!jwt) throw new Error("Authentication required");
      return getConversationMessages(jwt, conversationId);
    },
    [jwt, conversationId],
    "Failed to load conversation messages"
  );
}

export function useCreateConversation() {
  const { jwt } = useAuthStore();
  const [loading, setLoading] = useState(false);
  
  const createNew = useCallback(async (title: string): Promise<Conversation> => {
    if (!jwt) throw new Error("Authentication required");
    
    setLoading(true);
    try {
      const conversation = await createConversation(jwt, title);
      return conversation;
    } finally {
      setLoading(false);
    }
  }, [jwt]);
  
  return { createNew, loading };
}

// ── Chat Messages ──

export function useSendMessage() {
  const { jwt } = useAuthStore();
  const [sending, setSending] = useState(false);
  
  const sendUserMessage = useCallback(async (
    conversationId: string,
    content: string
  ): Promise<ChatMessage> => {
    if (!jwt) throw new Error("Authentication required");
    
    setSending(true);
    try {
      return await sendChatMessage(jwt, conversationId, content);
    } finally {
      setSending(false);
    }
  }, [jwt]);

  const sendForEncouragement = useCallback(async (
    conversationId: string,
    message: string,
    history: ChatMessage[]
  ): Promise<EncouragementResponse> => {
    if (!jwt) throw new Error("Authentication required");
    
    return postEncouragement(jwt, {
      conversationId,
      message,
      history
    });
  }, [jwt]);
  
  return { sendUserMessage, sendForEncouragement, sending };
}