import type { ChatMessage, Conversation } from "@/types";

export interface ChatListScreenProps {
  conversations: Conversation[];
  onOpen: (id: string) => void;
  onNewConversation: () => void;
}

export interface ChatThreadScreenProps {
  conversationId: string;
  title: string;
  messages: ChatMessage[];
  // State
  inputText: string;
  canSend: boolean;
  // Handlers  
  onBack: () => void;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onScrollToBottom: () => void;
}
