import { create } from "zustand";
import type { ChatMessage, Conversation } from "@/types";

interface ChatStore {
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  setConversations: (conversations: Conversation[]) => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  appendMessage: (conversationId: string, message: ChatMessage) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  messagesByConversation: {},
  setConversations: (conversations) => set({ conversations }),
  setMessages: (conversationId, messages) =>
    set((state) => ({
      messagesByConversation: { ...state.messagesByConversation, [conversationId]: messages }
    })),
  appendMessage: (conversationId, message) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: [...(state.messagesByConversation[conversationId] ?? []), message]
      }
    }))
}));
