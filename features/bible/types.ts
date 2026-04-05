import type { Translation } from "@/types";

export interface BibleBookItem {
  id: string;
  name: string;
}

export type BibleTestament = "old" | "new";

export interface BibleVerseLine {
  verse: number;
  text: string;
}

export type BibleFontSize = "small" | "medium" | "large" | "extra_large";
export type BibleFontFamily = "serif" | "sans";
export type BibleLineSpacing = "tight" | "normal" | "relaxed" | "loose";

export interface BibleReaderSettings {
  fontSize: BibleFontSize;
  fontFamily: BibleFontFamily;
  lineSpacing: BibleLineSpacing;
}

export interface BibleIndexScreenProps {
  books: BibleBookItem[];
  activeTestament: BibleTestament;
  expandedBookId: string | null;
  selectedChapterByBook: Record<string, number>;
  chaptersByBook: Record<string, number[]>;
  loadingBookId: string | null;
  loadingAllChapters: boolean;
  loadState: BibleChapterLoadState;
  errorMessage: string | null;
  chapterErrorMessage: string | null;
  onSelectTestament: (testament: BibleTestament) => void;
  onToggleBook: (bookId: string) => void;
  onSelectChapter: (bookId: string, chapter: number) => void;
  onRetry: () => void;
  onOpen: (book: string, chapter: number) => void;
}

export type BibleChapterLoadState = "loading" | "ready" | "error";

export interface BibleChapterScreenProps {
  /** Route segment (e.g. genesis) */
  book: string;
  /** Display title (e.g. Genesis) */
  bookLabel: string;
  chapter: number;
  translation: Translation;
  verses: BibleVerseLine[];
  loadState: BibleChapterLoadState;
  isFetching: boolean;
  showInitialLoader: boolean;
  errorMessage: string | null;
  onRetry: () => void;
  onBack: () => void;
  canGoPrevChapter: boolean;
  canGoNextChapter: boolean;
  onGoPrevChapter: () => void;
  onGoNextChapter: () => void;
  prevChapterLabel: string | null;
  nextChapterLabel: string | null;
  /** Update reading progress (chapter/verse) in Supabase */
  updateProgress: (verse?: number) => void;
  /** Whether the reader settings drawer is visible. */
  settingsVisible: boolean;
  onOpenSettings: () => void;
  onCloseSettings: () => void;
  availableTranslations: Translation[];
  onChangeTranslation: (translation: Translation) => void;
  settings: BibleReaderSettings;
  onChangeSettings: (next: BibleReaderSettings) => void;
  headerTitleFontFamily: string;
  verseTextStyle: {
    fontFamily: string;
    fontSize: number;
    lineHeight: number;
  };
}
