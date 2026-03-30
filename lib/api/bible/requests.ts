import { apiRequest } from "@/lib/api";
import { biblePaths } from "@/lib/api/bible/endpoints";
import type {
  BibleApiBookDto,
  BibleChapterApiResponse,
  BibleChapterVerseDto,
} from "@/lib/api/bible/types";
import type { Translation, Verse } from "@/types";

const AO_BIBLE_BASE_URL = "https://bible.helloao.org/api";

export async function getVerseOfTheDay(jwt?: string): Promise<Verse> {
  return apiRequest<Verse>(biblePaths.votd(), { method: "GET" }, jwt);
}

export async function getAvailableTranslations(): Promise<Translation[]> {
  const url = `${AO_BIBLE_BASE_URL}/available_translations.json`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body = await safeText(response);
    throw new Error(`AO translations request failed (${response.status}): ${body || "no body"}`);
  }

  const raw = (await parseJsonResponse(response, "translations")) as { id?: string }[];
  if (!Array.isArray(raw)) return [];
  return raw
    .map((row) => (typeof row.id === "string" ? row.id.trim().toUpperCase() : ""))
    .filter(Boolean);
}

export async function getBibleBooks(translation: Translation): Promise<BibleApiBookDto[]> {
  const url = `${AO_BIBLE_BASE_URL}/${encodeURIComponent(translation)}/books.json`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body = await safeText(response);
    throw new Error(`AO books request failed (${response.status}): ${body || "no body"}`);
  }

  const raw = (await parseJsonResponse(response, "books")) as {
    books?: { id?: string; name?: string; commonName?: string; title?: string }[];
    data?: { id?: string; name?: string; commonName?: string; title?: string }[];
  };
  const booksRaw = Array.isArray(raw?.books) ? raw.books : Array.isArray(raw?.data) ? raw.data : [];

  return booksRaw
    .map((b) => ({
      id: typeof b.id === "string" ? b.id.trim().toUpperCase() : "",
      name:
        typeof b.commonName === "string" && b.commonName.trim()
          ? b.commonName
          : typeof b.name === "string"
            ? b.name
            : typeof b.title === "string"
              ? b.title
            : "",
    }))
    .filter((b) => b.id && b.name);
}

export async function getBibleBookChapters(
  translation: Translation,
  bookId: string
): Promise<number[]> {
  if (!bookId.trim()) {
    throw new Error("Missing AO book id for chapter list.");
  }

  const url = `${AO_BIBLE_BASE_URL}/${encodeURIComponent(translation)}/books.json`;
  const response = await fetch(url, {
    method: "GET",
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    const body = await safeText(response);
    throw new Error(`AO chapter-catalog request failed (${response.status}): ${body || "no body"}`);
  }

  const raw = (await parseJsonResponse(response, "chapter catalog")) as {
    books?: { id?: string; numberOfChapters?: number }[];
    data?: { id?: string; numberOfChapters?: number }[];
  };
  const booksRaw = Array.isArray(raw?.books) ? raw.books : Array.isArray(raw?.data) ? raw.data : [];
  const current = booksRaw.find((b) => (b.id ?? "").toUpperCase() === bookId.trim().toUpperCase());
  const count = Number(current?.numberOfChapters ?? 0);
  if (!Number.isFinite(count) || count < 1) return [];

  return Array.from({ length: count }, (_, idx) => idx + 1);
}

/**
 * Loads a full chapter for the reader. Book id matches route segments (e.g. `genesis`).
 */
export async function getBibleChapter(
  book: string,
  chapter: number,
  translation: Translation,
  _jwt?: string
): Promise<BibleChapterApiResponse> {
  const resolvedBookId = await resolveAoBookId(translation, book);
  const canonicalBookId = resolvedBookId.trim().toUpperCase();
  const url = `${AO_BIBLE_BASE_URL}/${encodeURIComponent(translation)}/${encodeURIComponent(canonicalBookId)}/${chapter}.json`;
  const response = await fetch(url, { method: "GET", headers: { Accept: "application/json" } });

  if (!response.ok) {
    const body = await safeText(response);
    throw new Error(`AO chapter request failed (${response.status}): ${body || "no body"}`);
  }

  const raw = (await parseJsonResponse(response, "chapter")) as {
    translation?: { id?: string };
    book?: { name?: string; commonName?: string; title?: string };
    chapter?: { number?: number; content?: unknown[] };
  };

  const chapterNumber = Number(raw?.chapter?.number ?? chapter);
  const verses = parseAoVerses(raw?.chapter?.content ?? []);
  if (verses.length === 0) {
    throw new Error("AO chapter response had no parseable verses.");
  }

  return {
    chapter: Number.isFinite(chapterNumber) ? chapterNumber : chapter,
    translation: typeof raw?.translation?.id === "string" ? raw.translation.id : translation,
    bookLabel:
      raw?.book?.commonName ??
      raw?.book?.name ??
      raw?.book?.title ??
      undefined,
    verses,
  };
}

async function resolveAoBookId(translation: Translation, book: string): Promise<string> {
  const token = normalizeBookToken(book);
  if (/^[1-3]?[A-Z]{2,3}$/.test(token)) return token;

  const books = await getBibleBooks(translation);
  const match = books.find((b) => {
    const id = normalizeBookToken(b.id);
    const name = normalizeBookToken(b.name);
    return token === id || token === name;
  });
  if (match) return match.id;
  throw new Error(`Could not resolve AO book id for '${book}'.`);
}

function normalizeBookToken(value: string): string {
  return value.replace(/[^a-z0-9]/gi, "").trim().toUpperCase();
}

function parseAoVerses(content: unknown[]): BibleChapterVerseDto[] {
  const lines = new Map<number, string[]>();
  for (const item of content) {
    if (typeof item !== "object" || item === null) continue;
    const row = item as { type?: string; number?: number | string; content?: unknown[] };
    if (row.type !== "verse") continue;
    const verse = typeof row.number === "number" ? row.number : Number(row.number);
    if (!Number.isFinite(verse)) continue;
    const chunks = Array.isArray(row.content) ? row.content : [];
    const text = flattenAoContent(chunks).trim();
    if (!text) continue;
    if (!lines.has(verse)) lines.set(verse, []);
    lines.get(verse)?.push(text);
  }

  return Array.from(lines.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([verse, parts]) => ({
      verse,
      text: parts.join(" ").replace(/\s+/g, " ").trim(),
    }));
}

function flattenAoContent(chunks: unknown[]): string {
  const out: string[] = [];
  for (const chunk of chunks) {
    if (typeof chunk === "string") {
      out.push(chunk);
      continue;
    }
    if (typeof chunk !== "object" || chunk === null) continue;
    const node = chunk as { text?: unknown; lineBreak?: unknown };
    if (typeof node.text === "string") out.push(node.text);
    if (node.lineBreak === true) out.push("\n");
  }
  return out.join(" ");
}

async function safeText(response: Response): Promise<string> {
  try {
    const txt = await response.text();
    return txt.slice(0, 180);
  } catch {
    return "";
  }
}

async function parseJsonResponse(response: Response, endpointName: string): Promise<unknown> {
  const body = await response.text();
  const trimmed = body.trim();
  if (!trimmed) {
    throw new Error(`AO ${endpointName} response was empty.`);
  }

  // Some AO paths can return an HTML docs page with status 200.
  if (trimmed.startsWith("<")) {
    throw new Error(`AO ${endpointName} returned HTML instead of JSON.`);
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    throw new Error(`AO ${endpointName} returned invalid JSON.`);
  }
}

