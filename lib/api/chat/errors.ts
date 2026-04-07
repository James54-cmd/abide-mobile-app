/**
 * Chat error types and normalizers — lib/api layer (SKILL.md Rule 14).
 * Lives under `lib/` so data hooks never import `features/`.
 */

export class ChatError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
    public originalMessage?: string
  ) {
    super(originalMessage || userMessage);
    this.name = "ChatError";
  }
}

export const ChatErrorCodes = {
  NETWORK_ERROR: "NETWORK_ERROR",
  PERMISSION_DENIED: "PERMISSION_DENIED",
  MESSAGE_TOO_LONG: "MESSAGE_TOO_LONG",
  CONVERSATION_NOT_FOUND: "CONVERSATION_NOT_FOUND",
  AI_SERVICE_ERROR: "AI_SERVICE_ERROR",
  MESSAGE_SEND_FAILED: "MESSAGE_SEND_FAILED",
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

export type ChatErrorCode = (typeof ChatErrorCodes)[keyof typeof ChatErrorCodes];

export function createChatError(code: ChatErrorCode, originalMessage?: string): ChatError {
  const userMessages: Record<ChatErrorCode, string> = {
    [ChatErrorCodes.NETWORK_ERROR]: "Please check your internet connection and try again.",
    [ChatErrorCodes.PERMISSION_DENIED]: "You don't have permission to access this conversation.",
    [ChatErrorCodes.MESSAGE_TOO_LONG]: "Your message is too long. Please shorten it and try again.",
    [ChatErrorCodes.CONVERSATION_NOT_FOUND]: "This conversation could not be found.",
    [ChatErrorCodes.AI_SERVICE_ERROR]: "AI service is temporarily unavailable. Please try again.",
    [ChatErrorCodes.MESSAGE_SEND_FAILED]: "Failed to send message. Please try again.",
    [ChatErrorCodes.UNKNOWN_ERROR]: "Something went wrong. Please try again.",
  };

  return new ChatError(code, userMessages[code], originalMessage);
}

export function isChatError(error: unknown): error is ChatError {
  return error instanceof ChatError;
}

export function normalizeChatError(error: unknown): ChatError {
  if (isChatError(error)) {
    return error;
  }

  if (error instanceof Error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("network")) {
      return createChatError(ChatErrorCodes.NETWORK_ERROR, error.message);
    }
    if (msg.includes("permission")) {
      return createChatError(ChatErrorCodes.PERMISSION_DENIED, error.message);
    }
    if (msg.includes("not found")) {
      return createChatError(ChatErrorCodes.CONVERSATION_NOT_FOUND, error.message);
    }

    return createChatError(ChatErrorCodes.UNKNOWN_ERROR, error.message);
  }

  return createChatError(ChatErrorCodes.UNKNOWN_ERROR, String(error));
}
