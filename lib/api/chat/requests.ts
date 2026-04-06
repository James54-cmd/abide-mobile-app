import { supabase } from "@/lib/supabase";
import { SUPABASE_URL, SUPABASE_ANON_KEY } from "@/constants/config";
import type { ChatMessage } from "@/types";

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

export interface AiChatResponse {
  success: true;
  message: {
    id: string;
    conversation_id: string;
    role: 'assistant';
    content: string;
    created_at: string;
    user_id: string;
  };
}

export interface AiChatError {
  success: false;
  error: string;
}

/**
 * Send message to AI through secure Edge Function
 * 
 * @param request - Chat request with conversation context
 * @returns Promise<ChatMessage> - The AI response message
 * @throws Error - If authentication fails, rate limits exceeded, or service unavailable
 */
export async function postAiEncouragement(request: AiChatRequest): Promise<ChatMessage> {
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

    // Explicitly send the access token in Authorization header
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

    // Transform the response to match your ChatMessage type
    return {
      id: data.message.id,
      conversation_id: data.message.conversation_id,
      role: data.message.role,
      content: data.message.content,
      created_at: data.message.created_at,
      user_id: data.message.user_id // Both user and assistant messages have user_id in your schema
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

/**
 * DEBUG ONLY - Raw fetch to bypass invoke() wrapper and see actual error responses
 * 
 * Use this temporarily to debug auth failures by seeing the raw JSON response
 * instead of the wrapped FunctionsHttpError from invoke()
 */
export async function debugAiEncouragement(request: AiChatRequest) {
  console.log('DEBUG: Analyzing JWT claims...');
  
  // Get fresh session and decode JWT completely
  const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
  
  if (refreshError) {
    console.error('Failed to refresh session:', refreshError);
    throw new Error('Failed to refresh session');
  }
  
  const { session } = refreshData;
  
  if (!session?.access_token) {
    throw new Error("No active session after refresh");
  }

  // Decode JWT payload to check claims
  const jwtParts = session.access_token.split('.');
  const header = JSON.parse(atob(jwtParts[0]));
  const payload = JSON.parse(atob(jwtParts[1]));
  
  console.log('JWT Header:', header);
  console.log('JWT Payload:', {
    iss: payload.iss,
    aud: payload.aud, 
    sub: payload.sub,
    role: payload.role,
    exp: payload.exp,
    iat: payload.iat,
    email: payload.email,
    app_metadata: payload.app_metadata
  });
  
  // Check if JWT is expired
  const now = Date.now() / 1000;
  const expiresIn = payload.exp - now;
  console.log('JWT expires in:', Math.round(expiresIn / 60), 'minutes');

  const url = `${SUPABASE_URL}/functions/v1/ai-chat`;
  console.log('Making request to:', url);
  console.log('Expected aud should be:', SUPABASE_URL.replace('https://', '').replace('.supabase.co', ''));

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  const text = await res.text();

  console.log("RAW STATUS:", res.status);
  console.log("RAW BODY:", text);

  if (!res.ok) {
    throw new Error(`Function failed: ${res.status} ${text}`);
  }

  return JSON.parse(text);
}
