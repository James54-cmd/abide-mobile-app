import { supabase } from "@/lib/supabase";
import type { ChatMessage, Conversation } from "@/types";

/**
 * Conversation requests using direct Supabase client calls
 * 
 * Updated to use secure Supabase client instead of external API endpoints.
 * Requires user to be authenticated via Supabase auth.
 */

export async function getConversations(): Promise<Conversation[]> {
  const { data, error } = await supabase
    .from('chat_conversations')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch conversations: ${error.message}`);
  }

  return data || [];
}

export async function getConversationMessages(conversationId: string): Promise<ChatMessage[]> {
  if (!conversationId || conversationId === 'undefined' || conversationId.trim() === '') {
    throw new Error("Valid conversation ID is required");
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(`Failed to fetch messages: ${error.message}`);
  }

  return data || [];
}

export async function createConversation(title?: string): Promise<Conversation> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase
    .from('chat_conversations')
    .insert({
      title: title || 'New Conversation',  // Default to placeholder
      title_status: 'pending',             // Mark as pending title generation
      message_count: 0,                    // Start with zero messages
      user_id: user.id
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create conversation: ${error.message}`);
  }

  return data;
}

export async function sendChatMessage(
  conversationId: string, 
  content: string
): Promise<ChatMessage> {
  if (!conversationId || conversationId === 'undefined' || conversationId.trim() === '') {
    throw new Error("Valid conversation ID is required");
  }

  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }

  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: 'user',
      content,
      encouragement: null
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to send message: ${error.message}`);
  }

  return data;
}

export async function updateConversationTitle(conversationId: string, title: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Authentication required");
  }

  const { error } = await supabase
    .from('chat_conversations')
    .update({ 
      title, 
      title_status: 'user_edited',  // Mark as user-edited to prevent auto-overwrite
      updated_at: new Date().toISOString()
    })
    .eq('id', conversationId)
    .eq('user_id', user.id);

  if (error) {
    throw new Error(`Failed to update conversation title: ${error.message}`);
  }
}
