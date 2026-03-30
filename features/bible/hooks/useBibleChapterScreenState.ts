import type { BibleChapterScreenProps } from "@/features/bible/types";
import {
  useBibleBookChaptersCatalog,
  useGetBibleBooks,
  useGetBibleChapter,
  useGetBibleTranslations,
} from "@/lib/api/bible/hooks";
import { useBibleChapterNavigation } from "@/features/bible/hooks/useBibleChapterNavigation";
import type { Translation } from "@/types";
import { useCallback, useState } from "react";
import { useBibleReaderSettingsProgress } from "@/lib/supabase/bibleReaderSettingsProgress";
import { getReaderVerseTypographyFromSettings } from "@/features/bible/lib/readerTypography";

/**
 * Composes data hook + navigation — no direct `fetch` / `getBibleChapter` here (SKILL.md).
 */
export function useBibleChapterScreenState(
  book: string,
  chapter: number,
  translation: Translation
): BibleChapterScreenProps {
  const [activeTranslation, setActiveTranslation] = useState<Translation>(translation);
  const { translations: availableTranslations } = useGetBibleTranslations();
  const { books } = useGetBibleBooks(activeTranslation);
  const { verses, bookLabel: chapterBookLabel, loadState, errorMessage, refetch } = useGetBibleChapter(
    book,
    chapter,
    activeTranslation
  );
  const { chaptersByBook, loadBookChapters } = useBibleBookChaptersCatalog(activeTranslation);
  const {
    bookLabel,
    canGoPrevChapter,
    canGoNextChapter,
    prevChapterLabel,
    nextChapterLabel,
    onBack,
    onGoPrevChapter,
    onGoNextChapter,
  } = useBibleChapterNavigation({
    book,
    chapter,
    books,
    chapterBookLabel,
    chaptersByBook,
    loadBookChapters,
  });

  const [settingsVisible, setSettingsVisible] = useState(false);
  const { settings, applySettings } = useBibleReaderSettingsProgress({
    bookId: book,
    chapter,
    translation: activeTranslation,
  });
  const verseTextStyleTokens = getReaderVerseTypographyFromSettings(settings);
  const verseTextStyle = {
    fontFamily: verseTextStyleTokens.fontFamily,
    fontSize: verseTextStyleTokens.fontSizePx,
    lineHeight: verseTextStyleTokens.lineHeightPx,
  };
  const headerTitleFontFamily = verseTextStyleTokens.fontFamily;

  const onOpenSettings = useCallback(() => setSettingsVisible(true), []);
  const onCloseSettings = useCallback(() => setSettingsVisible(false), []);

  return {
    book,
    bookLabel,
    chapter,
    translation: activeTranslation,
    verses,
    loadState,
    errorMessage,
    onRetry: refetch,
    onBack,
    canGoPrevChapter,
    canGoNextChapter,
    onGoPrevChapter,
    onGoNextChapter,
    prevChapterLabel,
    nextChapterLabel,
    settingsVisible,
    onOpenSettings,
    onCloseSettings,
    availableTranslations,
    onChangeTranslation: setActiveTranslation,
    settings,
    onChangeSettings: applySettings,
    headerTitleFontFamily,
    verseTextStyle
  };
}
