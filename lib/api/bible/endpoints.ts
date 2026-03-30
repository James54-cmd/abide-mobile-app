import type { Translation } from "@/types";

/** REST paths for the app backend (same origin as `API_URL`). */
export const biblePaths = {
  votd: () => "/api/bible/votd",
  chapter: (book: string, chapter: number, translation: Translation) => {
    const q = new URLSearchParams({
      book,
      chapter: String(chapter),
      translation
    });
    return `/api/bible/chapter?${q}`;
  }
} as const;
