import { apiRequest } from "@/lib/api";
import type { ChatMessage, Conversation } from "@/types";

export async function getConversations(jwt: string): Promise<Conversation[]> {
  return apiRequest<Conversation[]>("/api/conversations", { method: "GET" }, jwt);
}

export async function getConversationMessages(jwt: string, id: string): Promise<ChatMessage[]> {
  return apiRequest<ChatMessage[]>(`/api/conversations/${id}`, { method: "GET" }, jwt);
}

export async function createConversation(jwt: string, title: string): Promise<Conversation> {
  return apiRequest<Conversation>(
    "/api/conversations", 
    { 
      method: "POST", 
      body: JSON.stringify({ title }) 
    }, 
    jwt
  );
}

export async function sendChatMessage(
  jwt: string, 
  conversationId: string, 
  content: string
): Promise<ChatMessage> {
  return apiRequest<ChatMessage>(
    `/api/conversations/${conversationId}/messages`, 
    { 
      method: "POST", 
      body: JSON.stringify({ content }) 
    }, 
    jwt
  );
}
