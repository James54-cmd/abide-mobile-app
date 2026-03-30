import type { ChatMessage, Conversation } from "@/types";

export interface ChatListScreenProps {
  conversations: Conversation[];
  onOpen: (id: string) => void;
}

export interface ChatThreadScreenProps {
  conversationId: string;
  title: string;
  messages: ChatMessage[];
  onBack: () => void;
  onSendPress: () => void;
}
