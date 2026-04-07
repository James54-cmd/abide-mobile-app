import { deduplicateMessages, sortMessagesByDate } from "@/features/chat/utils/messageHelpers";
import type { ChatMessage } from "@/types";
import { useEffect, useMemo, useState } from "react";

/**
 * Merges realtime server messages with optimistic rows and prunes confirmed optimistics.
 * Extracted from thread state hook (SKILL.md Rule 9 — compose, don’t bloat).
 */
export function useChatThreadOptimisticList(serverMessages: ChatMessage[] | null | undefined) {
  const [optimisticMessages, setOptimisticMessages] = useState<ChatMessage[]>([]);

  const messages = useMemo(() => {
    const all = [...(serverMessages ?? []), ...optimisticMessages];
    return deduplicateMessages(sortMessagesByDate(all));
  }, [serverMessages, optimisticMessages]);

  useEffect(() => {
    if (!serverMessages?.length) return;

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

  return { optimisticMessages, setOptimisticMessages, messages };
}
