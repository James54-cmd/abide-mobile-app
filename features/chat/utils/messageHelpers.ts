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

export type AssistantPlaceholderOptions = {
  /**
   * ISO timestamps for the user message(s) this reply follows.
   * Placeholder `created_at` is set strictly after the latest of these so sort order stays
   * correct when the server row has a newer time than the client clock (reflecting never jumps above the user).
   */
  afterUserTimestamps?: string[];
};

/**
 * Creates an assistant placeholder message for loading state
 */
export function createAssistantPlaceholder(
  conversationId: string,
  userId: string,
  options?: AssistantPlaceholderOptions
): ChatMessage {
  const localId = `assistant-loading-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  let createdMs = Date.now();
  const stamps = options?.afterUserTimestamps?.filter(Boolean) ?? [];
  if (stamps.length > 0) {
    const parsed = stamps.map((iso) => Date.parse(iso)).filter((n) => Number.isFinite(n));
    if (parsed.length > 0) {
      createdMs = Math.max(...parsed) + 50;
    }
  }

  return {
    id: localId,
    localId,
    conversation_id: conversationId,
    user_id: userId,
    role: "assistant",
    content: "",
    created_at: new Date(createdMs).toISOString(),
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
function dedupeContentKey(message: ChatMessage): string {
  if (
    message.role === "assistant" &&
    message.content.trim() === "" &&
    message.isPlaceholder &&
    message.localId
  ) {
    return `assistant-ph-${message.localId}-${message.conversation_id}`;
  }
  return `${message.role}-${message.content.trim()}-${message.conversation_id}`;
}

export function deduplicateMessages(messages: ChatMessage[]): ChatMessage[] {
  const seen = new Map<string, ChatMessage>();
  
  // Process in reverse order so server messages (later in array) override optimistic ones
  for (let i = messages.length - 1; i >= 0; i--) {
    const message = messages[i];
    
    const contentKey = dedupeContentKey(message);
    
    // If we haven't seen this content, or current message is from server, keep it
    if (!seen.has(contentKey) || (!message.localId && seen.get(contentKey)?.localId)) {
      seen.set(contentKey, message);
    }
  }
  
  // Return deduplicated messages in original order
  const deduplicated: ChatMessage[] = [];
  for (const message of messages) {
    const contentKey = dedupeContentKey(message);
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
const ROLE_SORT = (role: ChatMessage["role"]): number =>
  role === "user" ? 0 : role === "assistant" ? 1 : 2;

/**
 * Oldest first; same instant → user before assistant so “reflecting” never sits above its user turn.
 */
export function sortMessagesByDate(messages: ChatMessage[]): ChatMessage[] {
  return [...messages].sort((a, b) => {
    const ta = new Date(a.created_at).getTime();
    const tb = new Date(b.created_at).getTime();
    if (ta !== tb) return ta - tb;
    const ra = ROLE_SORT(a.role) - ROLE_SORT(b.role);
    if (ra !== 0) return ra;
    return String(a.localId ?? a.id).localeCompare(String(b.localId ?? b.id));
  });
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