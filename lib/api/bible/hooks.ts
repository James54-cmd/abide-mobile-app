import { ApiError } from "@/lib/api";
import { getBibleBookChapters, getBibleBooks, getBibleChapter } from "@/lib/api/bible/requests";
import { useAuthStore } from "@/store/useAuthStore";
import type { Translation } from "@/types";
import { useCallback, useEffect, useState } from "react";

export type BibleChapterFetchState = "loading" | "ready" | "error";

export interface BibleVerseLineDto {
  verse: number;
  text: string;
}

export interface BibleBookDto {
  id: string;
  name: string;
}

/**
 * Data hook — owns chapter fetch + loading/error state (SKILL.md Rule 5–6).
 * Feature hooks compose this; they do not call `getBibleChapter` directly.
 */
export function useGetBibleChapter(
  book: string,
  chapter: number,
  translation: Translation
): {
  verses: BibleVerseLineDto[];
  loadState: BibleChapterFetchState;
  errorMessage: string | null;
  refetch: () => void;
} {
  const jwt = useAuthStore((s) => s.jwt);
  const [verses, setVerses] = useState<BibleVerseLineDto[]>([]);
  const [loadState, setLoadState] = useState<BibleChapterFetchState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  const refetch = useCallback(() => {
    setRetryTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;

    if (!book.trim()) {
      setVerses([]);
      setErrorMessage("Missing book.");
      setLoadState("error");
      return;
    }

    setLoadState("loading");
    setErrorMessage(null);

    void (async () => {
      try {
        const data = await getBibleChapter(book, chapter, translation, jwt ?? undefined);
        if (cancelled) return;
        setVerses(
          data.verses.map((v) => ({
            verse: v.verse,
            text: v.text
          }))
        );
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Could not load this chapter.";
        setVerses([]);
        setErrorMessage(msg);
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [book, chapter, translation, jwt, retryTick]);

  return { verses, loadState, errorMessage, refetch };
}

export function useGetBibleBooks(translation: Translation): {
  books: BibleBookDto[];
  loadState: BibleChapterFetchState;
  errorMessage: string | null;
  refetch: () => void;
} {
  const [books, setBooks] = useState<BibleBookDto[]>([]);
  const [loadState, setLoadState] = useState<BibleChapterFetchState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  const refetch = useCallback(() => {
    setRetryTick((t) => t + 1);
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoadState("loading");
    setErrorMessage(null);

    void (async () => {
      try {
        const rows = await getBibleBooks(translation);
        if (cancelled) return;
        setBooks(rows);
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Could not load books.";
        setBooks([]);
        setErrorMessage(msg);
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [translation, retryTick]);

  return { books, loadState, errorMessage, refetch };
}

export function useBibleBookChaptersCatalog(translation: Translation): {
  chaptersByBook: Record<string, number[]>;
  loadingBookId: string | null;
  errorMessage: string | null;
  loadBookChapters: (bookId: string) => Promise<void>;
} {
  const [chaptersByBook, setChaptersByBook] = useState<Record<string, number[]>>({});
  const [loadingBookId, setLoadingBookId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const loadBookChapters = useCallback(
    async (bookId: string) => {
      if (!bookId.trim() || chaptersByBook[bookId]) return;
      setLoadingBookId(bookId);
      setErrorMessage(null);
      try {
        const chapters = await getBibleBookChapters(translation, bookId);
        setChaptersByBook((prev) => ({ ...prev, [bookId]: chapters }));
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not load chapter list.";
        setErrorMessage(msg);
      } finally {
        setLoadingBookId((current) => (current === bookId ? null : current));
      }
    },
    [chaptersByBook, translation]
  );

  return { chaptersByBook, loadingBookId, errorMessage, loadBookChapters };
}
