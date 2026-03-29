import { apiRequest } from "@/lib/api";
import type { Verse } from "@/types";

export async function getVerseOfTheDay(jwt?: string): Promise<Verse> {
  return apiRequest<Verse>("/api/bible/votd", { method: "GET" }, jwt);
}
