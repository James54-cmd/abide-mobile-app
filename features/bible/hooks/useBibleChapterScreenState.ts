import type { BibleChapterScreenProps, BibleVerseLine } from "@/features/bible/types";
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

function mockVerses(_chapter: number): BibleVerseLine[] {
  const line =
    "Blessed are those who hunger and thirst for righteousness, for they will be filled.";
  return Array.from({ length: 12 }, (_, i) => ({
    verse: i + 1,
    text: line,
  }));
}

export function useBibleChapterScreenState(
  book: string,
  chapter: number,
  translation: Translation
): BibleChapterScreenProps {
  const router = useRouter();

  const verses = useMemo(() => mockVerses(chapter), [chapter]);
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
    onBack,
  };
}
