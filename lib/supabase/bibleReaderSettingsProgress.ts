import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import type { Translation } from "@/types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  BibleFontFamily,
  BibleFontSize,
  BibleLineSpacing,
  BibleReaderSettings,
} from "@/features/bible/types";

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

export function useBibleReaderSettingsProgress({
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

  const [settings, setSettings] = useState<BibleReaderSettings>(DEFAULT_SETTINGS);
  const [hydrated, setHydrated] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didUserEditRef = useRef(false);

  const applySettings = useCallback((next: BibleReaderSettings) => {
    didUserEditRef.current = true;
    setSettings(next);
  }, []);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    async function load() {
      try {
        const { data, error } = await supabase
          .from("bible_reading_progress")
          .select("translation, book_id, chapter_id, verse, font_size, font_family, line_spacing")
          .eq("user_id", userId)
          .maybeSingle();

        if (!isMounted) return;

        if (error || !data) {
          setSettings(DEFAULT_SETTINGS);
          setHydrated(true);
          return;
        }

        if (!didUserEditRef.current) {
          setSettings({
            fontSize: normalizeFontSize(data.font_size) ?? DEFAULT_SETTINGS.fontSize,
            fontFamily: normalizeFontFamily(data.font_family) ?? DEFAULT_SETTINGS.fontFamily,
            lineSpacing: normalizeLineSpacing(data.line_spacing) ?? DEFAULT_SETTINGS.lineSpacing,
          });
        }
        setHydrated(true);
      } catch {
        if (!isMounted) return;
        setSettings(DEFAULT_SETTINGS);
        setHydrated(true);
      }
    }

    void load();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  const persistSettings = useCallback(async () => {
    if (!userId) return;
    try {
      await supabase.from("bible_reading_progress").upsert(
        {
          user_id: userId,
          translation,
          book_id: bookIdUpper,
          chapter_id: chapterId,
          verse: 1,
          font_size: settings.fontSize,
          font_family: settings.fontFamily,
          line_spacing: settings.lineSpacing,
        },
        { onConflict: "user_id" }
      );
    } catch {
      // Ignore save errors; UI still updates locally.
    }
  }, [userId, translation, bookIdUpper, chapterId, settings]);

  useEffect(() => {
    if (!userId) return;
    if (!hydrated) return;

    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);

    saveTimerRef.current = setTimeout(() => {
      persistSettings().catch(() => undefined);
    }, 350);

    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [userId, hydrated, persistSettings]);

  return { settings, applySettings, hydrated };
}

