import { ScrollView, Text, View } from "react-native";
import type { Translation } from "@/types";

interface Props {
  book: string;
  chapter: number;
  translation: Translation;
}

export function BibleChapterScreen({ book, chapter, translation }: Props) {
  return (
    <ScrollView className="flex-1 bg-parchment px-4">
      <View className="mb-3 mt-4 flex-row items-center justify-between">
        <Text className="font-serif text-3xl text-ink">{`${book} ${chapter}`}</Text>
        <Text className="rounded-full bg-cream px-3 py-1 font-sans-medium text-sm text-muted">
          {translation}
        </Text>
      </View>
      {Array.from({ length: 10 }).map((_, idx) => (
        <Text key={idx} className="mb-3 font-serif-italic text-xl text-ink">
          <Text className="font-sans text-xs text-muted">{`${idx + 1} `}</Text>
          Blessed are those who hunger and thirst for righteousness, for they will be filled.
        </Text>
      ))}
      <View className="h-8" />
    </ScrollView>
  );
}
