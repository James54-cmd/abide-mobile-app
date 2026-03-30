import { ApiError } from "@/lib/api";
import {
  getAvailableTranslations,
  getBibleBookChapters,
  getBibleBooks,
  getBibleChapter,
} from "@/lib/api/bible/requests";
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

export function useGetBibleTranslations(): {
  translations: Translation[];
  loadState: BibleChapterFetchState;
  errorMessage: string | null;
  refetch: () => void;
} {
  const [translations, setTranslations] = useState<Translation[]>([]);
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
        const rows = await getAvailableTranslations();
        if (cancelled) return;
        setTranslations(rows);
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Could not load translations.";
        setTranslations([]);
        setErrorMessage(msg);
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [retryTick]);

  return { translations, loadState, errorMessage, refetch };
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
  bookLabel: string | null;
  loadState: BibleChapterFetchState;
  errorMessage: string | null;
  refetch: () => void;
} {
  const jwt = useAuthStore((s) => s.jwt);
  const [verses, setVerses] = useState<BibleVerseLineDto[]>([]);
  const [bookLabel, setBookLabel] = useState<string | null>(null);
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
      setBookLabel(null);
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
        setBookLabel(data.bookLabel ?? null);
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
        setBookLabel(null);
        setErrorMessage(msg);
        setLoadState("error");
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [book, chapter, translation, jwt, retryTick]);

  return { verses, bookLabel, loadState, errorMessage, refetch };
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
  loadingAll: boolean;
  errorMessage: string | null;
  loadBookChapters: (bookId: string) => Promise<void>;
  loadAllBookChapters: (bookIds: string[]) => Promise<void>;
} {
  const [chaptersByBook, setChaptersByBook] = useState<Record<string, number[]>>({});
  const [loadingBookId, setLoadingBookId] = useState<string | null>(null);
  const [loadingAll, setLoadingAll] = useState(false);
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

  const loadAllBookChapters = useCallback(
    async (bookIds: string[]) => {
      const uniqueMissing = Array.from(
        new Set(bookIds.filter((id) => id.trim() && !chaptersByBook[id]))
      );
      if (uniqueMissing.length === 0) return;

      setLoadingAll(true);
      setErrorMessage(null);
      try {
        const results = await Promise.all(
          uniqueMissing.map(async (bookId) => ({
            bookId,
            chapters: await getBibleBookChapters(translation, bookId),
          }))
        );
        setChaptersByBook((prev) => {
          const next = { ...prev };
          for (const row of results) next[row.bookId] = row.chapters;
          return next;
        });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Could not pre-load chapters.";
        setErrorMessage(msg);
      } finally {
        setLoadingAll(false);
      }
    },
    [chaptersByBook, translation]
  );

  return { chaptersByBook, loadingBookId, loadingAll, errorMessage, loadBookChapters, loadAllBookChapters };
}
