import type { ChatThreadScreenProps } from "@/features/chat/types";
import { useChatThreadOptimisticList } from "@/features/chat/hooks/useChatThreadOptimisticList";
import { useChatThreadSend } from "@/features/chat/hooks/useChatThreadSend";
import {
  useConversationMessagesRealtime,
  useDeleteConversation,
  useRenameConversation,
} from "@/lib/api/chat/hooks";
import { useAuthStore } from "@/store/useAuthStore";
import { useChatStore } from "@/store/useChatStore";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

/**
 * Chat thread screen state — SKILL.md:
 * - Rules 10–11: data via `lib/api/chat` hooks only (no direct `supabase` here).
 * - Rule 9: composed from `useChatThreadOptimisticList` + `useChatThreadSend`.
 * - Conversation header row: `useChatStore` (cross-screen title sync; Rule 11).
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

  const { optimisticMessages, setOptimisticMessages, messages } =
    useChatThreadOptimisticList(serverMessages);

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

  const {
    sending,
    sendError,
    canSend,
    onInputChange,
    handleSendMessage,
  } = useChatThreadSend({
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
  });

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
