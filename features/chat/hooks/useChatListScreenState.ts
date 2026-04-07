import type { ChatListScreenProps } from "@/features/chat/types";
import { 
  useConversationsRealtime, 
  useCreateConversation, 
  useDeleteConversation, 
  useRenameConversation 
} from "@/lib/api/chat/hooks";
import { useChatStore } from "@/store/useChatStore";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useMemo, useEffect } from "react";

/**
 * Feature hook for chat list screen - follows SKILL.md Rule 10 (calls data hooks, not clients)
 * Composes data hooks and provides screen-specific logic and handlers.
 * Enhanced with realtime conversation updates.
 */
export function useChatListScreenState(): ChatListScreenProps {
  const router = useRouter();
  
  // Enhanced chat store for shared conversation state (follows SKILL.md Rule 11)
  const { 
    conversations: storeConversations, 
    setConversations, 
    upsertConversation, 
    removeConversation 
  } = useChatStore();
  
  // Rule 6: Data hooks in lib/ - feature hooks call them (now with realtime)
  const { conversations: realtimeConversations, loading: realtimeLoading, error: realtimeError, refetch } = useConversationsRealtime();
  const { createNew, loading: creating } = useCreateConversation();
  const { deleteConversation, deleting } = useDeleteConversation();
  const { renameConversation, renaming } = useRenameConversation();

  // Sync realtime conversations to shared store
  useEffect(() => {
    if (realtimeConversations) {
      setConversations(realtimeConversations);
    }
  }, [realtimeConversations, setConversations]);

  // Refetch conversations when screen comes back into focus
  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  // Display conversations directly from shared store - no optimistic updates
  const conversationsWithOptimisticUpdates = useMemo(() => {
    return storeConversations || [];
  }, [storeConversations]);

  const onOpen = useCallback(
    (id: string) => {
      router.push(`/(tabs)/chat/${id}`);
    },
    [router]
  );

  const onNewConversation = useCallback(async () => {
    try {
      const newConversation = await createNew(); // No title needed - defaults to "New Conversation"
      
      // Immediately add to shared store so it appears in list
      upsertConversation(newConversation);
      
      router.push(`/(tabs)/chat/${newConversation.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      // TODO: Show user-friendly error toast
    }
  }, [createNew, router, upsertConversation]);

  const onDeleteConversation = useCallback(async (id: string) => {
    try {
      const result = await deleteConversation(id, () => {
        // Custom refetch that syncs to store
        refetch();
      });
      
      if (result.error) {
        console.error("Failed to delete conversation:", result.error.userMessage);
      } else if (result.success) {
        // Remove from shared store immediately for responsive UI
        removeConversation(id);
      }
    } catch (error) {
      console.error("Failed to delete conversation:", error);
    }
  }, [deleteConversation, refetch, removeConversation]);

  const onRenameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      const result = await renameConversation(id, newTitle);
      if (result.error) {
        console.error("Failed to rename conversation:", result.error.userMessage);
        return;
      }
      
      // Update shared store immediately if successful
      if (result.conversation) {
        upsertConversation(result.conversation);
      }
      
      // Refetch for any missed updates
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
    loading: realtimeLoading || creating || Boolean(deleting) || Boolean(renaming),
    deletingId: deleting, // Expose which conversation is being deleted
    renamingId: renaming, // Expose which conversation is being renamed
    error: realtimeError?.userMessage || null,
    refetch
  };
}
