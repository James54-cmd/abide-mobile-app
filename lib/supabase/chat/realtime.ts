import { supabase } from "@/lib/supabase";
import type { ChatMessage, Conversation } from "@/types";
import { RealtimeChannel } from "@supabase/supabase-js";

/**
 * Realtime subscription functions for chat - follows SKILL.md Rule 6 (data layer in lib/)
 * These handle raw Supabase realtime subscriptions, consumed by data hooks.
 */

export type MessageRealtimeEvent = {
  eventType: "INSERT" | "UPDATE" | "DELETE";
  new: ChatMessage;
  old: ChatMessage | null;
};

export type ConversationRealtimeEvent = {
  eventType: "INSERT" | "UPDATE" | "DELETE";  
  new: Conversation;
  old: Conversation | null;
};

/**
 * Subscribe to realtime updates for messages in a specific conversation
 */
export function subscribeToConversationMessages(
  conversationId: string,
  onMessage: (event: MessageRealtimeEvent) => void,
  onError?: (error: Error) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
        schema: "public",
        table: "chat_messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        try {
          onMessage({
            eventType: payload.eventType as MessageRealtimeEvent["eventType"],
            new: payload.new as ChatMessage,
            old: payload.old as ChatMessage | null,
          });
        } catch (error) {
          onError?.(error as Error);
        }
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIPTION_ERROR" && onError) {
        onError(new Error("Failed to subscribe to conversation messages"));
      }
    });

  return channel;
}

/**
 * Subscribe to realtime updates for all conversations for a user
 */
export function subscribeToUserConversations(
  userId: string,
  onConversation: (event: ConversationRealtimeEvent) => void,
  onError?: (error: Error) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`user-conversations:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
        schema: "public", 
        table: "chat_conversations",
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        try {
          onConversation({
            eventType: payload.eventType as ConversationRealtimeEvent["eventType"],
            new: payload.new as Conversation,
            old: payload.old as Conversation | null,
          });
        } catch (error) {
          onError?.(error as Error); 
        }
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIPTION_ERROR" && onError) {
        onError(new Error("Failed to subscribe to user conversations"));
      }
    });

  return channel;
}

/**
 * Unsubscribe from a realtime channel
 */
export async function unsubscribeFromChannel(channel: RealtimeChannel): Promise<void> {
  await supabase.removeChannel(channel);
}

/**
 * Subscribe to message count updates for conversation list
 */
export function subscribeToMessageCounts(
  userId: string,
  onUpdate: (conversationId: string, messageCount: number) => void,
  onError?: (error: Error) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`message-counts:${userId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "chat_messages", 
        filter: `user_id=eq.${userId}`,
      },
      (payload) => {
        try {
          const message = payload.new as ChatMessage;
          onUpdate(message.conversation_id, 0);
        } catch (error) {
          onError?.(error as Error);
        }
      }
    )
    .subscribe((status) => {
      if (status === "SUBSCRIPTION_ERROR" && onError) {
        onError(new Error("Failed to subscribe to message counts"));
      }
    });

  return channel;
}