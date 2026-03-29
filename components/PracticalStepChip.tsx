import { Text, View } from "react-native";

export function PracticalStepChip({ text }: { text: string }) {
  return (
    <View className="rounded-xl bg-teal px-3 py-2">
      <Text className="font-sans-medium text-sm text-white">{text}</Text>
    </View>
  );
}
