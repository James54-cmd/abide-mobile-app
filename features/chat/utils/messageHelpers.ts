import { ChatMessage, MessageStatus } from "../../../types";

/**
 * Message utilities for optimistic updates and smooth chat UX
 */

/**
 * Creates an optimistic user message that appears immediately
 */
export function createOptimisticUserMessage(
  content: string,
  conversationId: string,
  userId: string
): ChatMessage {
  const localId = `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: localId, // Use localId as id for optimistic messages
    localId,
    conversation_id: conversationId,
    user_id: userId,
    role: "user",
    content: content.trim(),
    created_at: new Date().toISOString(),
    status: "sending",
  };
}

/**
 * Creates an assistant placeholder message for loading state
 */
export function createAssistantPlaceholder(
  conversationId: string,
  userId: string
): ChatMessage {
  const localId = `assistant-loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: localId,
    localId,
    conversation_id: conversationId,
    user_id: userId,
    role: "assistant",
    content: "",
    created_at: new Date().toISOString(),
    status: "loading",
    isPlaceholder: true,
  };
}

/**
 * Updates the status of a message by localId or id
 */
export function updateMessageStatus(
  messages: ChatMessage[],
  messageId: string,
  status: MessageStatus,
  newContent?: string
): ChatMessage[] {
  return messages.map((msg) => {
    const matches = msg.localId === messageId || msg.id === messageId;
    if (!matches) return msg;

    const updated: ChatMessage = {
      ...msg,
      status,
    };

    // Update content if provided (useful for replacing placeholder)
    if (newContent !== undefined) {
      updated.content = newContent;
    }

    return updated;
  });
}

/**
 * Replaces a placeholder message with the actual server response
 */
export function replacePlaceholderMessage(
  messages: ChatMessage[],
  placeholderId: string,
  serverMessage: ChatMessage
): ChatMessage[] {
  return messages.map((msg) => {
    const matches = msg.localId === placeholderId || msg.id === placeholderId;
    if (!matches) return msg;

    // Replace placeholder with server message, keeping some client state
    return {
      ...serverMessage,
      status: "sent",
      isPlaceholder: false,
    };
  });
}

/**
 * Removes messages with specific localIds (useful for error cleanup)
 */
export function removeMessagesByLocalId(
  messages: ChatMessage[],
  localIdsToRemove: string[]
): ChatMessage[] {
  return messages.filter((msg) => 
    !msg.localId || !localIdsToRemove.includes(msg.localId)
  );
}

/**
 * Checks if the exact same message content is currently being sent
 * Prevents duplicate sends of identical messages
 */
export function isDuplicateSendInProgress(
  messages: ChatMessage[],
  content: string
): boolean {
  const trimmedContent = content.trim();
  if (!trimmedContent) return false;

  return messages.some((msg) => 
    msg.role === "user" && 
    msg.content === trimmedContent && 
    msg.status === "sending"
  );
}

/**
 * Gets a stable key for FlatList keyExtractor
 * Prioritizes localId for optimistic messages, but ensures uniqueness for server messages
 */
export function getMessageKey(message: ChatMessage): string {
  if (message.localId) {
    return `local-${message.localId}`;
  }
  
  // For server messages, use server- prefix to avoid collisions
  return `server-${String(message.id)}`;
}

/**
 * Deduplicates messages to prevent showing the same content twice
 * Prioritizes server messages over optimistic messages when content matches
 */
export function deduplicateMessages(messages: ChatMessage[]): ChatMessage[] {
  const seen = new Map<string, ChatMessage>();
  
  // Process in reverse order so server messages (later in array) override optimistic ones
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    
    // Create a content-based key for deduplication
    const contentKey = `${message.role}-${message.content.trim()}-${message.conversation_id}`;
    
    // If we haven't seen this content, or current message is from server, keep it
    if (!seen.has(contentKey) || (!message.localId && seen.get(contentKey)?.localId)) {
      seen.set(contentKey, message);
    }
  }
  
  // Return deduplicated messages in original order
  const deduplicated: ChatMessage[] = [];
  for (const message of messages) {
    const contentKey = `${message.role}-${message.content.trim()}-${message.conversation_id}`;
    if (seen.get(contentKey) === message) {
      deduplicated.push(message);
    }
  }
  
  return deduplicated;
}

/**
 * Sorts messages by creation date (ascending - oldest first)
 * Ensures consistent ordering even if server returns unsorted data
 */
export function sortMessagesByDate(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
}

/**
 * Checks if a message has failed status
 */
export function isMessageFailed(message: ChatMessage): boolean {
  return message.status === "failed";
}

/**
 * Checks if a message is currently sending
 */
export function isMessageSending(message: ChatMessage): boolean {
  return message.status === "sending";
}

/**
 * Checks if a message is a loading placeholder
 */
export function isLoadingPlaceholder(message: ChatMessage): boolean {
  return message.status === "loading" && message.isPlaceholder === true;
}