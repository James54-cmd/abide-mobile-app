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

export interface BibleIndexScreenProps {
  books: BibleBookItem[];
  activeTestament: BibleTestament;
  expandedBookId: string | null;
  selectedChapterByBook: Record<string, number>;
  chaptersByBook: Record<string, number[]>;
  loadingBookId: string | null;
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
  errorMessage: string | null;
  onRetry: () => void;
  onBack: () => void;
}
