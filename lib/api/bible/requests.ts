import { apiRequest } from "@/lib/api";
import {
  API_BIBLE_BASE_URL,
  API_BIBLE_ID_NIV,
  API_BIBLE_ID_NLT,
  API_BIBLE_KEY,
  API_URL,
} from "@/constants/config";
import { biblePaths } from "@/lib/api/bible/endpoints";
import type {
  ApiBibleChapterResponse,
  BibleApiBookDto,
  BibleChapterApiResponse,
  BibleChapterVerseDto,
} from "@/lib/api/bible/types";
import type { Translation, Verse } from "@/types";

export async function getVerseOfTheDay(jwt?: string): Promise<Verse> {
  return apiRequest<Verse>(biblePaths.votd(), { method: "GET" }, jwt);
}

export async function getBibleBooks(translation: Translation): Promise<BibleApiBookDto[]> {
  const base = normalizeBaseUrl(API_BIBLE_BASE_URL);
  const bibleId = translation === "NLT" ? API_BIBLE_ID_NLT : API_BIBLE_ID_NIV;
  if (!base || !API_BIBLE_KEY || !bibleId) {
    throw new Error("Missing api.bible config for books list.");
  }

  const url = `${base}/v1/bibles/${bibleId}/books`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": API_BIBLE_KEY,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await safeText(response);
    throw new Error(`Books request failed (${response.status}): ${body || "no body"}`);
  }

  const raw = (await response.json()) as {
    data?: Array<{ id?: string; name?: string; nameLong?: string; abbreviation?: string }>;
  };
  if (!Array.isArray(raw?.data)) return [];

  return raw.data
    .map((b) => ({
      id: typeof b.id === "string" ? b.id : "",
      name:
        typeof b.nameLong === "string" && b.nameLong.trim()
          ? b.nameLong
          : typeof b.name === "string"
            ? b.name
            : "",
    }))
    .filter((b) => b.id && b.name);
}

export async function getBibleBookChapters(
  translation: Translation,
  bookId: string
): Promise<number[]> {
  const base = normalizeBaseUrl(API_BIBLE_BASE_URL);
  const bibleId = translation === "NLT" ? API_BIBLE_ID_NLT : API_BIBLE_ID_NIV;
  if (!base || !API_BIBLE_KEY || !bibleId || !bookId.trim()) {
    throw new Error("Missing api.bible config for chapter list.");
  }

  const url = `${base}/v1/bibles/${bibleId}/books/${bookId}/chapters`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": API_BIBLE_KEY,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await safeText(response);
    throw new Error(`Chapters request failed (${response.status}): ${body || "no body"}`);
  }

  const raw = (await response.json()) as {
    data?: Array<{ id?: string; number?: string }>;
  };
  if (!Array.isArray(raw?.data)) return [];

  const chapters = raw.data
    .map((c) => (typeof c.number === "string" ? Number(c.number) : NaN))
    .filter((n) => Number.isFinite(n) && n >= 1);

  return Array.from(new Set(chapters)).sort((a, b) => a - b);
}

/**
 * Loads a full chapter for the reader. Book id matches route segments (e.g. `genesis`).
 */
export async function getBibleChapter(
  book: string,
  chapter: number,
  translation: Translation,
  jwt?: string
): Promise<BibleChapterApiResponse> {
  let backendError: Error | null = null;

  // 1) Prefer your own backend when configured.
  if (API_URL.trim()) {
    try {
      const path = biblePaths.chapter(book, chapter, translation);
      const raw = await apiRequest<unknown>(path, { method: "GET" }, jwt);
      return normalizeChapterResponse(raw);
    } catch (e) {
      backendError = e instanceof Error ? e : new Error("Backend chapter request failed");
    }
  }

  // 2) Fallback for React Native-only usage: call api.bible directly.
  try {
    return await getBibleChapterFromApiBible(book, chapter, translation);
  } catch (e) {
    const directErr = e instanceof Error ? e.message : "Unknown api.bible error";
    if (backendError) {
      throw new Error(`${backendError.message}. Fallback api.bible failed: ${directErr}`);
    }
    throw new Error(`api.bible request failed: ${directErr}`);
  }
}

/** Accepts strict DTOs or `{ number, content }[]`-style verses from some APIs */
function normalizeChapterResponse(raw: unknown): BibleChapterApiResponse {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Invalid chapter response");
  }
  const o = raw as Record<string, unknown>;
  const chapter = typeof o.chapter === "number" ? o.chapter : Number(o.chapter);
  const translation = typeof o.translation === "string" ? o.translation : "NIV";
  const versesRaw = o.verses;
  if (!Array.isArray(versesRaw)) {
    throw new Error("Invalid chapter response: verses");
  }
  const verses: BibleChapterVerseDto[] = [];
  for (const item of versesRaw) {
    const line = normalizeVerseLine(item);
    if (line) verses.push(line);
  }
  verses.sort((a, b) => a.verse - b.verse);
  return {
    chapter: Number.isFinite(chapter) ? chapter : 0,
    translation,
    verses
  };
}

function normalizeVerseLine(item: unknown): BibleChapterVerseDto | null {
  if (typeof item !== "object" || item === null) return null;
  const v = item as Record<string, unknown>;
  const verse =
    typeof v.verse === "number"
      ? v.verse
      : typeof v.number === "number"
        ? v.number
        : typeof v.verse === "string"
          ? Number(v.verse)
          : typeof v.number === "string"
            ? Number(v.number)
            : NaN;
  const text =
    typeof v.text === "string"
      ? v.text
      : typeof v.content === "string"
        ? v.content
        : null;
  if (!Number.isFinite(verse) || text === null || text === "") return null;
  return { verse, text };
}

