import { Text, View } from "react-native";

export function OfflineBanner() {
  return (
    <View className="rounded-xl bg-amber px-3 py-2">
      <Text className="font-sans-medium text-sm text-ink">You are offline. Showing cached content.</Text>
    </View>
  );
}
