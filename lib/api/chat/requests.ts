import { apiRequest } from "@/lib/api";
import type { ChatMessage, EncouragementResponse } from "@/types";

export async function postEncouragement(
  jwt: string,
  body: { conversationId: string; message: string; history: ChatMessage[] }
): Promise<EncouragementResponse> {
  return apiRequest<EncouragementResponse>(
    "/api/chat/encourage",
    { method: "POST", body: JSON.stringify(body) },
    jwt
  );
}
