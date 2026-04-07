import type { ChatMessage } from "@/types";
import type { ChatThreadScreenProps } from "@/features/chat/types";
import { mergeConversationWithAiSnapshot } from "@/features/chat/utils/conversationSnapshot";
import {
  useConversationMessagesRealtime,
  useSendMessage,
  useDeleteConversation,
  useRenameConversation,
} from "@/lib/api/chat/hooks";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { triggerSend } from "@/lib/native/haptics";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState, useEffect } from "react";
import {
  createOptimisticUserMessage,
  createAssistantPlaceholder,
  replacePlaceholderMessage,
  updateMessageStatus,
  isDuplicateSendInProgress,
  sortMessagesByDate,
  deduplicateMessages,
} from "@/features/chat/utils/messageHelpers";
import {
  type ChatError,
  ChatErrorCodes,
  createChatError,
} from "@/features/chat/utils/chatErrors";

/**
 * Chat thread screen state — SKILL.md:
 * - Rules 10–11: uses `lib/api/chat` data hooks (realtime messages, send) — no direct `supabase` here.
 * - Conversation row for the header is synced via `useChatStore` so list + thread share titles.
 */
export function useChatThreadScreenState(conversationId: string): ChatThreadScreenProps {
  const router = useRouter();
  const onBack = useCallback(() => {
    router.back();
  }, [router]);
  const [inputText, setInputText] = useState("");
  const { userId } = useAuthStore();

  const { conversations, upsertConversation, removeConversation } = useChatStore();

  const isValidConversationId = Boolean(
    conversationId && conversationId !== "undefined" && conversationId.trim() !== ""
  );

  const conversation = useMemo(
    () => conversations.find((c) => c.id === conversationId) || null,
    [conversations, conversationId]
  );

  const {
    data: serverMessages,
    loadState,
    errorMessage,
    refetch,
  } = useConversationMessagesRealtime(isValidConversationId ? conversationId : "");

  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);
  const [sendError, setSendError] = useState<ChatError | null>(null);

  const { deleteConversation, deleting } = useDeleteConversation();
  const { renameConversation, renaming, getOptimisticTitle } = useRenameConversation();

  const handleDeleteConversation = useCallback(
    async (id: string) => {
      const result = await deleteConversation(id);

      if (result.success) {
        removeConversation(id);
        onBack();
      }

      return result;
    },
    [deleteConversation, removeConversation, onBack]
  );

  const handleRenameConversation = useCallback(
    async (id: string, newTitle: string) => {
      const result = await renameConversation(id, newTitle);

      if (result.conversation) {
        upsertConversation(result.conversation);
      }

      return result;
    },
    [renameConversation, upsertConversation]
  );

  const conversationWithOptimisticTitle = useMemo(() => {
    if (!conversation) return null;

    if (conversation.title_status === "generated" || conversation.title_status === "user_edited") {
      return conversation;
    }

    const optimisticTitle = getOptimisticTitle(conversation.id, conversation.title);
    return {
      ...conversation,
      title: optimisticTitle,
    };
  }, [conversation, getOptimisticTitle]);

  const { sendUserMessage, sendForEncouragement, sending, error: dataHookError } = useSendMessage();

  useEffect(() => {
    if (dataHookError) {
      setSendError(dataHookError);
      console.error("Send error:", dataHookError.userMessage);
    }
  }, [dataHookError]);

  const messages = useMemo(() => {
    const all = [...(serverMessages ?? []), ...optimisticMessages];
    const sorted = sortMessagesByDate(all);
    return deduplicateMessages(sorted);
  }, [serverMessages, optimisticMessages]);

  useEffect(() => {
    if (!serverMessages || serverMessages.length === 0) return;

    setOptimisticMessages((prev) =>
      prev.filter((optimistic) => {
        if (
          optimistic.status === "loading" ||
          optimistic.status === "sending" ||
          optimistic.status === "failed"
        ) {
          return true;
        }
        const hasServerVersion = serverMessages.some(
          (server) =>
            server.content.trim() === optimistic.content.trim() && server.role === optimistic.role
        );
        return !hasServerVersion;
      })
    );
  }, [serverMessages]);

  const canSend = useMemo(() => {
    const trimmed = inputText.trim();
    return (
      isValidConversationId &&
      trimmed.length > 0 &&
      !sending &&
      !isDuplicateSendInProgress(optimisticMessages, trimmed)
    );
  }, [isValidConversationId, inputText, sending, optimisticMessages]);

  const onInputChange = useCallback((text: string) => {
    setInputText(text);
  }, []);

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
        updateMessageStatus(prev, optimisticUserMsg!.localId!, "sent")
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

      refetch();
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
  ]);

  const onScrollToBottom = useCallback(() => {
    // FlatList scroll handled in screen
  }, []);

  return {
    conversationId,
    conversation: conversationWithOptimisticTitle,
    messages,
    loading: loadState === "loading",
    error: isValidConversationId ? errorMessage : "Invalid conversation ID",
    inputText,
    canSend,
    sending,
    sendError: sendError?.userMessage || null,
    isDeleting: deleting === conversationId,
    isRenaming: renaming === conversationId,
    onBack,
    onInputChange,
    onSend: handleSendMessage,
    onScrollToBottom,
    onDeleteConversation: handleDeleteConversation,
    onRenameConversation: handleRenameConversation,
    refetch,
  };
}
