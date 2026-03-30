import type { Translation } from "@/types";

export interface BibleBookItem {
  id: string;
  name: string;
}

export interface BibleVerseLine {
  verse: number;
  text: string;
}

export interface BibleIndexScreenProps {
  books: BibleBookItem[];
  onOpen: (book: string, chapter: number) => void;
}

export interface BibleChapterScreenProps {
  /** Route segment (e.g. genesis) */
  book: string;
  /** Display title (e.g. Genesis) */
  bookLabel: string;
  chapter: number;
  translation: Translation;
  verses: BibleVerseLine[];
  onBack: () => void;
}
