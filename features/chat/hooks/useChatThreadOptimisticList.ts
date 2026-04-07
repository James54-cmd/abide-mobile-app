import {
  deduplicateMessages,
  sortMessagesByDate,
} from "@/features/chat/utils/messageHelpers";
import type { ChatMessage } from "@/types";
import { useMemo, useState } from "react";

/**
 * Smart message merge that prioritizes optimistic messages for immediate UI feedback
 * while ensuring proper chronological order. Follows SKILL.md Rule 21 (DRY) - 
 * extracted from thread state hook to eliminate duplicate merge logic.
 */
export function useChatThreadOptimisticList(serverMessages: ChatMessage[] | null | undefined) {
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

  const messages = useMemo(() => {
    // Keep optimistic rows first so placeholder ordering stays stable during realtime updates.
    const all = [...optimisticMessages, ...(serverMessages ?? [])];
    const sorted = sortMessagesByDate(all);
    return deduplicateMessages(sorted);
  }, [optimisticMessages, serverMessages]);

  return { optimisticMessages, setOptimisticMessages, messages };
}
