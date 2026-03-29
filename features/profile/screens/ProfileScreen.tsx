import { Text, View } from "react-native";

export function ProfileScreen() {
  return (
    <View className="flex-1 bg-parchment px-4 pt-4">
      <Text className="font-serif text-3xl text-ink">Profile</Text>
      <Text className="mt-2 font-sans text-muted">Notifications, biometrics, and preferences live here.</Text>
    </View>
  );
}
