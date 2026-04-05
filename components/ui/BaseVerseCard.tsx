import { Pressable, Text, View } from "react-native";
import type { Verse } from "@/types";

interface BaseVerseCardProps {
  verse: Verse;
  variant?: "default" | "daily";
  onLongPress?: () => void;
  showTranslation?: boolean;
  showRelevance?: boolean;
}

/**
 * Base verse card component - eliminates duplication between DailyVerseCard and VerseCard (SKILL.md Rule 16).
 * Provides shared verse display structure with configurable styling and behavior.
 */
export function BaseVerseCard({
  verse,
  variant = "default",
  onLongPress,
  showTranslation = false,
  showRelevance = false,
}: BaseVerseCardProps) {
  const containerClass =
    variant === "daily"
      ? "rounded-3xl border border-gold bg-parchment p-5"
      : "rounded-2xl bg-cream p-4 active:scale-95";

  const verseTextClass = "font-serif-italic text-xl text-ink";
  const referenceTextClass =
    variant === "daily"
      ? "mt-3 font-sans-medium text-sm text-muted"
      : "font-sans-medium text-sm text-muted";

  if (variant === "daily") {
    return (
      <View className={containerClass}>
        <Text className={verseTextClass}>{verse.text}</Text>
        <Text className={referenceTextClass}>{verse.reference}</Text>
      </View>
    );
  }

  return (
    <Pressable className={containerClass} onLongPress={onLongPress}>
      <Text className={verseTextClass}>{verse.text}</Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className={referenceTextClass}>{verse.reference}</Text>
        {showTranslation && (
          <Text className="rounded-full bg-parchment px-2 py-1 font-sans text-xs text-muted">
            {verse.translation}
          </Text>
        )}
      </View>
      {showRelevance && verse.relevance && (
        <Text className="mt-2 font-sans text-sm text-muted">{verse.relevance}</Text>
      )}
    </Pressable>
  );
}