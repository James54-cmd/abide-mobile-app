import { create } from "zustand";
import type { ChatMessage, Conversation } from "@/types";

interface ChatStore {
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  setConversations: (conversations: Conversation[]) => void;
  upsertConversation: (conversation: Conversation) => void;
  removeConversation: (conversationId: string) => void;
  clearConversations: () => void;
  setMessages: (conversationId: string, messages: ChatMessage[]) => void;
  appendMessage: (conversationId: string, message: ChatMessage) => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  conversations: [],
  messagesByConversation: {},
  
  setConversations: (conversations) => set({ conversations }),
  
  upsertConversation: (conversation) =>
    set((state) => {
      const index = state.conversations.findIndex((c) => c.id === conversation.id);

      if (index === -1) {
        return {
          conversations: [conversation, ...state.conversations].sort(
            (a, b) =>
              new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
          ),
        };
      }

      const updated = [...state.conversations];
      updated[index] = {
        ...updated[index],
        ...conversation,
      };

      updated.sort(
        (a, b) =>
          new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      );

      return { conversations: updated };
    }),

  removeConversation: (conversationId) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== conversationId),
      messagesByConversation: Object.fromEntries(
        Object.entries(state.messagesByConversation).filter(([id]) => id !== conversationId)
      ),
    })),

  clearConversations: () => set({ conversations: [], messagesByConversation: {} }),
  
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
