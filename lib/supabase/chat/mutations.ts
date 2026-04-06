import { supabase } from "@/lib/supabase";
import type { Conversation } from "@/types";

/**
 * Conversation mutation functions - follows SKILL.md Rule 6 (data layer in lib/)
 * These handle raw API calls for conversation operations.
 */

/**
 * Delete a conversation and all its messages
 */
export async function deleteConversation(conversationId: string): Promise<void> {
  // First delete all messages in the conversation
  const { error: messagesError } = await supabase
    .from("chat_messages")
    .delete()
    .eq("conversation_id", conversationId);

  if (messagesError) {
    throw new Error(`Failed to delete conversation messages: ${messagesError.message}`);
  }

  // Then delete the conversation itself
  const { error: conversationError } = await supabase
    .from("chat_conversations")
    .delete()
    .eq("id", conversationId);

  if (conversationError) {
    throw new Error(`Failed to delete conversation: ${conversationError.message}`);
  }
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string, 
  newTitle: string
): Promise<Conversation> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .update({ 
      title: newTitle.trim(),
      title_status: 'user_edited', // Mark as user-edited to prevent AI from overwriting
      updated_at: new Date().toISOString()
    })
    .eq("id", conversationId)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Failed to update conversation title: ${error.message}`);
  }

  if (!data) {
    throw new Error("Conversation not found");
  }

  return data as Conversation;
}

/**
 * Get conversation details for validation
 */
export async function getConversationDetails(conversationId: string): Promise<Conversation> {
  const { data, error } = await supabase
    .from("chat_conversations")
    .select("*")
    .eq("id", conversationId)
    .single();

  if (error) {
    throw new Error(`Failed to get conversation details: ${error.message}`);
  }

  if (!data) {
    throw new Error("Conversation not found");
  }

  return data as Conversation;
}