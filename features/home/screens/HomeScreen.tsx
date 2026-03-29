import { Pressable, ScrollView, Text, View } from "react-native";
import { DailyVerseCard } from "@/components/DailyVerseCard";
import { StreakBadge } from "@/components/StreakBadge";
import { colors } from "@/constants/theme";
import type { Conversation, Verse } from "@/types";

interface Props {
  name: string;
  verse: Verse;
  streakDays: number;
  conversations: Conversation[];
}

export function HomeScreen({ name, verse, streakDays, conversations }: Props) {
  return (
    <ScrollView
      className="flex-1 bg-parchment px-4"
      style={{ flex: 1, backgroundColor: colors.parchment }}
      contentContainerStyle={{ flexGrow: 1 }}
    >
      <Text className="mt-4 font-serif text-3xl text-ink">{`Good morning, ${name}`}</Text>
      <View className="mt-4">
        <DailyVerseCard verse={verse} />
      </View>
      <View className="mt-4 flex-row items-center justify-between">
        <StreakBadge days={streakDays} />
        <Text className="text-2xl">🌳</Text>
      </View>
      <Pressable className="mt-4 rounded-2xl bg-cream px-4 py-3 active:scale-95">
        <Text className="font-sans-medium text-ink">What&apos;s on your heart today?</Text>
      </Pressable>
      <Text className="mt-6 font-sans-medium text-muted">Recent conversations</Text>
      {conversations.slice(0, 3).map((item) => (
        <View key={item.id} className="mt-2 rounded-xl bg-cream p-3">
          <Text className="font-sans-medium text-ink">{item.title}</Text>
          <Text className="mt-1 font-sans text-sm text-muted">{item.lastMessage}</Text>
        </View>
      ))}
      <View className="h-8" />
    </ScrollView>
  );
}
