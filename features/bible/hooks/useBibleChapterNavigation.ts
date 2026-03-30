import type { BibleBookItem } from "@/features/bible/types";
import {
  buildBibleChapterPath,
  humanizeBibleBookId,
  normalizeBibleBookId,
} from "@/features/bible/utils/chapterRoute";
import { useRouter, type Href } from "expo-router";
import { useCallback, useEffect, useMemo } from "react";

export interface UseBibleChapterNavigationInput {
  book: string;
  chapter: number;
  books: BibleBookItem[];
  chapterBookLabel?: string | null;
  chaptersByBook: Record<string, number[]>;
  loadBookChapters: (bookId: string) => Promise<void>;
}

export interface UseBibleChapterNavigationResult {
  bookLabel: string;
  canGoPrevChapter: boolean;
  canGoNextChapter: boolean;
  prevChapterLabel: string | null;
  nextChapterLabel: string | null;
  onBack: () => void;
  onGoPrevChapter: () => void;
  onGoNextChapter: () => void;
}

export function useBibleChapterNavigation({
  book,
  chapter,
  books,
  chapterBookLabel,
  chaptersByBook,
  loadBookChapters,
}: UseBibleChapterNavigationInput): UseBibleChapterNavigationResult {
  const router = useRouter();

  const bookLabel = useMemo(() => humanizeBibleBookId(book), [book]);
  const currentBookId = useMemo(() => normalizeBibleBookId(book), [book]);
  const currentBookIndex = useMemo(
    () => books.findIndex((b) => b.id.toUpperCase() === currentBookId),
    [books, currentBookId]
  );
  const prevBookId = currentBookIndex > 0 ? books[currentBookIndex - 1]?.id.toUpperCase() : null;
  const nextBookId =
    currentBookIndex >= 0 && currentBookIndex < books.length - 1
      ? books[currentBookIndex + 1]?.id.toUpperCase()
      : null;

  useEffect(() => {
    if (currentBookId) void loadBookChapters(currentBookId);
    if (prevBookId) void loadBookChapters(prevBookId);
    if (nextBookId) void loadBookChapters(nextBookId);
  }, [currentBookId, prevBookId, nextBookId, loadBookChapters]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  const currentBookChapters = chaptersByBook[currentBookId] ?? [];
  const currentMaxChapter = currentBookChapters.length > 0 ? currentBookChapters[currentBookChapters.length - 1] : null;
  const prevBookLastChapter =
    prevBookId && (chaptersByBook[prevBookId]?.length ?? 0) > 0
      ? chaptersByBook[prevBookId][chaptersByBook[prevBookId].length - 1]
      : null;

  const canGoPrevChapter = chapter > 1 || (chapter === 1 && !!prevBookLastChapter);
  const canGoNextChapter =
    currentMaxChapter !== null && (chapter < currentMaxChapter || (chapter === currentMaxChapter && !!nextBookId));
  const currentBookLabel = useMemo(
    () => chapterBookLabel ?? books.find((b) => b.id.toUpperCase() === currentBookId)?.name ?? bookLabel,
    [chapterBookLabel, books, currentBookId, bookLabel]
  );

  const prevChapterLabel = useMemo(() => {
    if (!canGoPrevChapter) return null;
    if (chapter > 1) return `${currentBookLabel} ${chapter - 1}`;
    if (chapter === 1 && prevBookId && prevBookLastChapter) {
      const prevBookLabel = books.find((b) => b.id.toUpperCase() === prevBookId)?.name ?? prevBookId;
      return `${prevBookLabel} ${prevBookLastChapter}`;
    }
    return null;
  }, [books, canGoPrevChapter, chapter, currentBookLabel, prevBookId, prevBookLastChapter]);

  const nextChapterLabel = useMemo(() => {
    if (!canGoNextChapter) return null;
    if (currentMaxChapter !== null && chapter < currentMaxChapter) return `${currentBookLabel} ${chapter + 1}`;
    if (currentMaxChapter !== null && chapter === currentMaxChapter && nextBookId) {
      const nextBookLabel = books.find((b) => b.id.toUpperCase() === nextBookId)?.name ?? nextBookId;
      return `${nextBookLabel} 1`;
    }
    return null;
  }, [books, canGoNextChapter, chapter, currentBookLabel, currentMaxChapter, nextBookId]);

  const toChapterRoute = useCallback(
    (bookId: string, nextChapter: number, direction: "forward" | "backward"): Href => {
      return buildBibleChapterPath(bookId, nextChapter, direction) as Href;
    },
    []
  );

  const onGoPrevChapter = useCallback(() => {
    if (chapter > 1) {
      router.replace(toChapterRoute(currentBookId, chapter - 1, "backward"));
      return;
    }
    if (chapter === 1 && prevBookId && prevBookLastChapter) {
      router.replace(toChapterRoute(prevBookId, prevBookLastChapter, "backward"));
    }
  }, [chapter, currentBookId, prevBookId, prevBookLastChapter, router, toChapterRoute]);

  const onGoNextChapter = useCallback(() => {
    if (currentMaxChapter === null) return;
    if (chapter < currentMaxChapter) {
      router.replace(toChapterRoute(currentBookId, chapter + 1, "forward"));
      return;
    }
    if (chapter === currentMaxChapter && nextBookId) {
      router.replace(toChapterRoute(nextBookId, 1, "forward"));
    }
  }, [chapter, currentBookId, currentMaxChapter, nextBookId, router, toChapterRoute]);

  return {
    bookLabel: currentBookLabel,
    canGoPrevChapter,
    canGoNextChapter,
    prevChapterLabel,
    nextChapterLabel,
    onBack,
    onGoPrevChapter,
    onGoNextChapter,
  };
}
