import { supabase } from "@/lib/supabase";
import type { ChatMessage, Conversation } from "@/types";

/**
 * AI Chat requests using secure Supabase Edge Functions
 * 
 * This replaces direct OpenAI API calls with server-side Edge Function calls
 * that keep API keys secure and provide proper authentication/rate limiting.
 */

export interface AiChatRequest {
  conversationId: string;
  message: string;
  history: ChatMessage[];
}

/** Snapshot of `chat_conversations` row fields the edge function returns for client sync */
export interface AiChatConversationPayload {
  id: string;
  title: string;
  title_status: Conversation["title_status"];
  updated_at: string;
}

export interface AiChatResponse {
  success: true;
  message: {
    id: string;
    conversation_id: string;
    role: 'assistant';
    content: string;
    encouragement?: unknown;
    created_at: string;
    user_id: string;
  };
  conversation?: AiChatConversationPayload;
  /** Legacy flag; prefer `conversation` for title + status */
  titleUpdated?: boolean;
}

export interface AiChatError {
  success: false;
  error: string;
}

function isConversationTitleStatus(v: unknown): v is Conversation["title_status"] {
  return (
    v === "pending" ||
    v === "generated" ||
    v === "locked" ||
    v === "user_edited"
  );
}

/**
 * Narrow untrusted Edge Function JSON to a typed conversation snapshot (SKILL.md: unknown + guards, no `any`).
 */
export function parseAiChatConversationPayload(raw: unknown): AiChatConversationPayload | undefined {
  if (raw === null || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  if (
    typeof o.id !== "string" ||
    typeof o.title !== "string" ||
    typeof o.updated_at !== "string" ||
    !isConversationTitleStatus(o.title_status)
  ) {
    return undefined;
  }
  return {
    id: o.id,
    title: o.title,
    title_status: o.title_status,
    updated_at: o.updated_at,
  };
}

function coerceAssistantEncouragement(raw: unknown): ChatMessage["encouragement"] | undefined {
  if (raw === null || raw === undefined) return undefined;
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") {
    return raw as ChatMessage["encouragement"];
  }
  return undefined;
}

/**
 * Send message to AI through secure Edge Function
 * 
 * @param request - Chat request with conversation context
 * @returns AI assistant message plus optional conversation snapshot (title sync)
 * @throws Error - If authentication fails, rate limits exceeded, or service unavailable
 */
export async function postAiEncouragement(request: AiChatRequest): Promise<{
  message: ChatMessage;
  conversation?: AiChatConversationPayload;
}> {
  try {
    // Check if user is authenticated with Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      console.error('User not authenticated with Supabase:', authError);
      throw new Error('Please log in to send messages');
    }

    // Get the session to extract access token
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No valid session found - please log in again');
    }

    console.log('Sending request to ai-chat function:', {
      conversationId: request.conversationId,
      messageLength: request.message.length,
      historyCount: request.history.length,
      userId: user.id
    });

    // Explicitly send the access token in Authorization header for debugging
    const { data, error } = await supabase.functions.invoke<AiChatResponse | AiChatError>('ai-chat', {
      body: request,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      console.error('Supabase function invoke error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      
      // Provide more helpful error messages
      if (error.message?.includes('401') || error.message?.includes('Unauthorized')) {
        throw new Error('Authentication failed. Please log in again.');
      }
      
      throw new Error(`AI service error: ${error.message || error.details || 'Unknown error'}`);
    }

    if (!data) {
      throw new Error('No response from AI service');
    }

    console.log('AI function response:', data);

    if (!data.success) {
      console.error('AI function returned error:', data.error);
      throw new Error(data.error);
    }

    console.log('Encouragement data received:', data.message.encouragement);

    if (data.conversation?.title) {
      console.log("Conversation snapshot from AI:", data.conversation.title, data.conversation.title_status);
    }

    const conversation = parseAiChatConversationPayload(data.conversation);

    // Transform the response to match your ChatMessage type
    return {
      message: {
        id: data.message.id,
        conversation_id: data.message.conversation_id,
        role: data.message.role,
        content: data.message.content,
        encouragement: coerceAssistantEncouragement(data.message.encouragement),
        created_at: data.message.created_at,
        user_id: data.message.user_id // Both user and assistant messages have user_id in your schema
      },
      conversation,
    };

  } catch (error) {
    // Enhance error messages for better UX
    const message = error instanceof Error ? error.message : 'Unexpected error';
    
    if (message.includes('Rate limit')) {
      throw new Error('You\'re sending messages too quickly. Please wait a moment and try again.');
    }
    
    if (message.includes('Authentication') || message.includes('access denied')) {
      throw new Error('Please log in again to continue chatting.');
    }
    
    if (message.includes('too long')) {
      throw new Error('Your message is too long. Please keep it under 1000 characters.');
    }
    
    if (message.includes('temporarily unavailable')) {
      throw new Error('Our AI service is temporarily unavailable. Please try again in a few minutes.');
    }

    throw new Error(message);
  }
}
