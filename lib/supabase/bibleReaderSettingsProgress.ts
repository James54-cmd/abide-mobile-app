import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { useBibleReaderStore } from "@/store/useBibleReaderStore";
import type { Translation } from "@/types";
import { useCallback, useEffect, useMemo, useState } from "react";
import type {
  BibleFontFamily,
  BibleFontSize,
  BibleLineSpacing,
  BibleReaderSettings,
} from "@/features/bible/types";

export class BibleProgressError extends Error {
  constructor(message: string, public code?: string) {
    super(message);
    this.name = "BibleProgressError";
  }
}

const DEFAULT_SETTINGS: BibleReaderSettings = {
  fontSize: "medium",
  fontFamily: "serif",
  lineSpacing: "normal",
};

function normalizeFontSize(value: unknown): BibleFontSize | null {
  if (typeof value !== "string") return null;
  const v = value.toLowerCase();
  if (v === "small" || v === "medium" || v === "large" || v === "extra_large") return v as BibleFontSize;
  if (v === "xl") return "extra_large";
  return null;
}

function normalizeFontFamily(value: unknown): BibleFontFamily | null {
  if (typeof value !== "string") return null;
  const v = value.toLowerCase();
  if (v === "serif" || v === "sans") return v as BibleFontFamily;
  return null;
}

function normalizeLineSpacing(value: unknown): BibleLineSpacing | null {
  if (typeof value !== "string") return null;
  const v = value.toLowerCase();
  if (v === "tight" || v === "normal" || v === "relaxed" || v === "loose") return v as BibleLineSpacing;
  return null;
}

type BibleReaderBootstrapState = {
  bookId: string;
  chapter: number;
  verse: number;
  translation: Translation;
  fontSize: BibleFontSize;
  fontFamily: BibleFontFamily;
  lineSpacing: BibleLineSpacing;
};

type BootstrapLoadState = "loading" | "ready" | "error";

function parseChapterId(chapterId: string | null | undefined): number {
  if (!chapterId) return 1;
  const parts = chapterId.split(".");
  const parsed = Number(parts[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 1;
}

/**
 * Data hook - loads initial reader state from Supabase BEFORE rendering reader (SKILL.md Rule 6).
 * Returns both progress (book/chapter) AND settings (fonts) to prevent default→saved flash.
 * This is a data hook that fetching logic, feature hooks compose this (Rule 5).
 */
export function useBibleReaderBootstrap(): {
  initialState: BibleReaderBootstrapState | null;
  loadState: BootstrapLoadState;
  errorMessage: string | null;
} {
  const userId = useAuthStore((s) => s.userId);
  const [initialState, setInitialState] = useState<BibleReaderBootstrapState | null>(null);
  const [loadState, setLoadState] = useState<BootstrapLoadState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setInitialState({
        bookId: "GEN",
        chapter: 1,
        verse: 1,
        translation: "NIV",
        fontSize: DEFAULT_SETTINGS.fontSize,
        fontFamily: DEFAULT_SETTINGS.fontFamily,
        lineSpacing: DEFAULT_SETTINGS.lineSpacing,
      });
      setLoadState("ready");
      return;
    }

    let cancelled = false;
    setLoadState("loading");
    setErrorMessage(null);

    const loadBootstrap = async () => {
      try {
        const { data, error } = await supabase
          .from("bible_reading_progress")
          .select("translation, book_id, chapter_id, verse, font_size, font_family, line_spacing")
          .eq("user_id", userId)
          .maybeSingle();

        if (cancelled) return;

        if (error) {
          throw new BibleProgressError(`Failed to load progress: ${error.message}`, error.code);
        }

        if (!data) {
          setInitialState({
            bookId: "GEN",
            chapter: 1,
            verse: 1,
            translation: "NIV",
            fontSize: DEFAULT_SETTINGS.fontSize,
            fontFamily: DEFAULT_SETTINGS.fontFamily,
            lineSpacing: DEFAULT_SETTINGS.lineSpacing,
          });
          setLoadState("ready");
          return;
        }

        setInitialState({
          bookId: typeof data.book_id === "string" ? data.book_id.trim().toUpperCase() : "GEN",
          chapter: parseChapterId(data.chapter_id),
          verse: data.verse ?? 1,
          translation: (data.translation ?? "NIV") as Translation,
          fontSize: normalizeFontSize(data.font_size) ?? DEFAULT_SETTINGS.fontSize,
          fontFamily: normalizeFontFamily(data.font_family) ?? DEFAULT_SETTINGS.fontFamily,
          lineSpacing: normalizeLineSpacing(data.line_spacing) ?? DEFAULT_SETTINGS.lineSpacing,
        });
        setLoadState("ready");
      } catch (e) {
        if (cancelled) return;
        const msg = e instanceof BibleProgressError 
          ? e.message 
          : e instanceof Error 
          ? e.message 
          : "Could not load reading progress.";
        setErrorMessage(msg);
        setLoadState("error");
      }
    };

    loadBootstrap();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  return { initialState, loadState, errorMessage };
}

/**
 * Hydrates the Zustand store with settings from bootstrap state.
 * Call this after bootstrap is ready to prevent default→saved settings flash.
 */
export function hydrateBibleReaderStore(bootstrapState: BibleReaderBootstrapState): void {
  useBibleReaderStore.getState().setSettings({
    fontSize: bootstrapState.fontSize,
    fontFamily: bootstrapState.fontFamily,
    lineSpacing: bootstrapState.lineSpacing,
  });
  useBibleReaderStore.getState().setInitialized(true);
}

/**
 * Progress persistence hook - handles saving reading progress to Supabase (SKILL.md Rule 6).
 * No longer loads settings (bootstrap does that). Only provides updateProgress function.
 */
export function useBibleReaderProgressPersistence({
  bookId,
  chapter,
  translation,
}: {
  bookId: string;
  chapter: number;
  translation: Translation;
}) {
  const userId = useAuthStore((s) => s.userId);
  const bookIdUpper = useMemo(() => bookId.trim().toUpperCase(), [bookId]);
  const chapterId = useMemo(() => `${bookIdUpper}.${chapter}`, [bookIdUpper, chapter]);

  const updateProgress = useCallback(async (verse: number = 1) => {
    if (!userId) return;
    
    const currentSettings = useBibleReaderStore.getState().settings;
    
    const { error } = await supabase.from("bible_reading_progress").upsert(
      {
        user_id: userId,
        translation,
        book_id: bookIdUpper,
        chapter_id: chapterId,
        verse,
        font_size: currentSettings.fontSize,
        font_family: currentSettings.fontFamily,
        line_spacing: currentSettings.lineSpacing,
      },
      { onConflict: "user_id" }
    );
    
    if (error) {
      throw new BibleProgressError(`Failed to save progress: ${error.message}`, error.code);
    }
  }, [userId, translation, bookIdUpper, chapterId]);

  return { updateProgress };
}

