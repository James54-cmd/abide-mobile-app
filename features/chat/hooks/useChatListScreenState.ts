import type { ChatListScreenProps } from "@/features/chat/types";
import { useGetConversations, useCreateConversation } from "@/lib/api/chat/hooks";
import { useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Feature hook for chat list screen - follows SKILL.md Rule 10 (calls data hooks, not clients)
 * Composes data hooks and provides screen-specific logic and handlers.
 */
export function useChatListScreenState(): ChatListScreenProps {
  const router = useRouter();
  
  // Rule 6: Data hooks in lib/ - feature hooks call them
  const { data: conversations, loadState, errorMessage, refetch } = useGetConversations();
  const { createNew, loading: creating } = useCreateConversation();

  const onOpen = useCallback(
    (id: string) => {
      router.push(`/(tabs)/chat/${id}`);
    },
    [router]
  );

  const onNewConversation = useCallback(async () => {
    try {
      const newConversation = await createNew("New conversation");
      router.push(`/(tabs)/chat/${newConversation.id}`);
    } catch (error) {
      console.error("Failed to create conversation:", error);
      // TODO: Show user-friendly error toast
    }
  }, [createNew, router]);

  return { 
    conversations: conversations ?? [], 
    onOpen, 
    onNewConversation,
    loading: loadState === "loading" || creating,
    error: errorMessage,
    refetch
  };
}
