import { Pressable, Text, View } from "react-native";
import type { Verse } from "@/types";

interface Props {
  verse: Verse;
  onLongPress?: () => void;
}

export function VerseCard({ verse, onLongPress }: Props) {
  return (
    <Pressable className="rounded-2xl bg-cream p-4 active:scale-95" onLongPress={onLongPress}>
      <Text className="font-serif-italic text-xl text-ink">{verse.text}</Text>
      <View className="mt-3 flex-row items-center justify-between">
        <Text className="font-sans-medium text-sm text-muted">{verse.reference}</Text>
        <Text className="rounded-full bg-parchment px-2 py-1 font-sans text-xs text-muted">
          {verse.translation}
        </Text>
      </View>
      {verse.relevance ? <Text className="mt-2 font-sans text-sm text-muted">{verse.relevance}</Text> : null}
    </Pressable>
  );
}
