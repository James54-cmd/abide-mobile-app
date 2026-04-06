import type { ChatListScreenProps } from "@/features/chat/types";
import { 
  useConversationsRealtime, 
  useCreateConversation, 
  useDeleteConversation, 
  useRenameConversation 
} from "@/lib/api/chat/hooks";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo } from "react";

/**
 * Feature hook for chat list screen - follows SKILL.md Rule 10 (calls data hooks, not clients)
 * Composes data hooks and provides screen-specific logic and handlers.
 * Enhanced with realtime conversation updates.
 */
export function useChatListScreenState(): ChatListScreenProps {
  const router = useRouter();
  
  // Rule 6: Data hooks in lib/ - feature hooks call them (now with realtime)
  const { conversations, loading: realtimeLoading, error: realtimeError, refetch } = useConversationsRealtime();
  const { createNew, loading: creating } = useCreateConversation();
  const { deleteConversation, deleting } = useDeleteConversation();
  const { renameConversation, renaming, getOptimisticTitle } = useRenameConversation();

  // Refetch conversations when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Apply optimistic updates to conversation titles
  const conversationsWithOptimisticUpdates = useMemo(() => {
    if (!conversations) return [];
    return conversations.map(conv => ({
      ...conv,
      title: getOptimisticTitle(conv.id, conv.title)
    }));
  }, [conversations, getOptimisticTitle]);

  const onOpen = useCallback(
    (id: string) => {
      router.push(`/(tabs)/chat/${id}`);
    },
    [router]
  );

  const onNewConversation = useCallback(async () => {
    try {
      const newConversation = await createNew(); // No title needed - defaults to "New Conversation"
      router.push(`/(tabs)/chat/${newConversation.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      // TODO: Show user-friendly error toast
    }
  }, [createNew, router]);

  const onDeleteConversation = useCallback(async (id: string) => {
    try {
      const result = await deleteConversation(id, refetch);
      if (result.error) {
        console.error("Failed to delete conversation:", result.error.userMessage);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }, [deleteConversation, refetch]);

  const onRenameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      const result = await renameConversation(id, newTitle);
      if (result.error) {
        console.error("Failed to rename conversation:", result.error.userMessage);
        return;
      }
      
      // Refetch immediately after successful rename for consistent state
      refetch();
    } catch (error) {
      console.error("Failed to rename conversation:", error);
    }
  }, [renameConversation, refetch]);

  return { 
    conversations: conversationsWithOptimisticUpdates, 
    onOpen, 
    onNewConversation,
    onDeleteConversation,
    onRenameConversation,
    loading: realtimeLoading || creating || deleting || renaming,
    deletingId: deleting, // Expose which conversation is being deleted
    renamingId: renaming, // Expose which conversation is being renamed
    error: realtimeError?.userMessage || null,
    refetch
  };
}
