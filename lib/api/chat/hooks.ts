import { useApiRequest } from "@/lib/api/hooks/useApiRequest";
import { 
  getConversations, 
  getConversationMessages,
  createConversation,
  sendChatMessage 
} from "@/lib/api/conversations/requests";
import { postAiEncouragement } from "@/lib/api/chat/requests";
import { deleteConversation, updateConversationTitle } from "@/lib/supabase/chat/mutations";
import type { ChatMessage, Conversation } from "@/types";
import { 
  createChatError, 
  ChatErrorCodes, 
  normalizeChatError,
  type ChatError 
} from "@/features/chat/utils/chatErrors";
import {
  subscribeToConversationMessages,
  subscribeToUserConversations, 
  unsubscribeFromChannel,
  type MessageRealtimeEvent,
  type ConversationRealtimeEvent
} from "@/lib/supabase/chat/realtime";
import { useAuthStore } from "@/store/useAuthStore";
import { useCallback, useState, useEffect, useRef } from "react";

/**
 * Data hooks for chat functionality - follows SKILL.md Rule 6 (data hooks in lib/)
 * These hooks handle all data fetching and caching, consumed by feature hooks.
 * 
 * Security Note: Now uses secure Supabase Edge Functions instead of client-side OpenAI calls.
 */

// ── Conversations with Realtime ──

export function useGetConversations() {
  return useApiRequest(
    () => getConversations(),
    [],
    "Failed to load conversations"
  );
}

/**
 * Realtime conversations hook - follows SKILL.md Rule 6 (data hooks in lib/)
 * Subscribes to live conversation updates for the authenticated user
 */
export function useConversationsRealtime() {
  const { userId } = useAuthStore();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ChatError | null>(null);
  const channelRef = useRef<ReturnType<typeof subscribeToUserConversations> | null>(null);

  // Initial load
  useEffect(() => {
    if (!userId) return;

    const loadInitialConversations = async () => {
      try {
        setLoading(true);
        const data = await getConversations();
        setConversations(data);
        setError(null);
      } catch (err) {
        setError(normalizeChatError(err));
      } finally {
        setLoading(false);
      }
    };

    void loadInitialConversations();
  }, [userId]);

  // Realtime subscription
  useEffect(() => {
    if (!userId) return;

    const handleConversationUpdate = (event: ConversationRealtimeEvent) => {
      setConversations(prev => {
        switch (event.eventType) {
          case "INSERT":
            // Add new conversation
            return [event.new, ...prev];
          
          case "UPDATE":
            // Update existing conversation
            return prev.map(conv => 
              conv.id === event.new.id ? event.new : conv
            );
          
          case "DELETE":
            // Remove deleted conversation
            return prev.filter(conv => conv.id !== event.old?.id);
          
          default:
            return prev;
        }
      });
    };

    const handleError = (error: Error) => {
      setError(createChatError(ChatErrorCodes.NETWORK_ERROR, error.message));
    };

    // Subscribe to realtime updates
    channelRef.current = subscribeToUserConversations(
      userId, 
      handleConversationUpdate,
      handleError
    );

    // Cleanup on unmount or userId change
    return () => {
      if (channelRef.current) {
        void unsubscribeFromChannel(channelRef.current);
      }
    };
  }, [userId]);

  return { 
    conversations, 
    loading, 
    error,
    refetch: useCallback(async () => {
      if (!userId) return;
      try {
        const data = await getConversations();
        setConversations(data);
        setError(null);
      } catch (err) {
        setError(normalizeChatError(err));
      }
    }, [userId])
  };
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

/**
 * Realtime conversation messages hook - follows SKILL.md Rule 6 (data hooks in lib/)
 * Subscribes to live message updates for a specific conversation
 */
export function useConversationMessagesRealtime(conversationId: string) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ChatError | null>(null);
  const channelRef = useRef<ReturnType<typeof subscribeToConversationMessages> | null>(null);

  // Validate conversation ID
  const isValidConversationId = Boolean(conversationId && 
    conversationId !== 'undefined' && 
    conversationId.trim() !== '');

  // Initial load
  useEffect(() => {
    if (!isValidConversationId) return;

    const loadInitialMessages = async () => {
      try {
        setLoading(true);
        const data = await getConversationMessages(conversationId);
        setMessages(data);
        setError(null);
      } catch (err) {
        setError(normalizeChatError(err));
      } finally {
        setLoading(false);
      }
    };

    void loadInitialMessages();
  }, [conversationId, isValidConversationId]);

  // Realtime subscription  
  useEffect(() => {
    if (!isValidConversationId) return;

    const handleMessageUpdate = (event: MessageRealtimeEvent) => {
      setMessages(prev => {
        switch (event.eventType) {
          case "INSERT": {
            // Add new message, avoid duplicates
            const exists = prev.some(msg => 
              String(msg.id) === String(event.new.id)
            );
            if (exists) return prev;
            
            // Insert in chronological order
            const newMessages = [...prev, event.new];
            return newMessages.sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          }
          
          case "UPDATE": {
            // Update existing message
            return prev.map(msg => 
              String(msg.id) === String(event.new.id) ? event.new : msg
            );
          }
          
          case "DELETE": {
            // Remove deleted message
            return prev.filter(msg => 
              String(msg.id) !== String(event.old?.id)
            );
          }
          
          default:
            return prev;
        }
      });
    };

    const handleError = (error: Error) => {
      setError(createChatError(ChatErrorCodes.NETWORK_ERROR, error.message));
    };

    // Subscribe to realtime updates
    channelRef.current = subscribeToConversationMessages(
      conversationId,
      handleMessageUpdate, 
      handleError
    );

    // Cleanup on unmount or conversationId change
    return () => {
      if (channelRef.current) {
        void unsubscribeFromChannel(channelRef.current);
      }
    };
  }, [conversationId, isValidConversationId]);

  return {
    data: messages,
    loadState: loading ? "loading" : "success",
    errorMessage: error?.userMessage || null,
    refetch: useCallback(async () => {
      if (!isValidConversationId) return;
      try {
        const data = await getConversationMessages(conversationId);
        setMessages(data);
        setError(null);
      } catch (err) {
        setError(normalizeChatError(err));
      }
    }, [conversationId, isValidConversationId])
  };
}

