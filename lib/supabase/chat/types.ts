import type { ChatMessage, Conversation, EncouragementResponse } from "@/types";

/**
 * Database row types - match exactly what comes from Supabase
 */
export interface ConversationRow {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: number;
  conversation_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  encouragement: EncouragementResponse | null;
  created_at: string;
}

/**
 * Transform database conversation row + messages to UI-ready conversation.
 * Computes derived fields like last_message and message_count.
 */
export function transformConversation(
  conversationRow: ConversationRow,
  messages: ChatMessageRow[] = []
): Conversation {
  const sortedMessages = messages.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  const last_message = sortedMessages[0]?.content || "No messages yet";
  const message_count = messages.length;

  return {
    id: conversationRow.id,
    user_id: conversationRow.user_id,
    title: conversationRow.title,
    created_at: conversationRow.created_at,
    updated_at: conversationRow.updated_at,
    last_message,
    message_count,
    unread_count: 0, // TODO: Implement unread logic based on business rules
  };
}

/**
 * Transform database message row to UI message format.
 * Handles both user and assistant messages with encouragement data.
 */
export function transformChatMessage(messageRow: ChatMessageRow): ChatMessage {
  return {
    id: messageRow.id,
    conversation_id: messageRow.conversation_id,
    user_id: messageRow.user_id,
    role: messageRow.role,
    content: messageRow.content,
    encouragement: messageRow.encouragement,
    created_at: messageRow.created_at,
  };
}