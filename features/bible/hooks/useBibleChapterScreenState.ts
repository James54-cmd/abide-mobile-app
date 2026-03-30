import type { BibleChapterScreenProps } from "@/features/bible/types";
import { useGetBibleChapter } from "@/lib/api/bible/hooks";
import type { Translation } from "@/types";
import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";

function humanizeBookId(id: string): string {
  if (!id) return "Scripture";
  return id
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Composes data hook + navigation — no direct `fetch` / `getBibleChapter` here (SKILL.md).
 */
export function useBibleChapterScreenState(
  book: string,
  chapter: number,
  translation: Translation
): BibleChapterScreenProps {
  const router = useRouter();
  const { verses, loadState, errorMessage, refetch } = useGetBibleChapter(
    book,
    chapter,
    translation
  );

  const bookLabel = useMemo(() => humanizeBookId(book), [book]);

  const onBack = useCallback(() => {
    router.back();
  }, [router]);

  return {
    book,
    bookLabel,
    chapter,
    translation,
    verses,
    loadState,
    errorMessage,
    onRetry: refetch,
    onBack
  };
}