export function useCreateConversation() {
  const [loading, setLoading] = useState(false);
  
  const createNew = useCallback(async (title?: string): Promise<Conversation> => {
    setLoading(true);
    try {
      const conversation = await createConversation(title); // title is now optional
      return conversation;
    } finally {
      setLoading(false);
    }
  }, []);
  
  return { createNew, loading };
}

// ── Conversation Mutations ──

/**
 * Hook for deleting conversations - follows SKILL.md Rule 6 (data hooks in lib/)
 */
export function useDeleteConversation() {
  const [deleting, setDeleting] = useState<string | null>(null); // Track which conversation is being deleted
  const [error, setError] = useState<ChatError | null>(null);

  const deleteConv = useCallback(async (conversationId: string): Promise<{ success?: boolean; error?: ChatError }> => {
    setDeleting(conversationId);
    setError(null);
    
    try {
      await deleteConversation(conversationId);
      return { success: true };
    } catch (err) {
      const chatError = normalizeChatError(err);
      setError(chatError);
      return { error: chatError };
    } finally {
      setDeleting(null);
    }
  }, []);

  return { deleteConversation: deleteConv, deleting, error };
}

/**
 * Hook for renaming conversations - follows SKILL.md Rule 6 (data hooks in lib/)
 */
export function useRenameConversation() {
  const [renaming, setRenaming] = useState<string | null>(null); // Track which conversation is being renamed
  const [error, setError] = useState<ChatError | null>(null);

  const rename = useCallback(async (
    conversationId: string, 
    newTitle: string
  ): Promise<{ conversation?: Conversation; error?: ChatError }> => {
    const trimmedTitle = newTitle.trim();
    
    if (!trimmedTitle || trimmedTitle.length < 1) {
      const validationError = createChatError(
        ChatErrorCodes.MESSAGE_TOO_LONG, // Reuse for validation
        "Title cannot be empty"
      );
      setError(validationError);
      return { error: validationError };
    }

    if (trimmedTitle.length > 100) {
      const validationError = createChatError(
        ChatErrorCodes.MESSAGE_TOO_LONG,
        "Title must be 100 characters or less"
      );
      setError(validationError);
      return { error: validationError };
    }

    setRenaming(conversationId);
    setError(null);
    
    try {
      const updatedConversation = await updateConversationTitle(conversationId, trimmedTitle);
      return { conversation: updatedConversation };
    } catch (err) {
      const chatError = normalizeChatError(err);
      setError(chatError);
      return { error: chatError };
    } finally {
      setRenaming(null);
    }
  }, []);

  return { renameConversation: rename, renaming, error };
}

// ── Chat Messages ──

export function useSendMessage() {
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<ChatError | null>(null);

  // Send user message immediately (appears right away in chat)
  const sendUserMessage = useCallback(async (
    conversationId: string,
    content: string
  ): Promise<{ message?: ChatMessage; error?: ChatError }> => {
    setError(null);
    try {
      const message = await sendChatMessage(conversationId, content);
      return { message };
    } catch (err) {
      const chatError = normalizeChatError(err);
      setError(chatError);
      return { error: chatError };
    }
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
  ): Promise<{
    result?: {
      message: ChatMessage;
      conversation?: { title_updated: boolean; title?: string };
    };
    error?: ChatError;
  }> => {
    setSending(true);
    setError(null);
    try {
      // AI function returns AI response and conversation updates
      const result = await postAiEncouragement({
        conversationId,
        message,
        history
      });
      return { result };
    } catch (err) {
      const chatError = normalizeChatError(err);
      setError(chatError);
      return { error: chatError };
    } finally {
      setSending(false);
    }
  }, []);
  
  return { sendUserMessage, sendForEncouragement, sending, error };
}