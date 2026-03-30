/**
 * Expected JSON from `GET /api/bible/chapter`.
 * Align your backend response to this shape, or extend the mapper in `requests.ts`.
 */
export interface BibleChapterVerseDto {
  verse: number;
  text: string;
}

export interface BibleChapterApiResponse {
  chapter: number;
  translation: string;
  bookLabel?: string;
  verses: BibleChapterVerseDto[];
}

export interface ApiBibleChapterResponse {
  data?: {
    id?: string;
    bibleId?: string;
    number?: string;
    reference?: string;
    content?: string;
  };
}

export interface BibleApiBookDto {
  id: string;
  name: string;
}
