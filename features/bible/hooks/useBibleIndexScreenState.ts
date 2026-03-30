import type { BibleIndexScreenProps, BibleTestament } from "@/features/bible/types";
import { useBibleBookChaptersCatalog, useGetBibleBooks } from "@/lib/api/bible/hooks";
import type { Translation } from "@/types";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";

const NEW_TESTAMENT_IDS = new Set([
  "MAT",
  "MRK",
  "LUK",
  "JHN",
  "ACT",
  "ROM",
  "1CO",
  "2CO",
  "GAL",
  "EPH",
  "PHP",
  "COL",
  "1TH",
  "2TH",
  "1TI",
  "2TI",
  "TIT",
  "PHM",
  "HEB",
  "JAS",
  "1PE",
  "2PE",
  "1JN",
  "2JN",
  "3JN",
  "JUD",
  "REV",
]);

export function useBibleIndexScreenState(): BibleIndexScreenProps {
  const translation: Translation = "NIV";
  const router = useRouter();
  const { books, loadState, errorMessage, refetch } = useGetBibleBooks(translation);
  const { chaptersByBook, loadingBookId, errorMessage: chapterErrorMessage, loadBookChapters } =
    useBibleBookChaptersCatalog(translation);
  const [activeTestament, setActiveTestament] = useState<BibleTestament>("old");
  const [expandedBookId, setExpandedBookId] = useState<string | null>(null);
  const [selectedChapterByBook, setSelectedChapterByBook] = useState<Record<string, number>>({});

  const visibleBooks = useMemo(() => {
    return books.filter((book) =>
      activeTestament === "new" ? isNewTestamentBook(book.id) : !isNewTestamentBook(book.id)
    );
  }, [books, activeTestament]);

  const onOpen = useCallback(
    (book: string, chapter: number) => {
      router.push(`/(tabs)/bible/${book.toLowerCase()}/${chapter}`);
    },
    [router]
  );

  const onSelectTestament = useCallback((testament: BibleTestament) => {
    setActiveTestament(testament);
    setExpandedBookId(null);
  }, []);

  const onToggleBook = useCallback(
    (bookId: string) => {
      if (expandedBookId === bookId) {
        setExpandedBookId(null);
        return;
      }
      setExpandedBookId(bookId);
      void loadBookChapters(bookId);
    },
    [expandedBookId, loadBookChapters]
  );

  const onSelectChapter = useCallback(
    (bookId: string, chapter: number) => {
      setSelectedChapterByBook((prev) => ({ ...prev, [bookId]: chapter }));
      onOpen(bookId, chapter);
    },
    [onOpen]
  );

  return {
    books: visibleBooks,
    activeTestament,
    expandedBookId,
    selectedChapterByBook,
    chaptersByBook,
    loadingBookId,
    loadState,
    errorMessage,
    chapterErrorMessage,
    onSelectTestament,
    onToggleBook,
    onSelectChapter,
    onRetry: refetch,
    onOpen,
  };
}

function isNewTestamentBook(bookId: string): boolean {
  return NEW_TESTAMENT_IDS.has(bookId.toUpperCase());
}
