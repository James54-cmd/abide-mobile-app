import { Text, View } from "react-native";

export function StreakBadge({ days }: { days: number }) {
  return (
    <View className="rounded-full bg-cream px-3 py-1">
      <Text className="font-sans-medium text-sm text-ink">{`🔥 ${days}-day streak`}</Text>
    </View>
  );
}
