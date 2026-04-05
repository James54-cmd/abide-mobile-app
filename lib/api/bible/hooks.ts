import { ApiError } from "@/lib/api";
import {
  getAvailableTranslations,
  getBibleBookChapters,
  getBibleBooks,
  getBibleChapter,
} from "@/lib/api/bible/requests";
import { useApiRequest } from "@/lib/api/hooks/useApiRequest";
import { useAuthStore } from "@/store/useAuthStore";
import type { Translation } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

export type BibleChapterFetchState = "loading" | "ready" | "error";

export interface BibleVerseLineDto {
  verse: number;
  text: string;
}

export interface BibleBookDto {
  id: string;
  name: string;
}

export function useGetBibleTranslations() {
  const { data: translations, loadState, errorMessage, refetch } = useApiRequest(
    getAvailableTranslations,
    [],
    "Could not load translations.",
    []
  );

  return { translations: translations ?? [], loadState, errorMessage, refetch };
}

/**
 * Data hook — owns chapter fetch + loading/error state (SKILL.md Rule 6).
 * Feature hooks compose this; they do not call `getBibleChapter` directly (Rule 5).
 */
type CachedBibleChapter = {
  verses: BibleVerseLineDto[];
  bookLabel: string | null;
};

function getChapterCacheKey(book: string, chapter: number, translation: Translation): string {
  return `${translation}::${book.trim().toLowerCase()}::${chapter}`;
}

export function useGetBibleChapter(
  book: string,
  chapter: number,
  translation: Translation
): {
  verses: BibleVerseLineDto[];
  bookLabel: string | null;
  loadState: BibleChapterFetchState;
  isFetching: boolean;
  errorMessage: string | null;
  refetch: () => void;
} {
  const jwt = useAuthStore((s) => s.jwt);

  const [verses, setVerses] = useState<BibleVerseLineDto[]>([]);
  const [bookLabel, setBookLabel] = useState<string | null>(null);
  const [loadState, setLoadState] = useState<BibleChapterFetchState>("loading");
  const [isFetching, setIsFetching] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [retryTick, setRetryTick] = useState(0);

  const cacheRef = useRef<Record<string, CachedBibleChapter>>({});
  const activeRequestIdRef = useRef(0);
  const hasDataRef = useRef(false);

  const refetch = useCallback(() => {
    const key = getChapterCacheKey(book, chapter, translation);
    delete cacheRef.current[key];
    setRetryTick((t) => t + 1);
  }, [book, chapter, translation]);

  useEffect(() => {
    const trimmedBook = book.trim();

    if (!trimmedBook) {
      setVerses([]);
      setBookLabel(null);
      setErrorMessage("Missing book.");
      setLoadState("error");
      setIsFetching(false);
      hasDataRef.current = false;
      return;
    }

    const cacheKey = getChapterCacheKey(trimmedBook, chapter, translation);
    const cached = cacheRef.current[cacheKey];
    const hasVisibleData = hasDataRef.current;

    if (cached) {
      setVerses(cached.verses);
      setBookLabel(cached.bookLabel);
      setErrorMessage(null);
      setLoadState("ready");
      setIsFetching(false);
      hasDataRef.current = cached.verses.length > 0;
      return;
    }

    const requestId = ++activeRequestIdRef.current;
    let cancelled = false;
    if (!hasVisibleData) {
      setLoadState("loading");
    }
    setIsFetching(true);
    setErrorMessage(null);

    const loadChapter = async () => {
      try {
        const data = await getBibleChapter(trimmedBook, chapter, translation, jwt ?? undefined);
        if (cancelled || activeRequestIdRef.current !== requestId) return;

        const nextData: CachedBibleChapter = {
          verses: data.verses.map((v) => ({
            verse: v.verse,
            text: v.text,
          })),
          bookLabel: data.bookLabel ?? null,
        };

        cacheRef.current[cacheKey] = nextData;

        setVerses(nextData.verses);
        setBookLabel(nextData.bookLabel);
        setErrorMessage(null);
        setLoadState("ready");
        setIsFetching(false);
        hasDataRef.current = nextData.verses.length > 0;

        // Optional warm prefetch of next chapter can be added here later
      } catch (e) {
        if (cancelled || activeRequestIdRef.current !== requestId) return;

        const msg =
          e instanceof ApiError
            ? e.message
            : e instanceof Error
              ? e.message
              : "Could not load this chapter.";

        if (!hasVisibleData) {
          setVerses([]);
          setBookLabel(null);
          setLoadState("error");
          hasDataRef.current = false;
        } else {
          setLoadState("ready");
        }

        setErrorMessage(msg);
        setIsFetching(false);
      }
    };

    loadChapter();

    return () => {
      cancelled = true;
    };
  }, [book, chapter, translation, jwt, retryTick]);

  return { verses, bookLabel, loadState, isFetching, errorMessage, refetch };
}

export function useGetBibleBooks(translation: Translation) {
  const { data: books, loadState, errorMessage, refetch } = useApiRequest(
    () => getBibleBooks(translation),
    [translation],
    "Could not load books.",
    []
  );

  return { books: books ?? [], loadState, errorMessage, refetch };
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
