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
  console.log(`🟡 [Mutation] Deleting conversation: ${conversationId}`);
  
  // First delete all messages in the conversation
  const { error: messagesError } = await supabase
    .from("chat_messages")
    .delete()
    .eq("conversation_id", conversationId);

  console.log(`🟡 [Mutation] Messages deletion response:`, { messagesError });

  if (messagesError) {
    console.log(`🟡 [Mutation] Messages deletion failed:`, messagesError);
    throw new Error(`Failed to delete conversation messages: ${messagesError.message}`);
  }

  // Then delete the conversation itself
  const { error: conversationError } = await supabase
    .from("chat_conversations")
    .delete()
    .eq("id", conversationId);

  console.log(`🟡 [Mutation] Conversation deletion response:`, { conversationError });

  if (conversationError) {
    console.log(`🟡 [Mutation] Conversation deletion failed:`, conversationError);
    throw new Error(`Failed to delete conversation: ${conversationError.message}`);
  }
  
  console.log(`🟡 [Mutation] Conversation deleted successfully`);
}

/**
 * Update conversation title
 */
export async function updateConversationTitle(
  conversationId: string, 
  newTitle: string
): Promise<Conversation> {
  console.log(`🟡 [Mutation] Updating conversation ${conversationId} with title: "${newTitle}"`);
  
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

  console.log(`🟡 [Mutation] Update response:`, { data, error });

  if (error) {
    console.log(`🟡 [Mutation] Update failed:`, error);
    throw new Error(`Failed to update conversation title: ${error.message}`);
  }

  if (!data) {
    console.log(`🟡 [Mutation] No data returned from update`);
    throw new Error("Conversation not found");
  }

  console.log(`🟡 [Mutation] Update successful:`, data);
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
    .maybeSingle(); // Use maybeSingle() instead of single() to handle missing records gracefully

  if (error) {
    throw new Error(`Failed to get conversation details: ${error.message}`);
  }

  if (!data) {
    throw new Error("Conversation not found or has been deleted");
  }

  return data as Conversation;
}