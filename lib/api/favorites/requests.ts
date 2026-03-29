import { apiRequest } from "@/lib/api";
import type { Verse } from "@/types";

export async function listFavorites(jwt: string): Promise<Verse[]> {
  return apiRequest<Verse[]>("/api/favorites", { method: "GET" }, jwt);
}

export async function saveFavorite(jwt: string, verse: Verse): Promise<void> {
  await apiRequest<void>("/api/favorites", { method: "POST", body: JSON.stringify(verse) }, jwt);
}
