import { mergeConversationWithAiSnapshot } from "@/features/chat/utils/conversationSnapshot";
import {
  createAssistantPlaceholder,
  createOptimisticUserMessage,
  isDuplicateSendInProgress,
  replacePlaceholderMessage,
  replaceOptimisticMessage,
  updateMessageStatus,
} from "@/features/chat/utils/messageHelpers";
import { useSendMessage } from "@/lib/api/chat/hooks";
import { ChatErrorCodes, createChatError, type ChatError } from "@/lib/api/chat/errors";
import { triggerSend } from "@/lib/native/haptics";
import type { ChatMessage, Conversation } from "@/types";
import type { Dispatch, SetStateAction } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";

export interface UseChatThreadSendParams {
  conversationId: string;
  userId: string | null;
  isValidConversationId: boolean;
  serverMessages: ChatMessage[] | null | undefined;
  refetch: () => void | Promise<void>;
  conversations: Conversation[];
  upsertConversation: (c: Conversation) => void;
  optimisticMessages: ChatMessage[];
  setOptimisticMessages: Dispatch<SetStateAction<ChatMessage[]>>;
  inputText: string;
  setInputText: Dispatch<SetStateAction<string>>;
}

/**
 * Send pipeline: optimistic user row → persist → AI → store title snapshot (SKILL.md Rule 9).
 */
export function useChatThreadSend({
  conversationId,
  userId,
  isValidConversationId,
  serverMessages,
  refetch,
  conversations,
  upsertConversation,
  optimisticMessages,
  setOptimisticMessages,
  inputText,
  setInputText,
}: UseChatThreadSendParams) {
  const { sendUserMessage, sendForEncouragement, sending, error: dataHookError } = useSendMessage();
  const [sendError, setSendError] = useState<ChatError | null>(null);

  useEffect(() => {
    if (dataHookError) {
      setSendError(dataHookError);
      console.error("Send error:", dataHookError.userMessage);
    }
  }, [dataHookError]);

  const canSend = useMemo(() => {
    const trimmed = inputText.trim();
    return (
      isValidConversationId &&
      trimmed.length > 0 &&
      !sending &&
      !isDuplicateSendInProgress(optimisticMessages, trimmed)
    );
  }, [isValidConversationId, inputText, sending, optimisticMessages]);

  const onInputChange = useCallback(
    (text: string) => {
      setInputText(text);
    },
    [setInputText]
  );

  const handleSendMessage = useCallback(async () => {
    const trimmed = inputText.trim();
    if (!trimmed || !isValidConversationId || !canSend || !userId) return;

    setSendError(null);

    let optimisticUserMsg: ChatMessage | undefined;
    let assistantPlaceholder: ChatMessage | undefined;

    try {
      await triggerSend();

      optimisticUserMsg = createOptimisticUserMessage(trimmed, conversationId, userId);

      setInputText("");
      setOptimisticMessages((prev) => [...prev, optimisticUserMsg!]);

      const userResult = await sendUserMessage(conversationId, trimmed);

      if (userResult.error) {
        setOptimisticMessages((prev) =>
          updateMessageStatus(prev, optimisticUserMsg!.localId!, "failed")
        );
        setSendError(userResult.error);
        return;
      }

      setOptimisticMessages((prev) =>
        replaceOptimisticMessage(prev, optimisticUserMsg!.localId!, userResult.message!)
      );

      assistantPlaceholder = createAssistantPlaceholder(conversationId, userId);
      setOptimisticMessages((prev) => [...prev, assistantPlaceholder!]);

      const currentMessages = [...(serverMessages ?? []), userResult.message!];
      const aiResult = await sendForEncouragement(conversationId, trimmed, currentMessages);

      if (aiResult.error) {
        setOptimisticMessages((prev) =>
          updateMessageStatus(
            prev,
            assistantPlaceholder!.localId!,
            "failed",
            "Sorry, I'm unable to respond right now. Please try again."
          )
        );
        setSendError(aiResult.error);
        return;
      }

      setOptimisticMessages((prev) =>
        replacePlaceholderMessage(prev, assistantPlaceholder!.localId!, aiResult.result!.message)
      );

      const convFromAi = aiResult.result?.conversation;
      if (convFromAi?.title?.trim()) {
        const currentConv = conversations.find((c) => c.id === conversationId) ?? null;
        upsertConversation(
          mergeConversationWithAiSnapshot(currentConv, convFromAi, conversationId, userId)
        );
      }

      await refetch();
    } catch (error) {
      console.error("Unexpected send error:", error);

      const chatError = createChatError(
        ChatErrorCodes.UNKNOWN_ERROR,
        error instanceof Error ? error.message : String(error)
      );

      if (optimisticUserMsg) {
        setOptimisticMessages((prev) => {
          let updated = updateMessageStatus(prev, optimisticUserMsg!.localId!, "failed");
          if (assistantPlaceholder) {
            updated = updateMessageStatus(
              updated,
              assistantPlaceholder.localId!,
              "failed",
              "Something went wrong. Please try again."
            );
          }
          return updated;
        });
      }

      setSendError(chatError);
    }
  }, [
    inputText,
    conversationId,
    isValidConversationId,
    canSend,
    userId,
    sendUserMessage,
    sendForEncouragement,
    serverMessages,
    refetch,
    conversations,
    upsertConversation,
    setInputText,
    setOptimisticMessages,
  ]);

  return {
    sending,
    sendError,
    canSend,
    onInputChange,
    handleSendMessage,
  };
}
