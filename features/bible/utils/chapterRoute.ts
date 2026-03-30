export type ChapterTransitionDirection = "forward" | "backward";

export function normalizeBibleBookId(bookId: string): string {
  return bookId.trim().toUpperCase();
}

export function humanizeBibleBookId(id: string): string {
  if (!id) return "Scripture";
  return id
    .split(/[-_]/)
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(" ");
}

export function toBibleRouteBookSegment(bookId: string): string {
  return normalizeBibleBookId(bookId).toLowerCase();
}

export function buildBibleChapterPath(
  bookId: string,
  chapter: number,
  direction?: ChapterTransitionDirection
): string {
  const base = `/(tabs)/bible/${toBibleRouteBookSegment(bookId)}/${chapter}`;
  return direction ? `${base}?dir=${direction}` : base;
}

export function parseChapterParam(chapter?: string): number {
  return Number(chapter || "1") || 1;
}

export function parseTransitionDirection(dir?: string): ChapterTransitionDirection {
  return dir === "backward" ? "backward" : "forward";
}
