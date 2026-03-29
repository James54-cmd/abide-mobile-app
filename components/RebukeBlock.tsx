import { Text, View } from "react-native";

export function RebukeBlock({ text }: { text: string }) {
  if (!text) return null;
  return (
    <View className="rounded-xl border-l-4 border-amber bg-cream p-3">
      <Text className="font-sans text-sm text-ink">{text}</Text>
    </View>
  );
}
