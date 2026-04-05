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
import { useBibleReaderProgressPersistence } from "@/lib/supabase/bibleReaderSettingsProgress";
import { useBibleReaderStore } from "@/store/useBibleReaderStore";
import { getReaderVerseTypographyFromSettings } from "@/features/bible/lib/readerTypography";

/**
 * Feature state hook - composes data hooks + navigation (SKILL.md Rule 5).
 * Feature hooks compose data hooks; they do not call supabase/fetch directly.
 */
export function useBibleChapterScreenState(
  book: string,
  chapter: number,
  translation: Translation
): BibleChapterScreenProps {
  const [activeTranslation, setActiveTranslation] = useState<Translation>(translation);
  const { translations: availableTranslations } = useGetBibleTranslations();
  const { books } = useGetBibleBooks(activeTranslation);
  const { verses, bookLabel: chapterBookLabel, loadState, isFetching, errorMessage, refetch } = useGetBibleChapter(
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
  
  // Use global store for settings to persist across navigation
  const { settings, setSettings } = useBibleReaderStore();
  
  // Progress persistence - only provides updateProgress function 
  const { updateProgress } = useBibleReaderProgressPersistence({
    bookId: book,
    chapter,
    translation: activeTranslation,

  });

  const applySettings = useCallback((newSettings: typeof settings) => {
    setSettings(newSettings);
    // Auto-save to Supabase when settings change (fire-and-forget)
    void updateProgress(1);
  }, [setSettings, updateProgress]);
  const verseTextStyleTokens = getReaderVerseTypographyFromSettings(settings);
  const verseTextStyle = {
    fontFamily: verseTextStyleTokens.fontFamily,
    fontSize: verseTextStyleTokens.fontSizePx,
    lineHeight: verseTextStyleTokens.lineHeightPx,
  };
  const headerTitleFontFamily = verseTextStyleTokens.fontFamily;

  const onOpenSettings = useCallback(() => setSettingsVisible(true), []);
  const onCloseSettings = useCallback(() => setSettingsVisible(false), []);

  // Show full-screen loader only when loading and no verses are visible yet
  const showInitialLoader = loadState === "loading" && verses.length === 0;

  return {
    book,
    bookLabel,
    chapter,
    translation: activeTranslation,
    verses,
    loadState,
    isFetching,
    showInitialLoader,
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
    updateProgress, // Expose progress saving for navigation
    headerTitleFontFamily,
    verseTextStyle
  };
}
