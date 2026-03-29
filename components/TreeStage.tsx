import { Text, View } from "react-native";

const labels: Record<number, string> = {
  1: "Seed",
  2: "Sprout",
  3: "Sapling",
  4: "Young Tree",
  5: "Growing Tree",
  6: "Full Tree",
  7: "Ancient Tree"
};

export function TreeStage({ stage }: { stage: number }) {
  return (
    <View className="items-center">
      <View className="h-44 w-44 items-center justify-center rounded-full bg-cream">
        <Text className="text-5xl">{stage >= 4 ? "🌳" : "🌱"}</Text>
      </View>
      <Text className="mt-3 font-serif text-2xl text-ink">{labels[stage] ?? "Seed"}</Text>
    </View>
  );
}
