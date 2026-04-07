import type { AiChatConversationPayload } from "@/lib/api/chat/requests";
import type { Conversation } from "@/types";

/**
 * Merge Edge Function `conversation` snapshot into thread-local conversation state.
 * Pure helper — keeps feature hook smaller (SKILL.md Rule 9).
 */
export function mergeConversationWithAiSnapshot(
  prev: Conversation | null,
  payload: AiChatConversationPayload,
  conversationId: string,
  userId: string
): Conversation {
  const base: Conversation =
    prev ?? {
      id: conversationId,
      user_id: userId,
      title: payload.title,
      title_status: payload.title_status,
      message_count: 0,
      created_at: new Date().toISOString(),
      updated_at: payload.updated_at,
    };

  return {
    ...base,
    title: payload.title,
    title_status: payload.title_status,
    updated_at: payload.updated_at,
  };
}
