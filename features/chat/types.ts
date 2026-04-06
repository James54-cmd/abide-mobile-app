import type { ChatMessage, Conversation } from "@/types";

export interface ChatListScreenProps {
  conversations: Conversation[];
  loading: boolean;
  error: string | null;
  onOpen: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  refetch: () => void;
}

export interface ChatThreadScreenProps {
  conversationId: string;
  conversation: Conversation | null;
  messages: ChatMessage[];
  loading: boolean;
  error: string | null;
  // State
  inputText: string;
  canSend: boolean;
  sending: boolean;
  sendError: string | null; // User-friendly error message for send failures (SKILL.md Rule 14)
  // Handlers  
  onBack: () => void;
  onInputChange: (text: string) => void;
  onSend: () => void;
  onScrollToBottom: () => void;
  onDeleteConversation: () => void;
  onRenameConversation: (newTitle: string) => void;
  refetch: () => void;
}

