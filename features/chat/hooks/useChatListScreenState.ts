import type { ChatListScreenProps } from "@/features/chat/types";
import { 
  useConversationsRealtime, 
  useCreateConversation, 
  useDeleteConversation, 
  useRenameConversation 
} from "@/lib/api/chat/hooks";
import { useRouter } from "expo-router";
import { useCallback } from "react";

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
  const { deleteConversation, loading: deleting } = useDeleteConversation();
  const { renameConversation, loading: renaming } = useRenameConversation();

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
      await deleteConversation(id);
      // Refetch to update the list after deletion
      refetch();
    } catch (error) {
      console.error("Failed to delete conversation:", error);
      // TODO: Show user-friendly error toast
    }
  }, [deleteConversation, refetch]);

  const onRenameConversation = useCallback(async (id: string, newTitle: string) => {
    try {
      await renameConversation(id, newTitle);
      // The realtime subscription should handle the update automatically
    } catch (error) {
      console.error("Failed to rename conversation:", error);
      // TODO: Show user-friendly error toast
    }
  }, [renameConversation]);

  return { 
    conversations: conversations ?? [], 
    onOpen, 
    onNewConversation,
    onDeleteConversation,
    onRenameConversation,
    loading: realtimeLoading || creating || deleting || renaming,
    error: realtimeError?.userMessage || null,
    refetch
  };
}
