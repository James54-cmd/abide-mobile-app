import { Text, View } from "react-native";
import { StreakBadge } from "@/components/StreakBadge";
import { TreeStage } from "@/components/TreeStage";

interface Props {
  streakDays: number;
  stage: number;
  engagedToday: boolean;
}

export function GardenScreen({ streakDays, stage, engagedToday }: Props) {
  return (
    <View className="flex-1 items-center bg-parchment px-4 pt-8">
      <TreeStage stage={stage} />
      <View className="mt-4">
        <StreakBadge days={streakDays} />
      </View>
      <Text className="mt-4 font-serif text-2xl text-ink">{`${streakDays} days of abiding`}</Text>
      <View className="mt-5 w-full rounded-2xl bg-cream p-4">
        <Text className="font-sans-medium text-ink">
          {engagedToday ? "You have abided today." : "Open your heart today to help your tree grow."}
        </Text>
      </View>
    </View>
  );
}
