/**
 * Standardized error types for chat functionality - follows SKILL.md Rule 14
 * API layer defines error types, propagated through data hooks to feature hooks
 */

export class ChatError extends Error {
  constructor(
    public code: string,
    public userMessage: string,
    public originalMessage?: string
  ) {
    super(originalMessage || userMessage);
    this.name = 'ChatError';
  }
}

export const ChatErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  PERMISSION_DENIED: 'PERMISSION_DENIED', 
  MESSAGE_TOO_LONG: 'MESSAGE_TOO_LONG',
  CONVERSATION_NOT_FOUND: 'CONVERSATION_NOT_FOUND',
  AI_SERVICE_ERROR: 'AI_SERVICE_ERROR',
  MESSAGE_SEND_FAILED: 'MESSAGE_SEND_FAILED',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

export type ChatErrorCode = typeof ChatErrorCodes[keyof typeof ChatErrorCodes];

/**
 * Creates user-friendly error messages based on error codes
 */
export function createChatError(
  code: ChatErrorCode, 
  originalMessage?: string
): ChatError {
  const userMessages = {
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

/**
 * Checks if an error is a ChatError instance
 */
export function isChatError(error: unknown): error is ChatError {
  return error instanceof ChatError;
}

/**
 * Converts unknown errors to ChatError instances following SKILL.md Rule 14
 */
export function normalizeChatError(error: unknown): ChatError {
  if (isChatError(error)) {
    return error;
  }

  if (error instanceof Error) {
    // Map common error patterns to specific codes
    if (error.message.toLowerCase().includes('network')) {
      return createChatError(ChatErrorCodes.NETWORK_ERROR, error.message);
    }
    if (error.message.toLowerCase().includes('permission')) {
      return createChatError(ChatErrorCodes.PERMISSION_DENIED, error.message);
    }
    if (error.message.toLowerCase().includes('not found')) {
      return createChatError(ChatErrorCodes.CONVERSATION_NOT_FOUND, error.message);
    }
    
    return createChatError(ChatErrorCodes.UNKNOWN_ERROR, error.message);
  }

  return createChatError(ChatErrorCodes.UNKNOWN_ERROR, String(error));
}