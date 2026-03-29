import { BrandLogo } from "@/components/brand/BrandLogo";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyRoute() {
  return (
    <SafeAreaView className="flex-1 bg-parchment px-4">
      <View className="flex-1 items-center justify-center">
        <BrandLogo variant="symbol" style={{ width: 64, height: 64, marginBottom: 24 }} />
        <Text className="font-serif text-3xl text-ink">Check your email</Text>
        <Text className="mt-2 text-center font-sans text-muted">
          We sent a magic link. Return after verification to unlock Abide.
        </Text>
      </View>
    </SafeAreaView>
  );
}