async function getBibleChapterFromApiBible(
  book: string,
  chapter: number,
  translation: Translation
): Promise<BibleChapterApiResponse> {
  const base = normalizeBaseUrl(API_BIBLE_BASE_URL);
  const bibleId = translation === "NLT" ? API_BIBLE_ID_NLT : API_BIBLE_ID_NIV;
  const bookCode = bookSlugToUsfm(book);

  if (!base || !API_BIBLE_KEY || !bibleId || !bookCode || !Number.isFinite(chapter)) {
    throw new Error("Missing api.bible config (base/key/bibleId/book).");
  }

  const chapterId = `${bookCode}.${chapter}`;
  const query = new URLSearchParams({
    "content-type": "html",
    "include-notes": "false",
    "include-titles": "true",
    "include-chapter-numbers": "false",
    "include-verse-numbers": "true",
  });

  const url = `${base}/v1/bibles/${bibleId}/chapters/${chapterId}?${query}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "api-key": API_BIBLE_KEY,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await safeText(response);
    throw new Error(`HTTP ${response.status} from api.bible (${body || "no body"})`);
  }

  const raw = (await response.json()) as ApiBibleChapterResponse;
  const parsed = parseApiBibleVerses(raw);
  if (parsed.length === 0) {
    throw new Error("api.bible returned no parseable verses.");
  }

  return {
    chapter,
    translation,
    verses: parsed,
  };
}

function parseApiBibleVerses(raw: ApiBibleChapterResponse): BibleChapterVerseDto[] {
  const content = raw?.data?.content;
  if (typeof content === "string") {
    return parseVersesFromHtml(content);
  }
  if (Array.isArray(content)) {
    return parseVersesFromJsonContent(content);
  }
  return [];
}

function parseVersesFromHtml(html: string): BibleChapterVerseDto[] {
  if (!html.trim()) return [];
  const verses: BibleChapterVerseDto[] = [];
  const verseRegex = /<span[^>]*data-number="(\d+)"[^>]*class="v"[^>]*>[\s\S]*?<\/span>|<span[^>]*class="v"[^>]*data-number="(\d+)"[^>]*>[\s\S]*?<\/span>/gi;
  const matches: Array<{ verse: number; at: number; end: number }> = [];

  let m: RegExpExecArray | null;
  while ((m = verseRegex.exec(html)) !== null) {
    const verseNum = Number(m[1] ?? m[2]);
    if (Number.isFinite(verseNum)) {
      matches.push({ verse: verseNum, at: m.index, end: m.index + m[0].length });
    }
  }

  for (let i = 0; i < matches.length; i += 1) {
    const start = matches[i].end;
    const end = i + 1 < matches.length ? matches[i + 1].at : html.length;
    const chunk = html.slice(start, end);
    const text = htmlToText(chunk).trim();
    if (text) {
      verses.push({ verse: matches[i].verse, text });
    }
  }

  // Deduplicate repeated verses if markup includes anchors.
  const dedup = new Map<number, string>();
  for (const v of verses) {
    if (!dedup.has(v.verse)) dedup.set(v.verse, v.text);
  }
  return Array.from(dedup.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([verse, text]) => ({ verse, text }));
}

type ApiBibleContentNode = {
  type?: string;
  name?: string;
  text?: string;
  attrs?: { number?: string };
  items?: ApiBibleContentNode[];
};

function parseVersesFromJsonContent(content: unknown[]): BibleChapterVerseDto[] {
  const acc = new Map<number, string[]>();
  let currentVerse: number | null = null;

  const walk = (node: ApiBibleContentNode) => {
    if (node.type === "tag" && node.name === "verse") {
      const num = Number(node.attrs?.number ?? "");
      if (Number.isFinite(num)) {
        currentVerse = num;
        if (!acc.has(num)) acc.set(num, []);
      }
    }

    if (typeof node.text === "string" && currentVerse !== null) {
      const trimmed = node.text.trim();
      if (trimmed) {
        acc.get(currentVerse)?.push(trimmed);
      }
    }

    if (Array.isArray(node.items)) {
      for (const child of node.items) walk(child);
    }
  };

  for (const item of content) {
    if (typeof item === "object" && item !== null) {
      walk(item as ApiBibleContentNode);
    }
  }

  return Array.from(acc.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([verse, parts]) => ({ verse, text: parts.join(" ").replace(/\s+/g, " ").trim() }))
    .filter((v) => v.text.length > 0);
}

function htmlToText(input: string): string {
  return input
    .replace(/<sup[^>]*>[\s\S]*?<\/sup>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ");
}

function normalizeBaseUrl(base: string): string {
  return base.trim().replace(/\/+$/, "");
}

function bookSlugToUsfm(book: string): string | null {
  const key = book.trim().toLowerCase();
  if (/^[a-z]{3}$/.test(key)) return key.toUpperCase();
  const map: Record<string, string> = {
    genesis: "GEN",
    exodus: "EXO",
    matthew: "MAT",
    john: "JHN",
    romans: "ROM",
    revelation: "REV",
  };
  return map[key] ?? null;
}

async function safeText(response: Response): Promise<string> {
  try {
    const txt = await response.text();
    return txt.slice(0, 180);
  } catch {
    return "";
  }
}

