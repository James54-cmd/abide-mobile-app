import { Text, View } from "react-native";
import type { Verse } from "@/types";

export function DailyVerseCard({ verse }: { verse: Verse }) {
  return (
    <View className="rounded-3xl border border-gold bg-parchment p-5">
      <Text className="font-serif-italic text-xl text-ink">{verse.text}</Text>
      <Text className="mt-3 font-sans-medium text-sm text-muted">{verse.reference}</Text>
    </View>
  );
}
