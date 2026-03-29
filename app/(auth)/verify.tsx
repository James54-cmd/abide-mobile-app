import { BrandLogo } from "@/components/brand/BrandLogo";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function VerifyRoute() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-parchment px-4">
      <View className="flex-1 items-center justify-center">
        <BrandLogo variant="symbol" style={{ width: 64, height: 64, marginBottom: 24 }} />
        <Text className="font-serif text-3xl text-ink">Check your email</Text>
        <Text className="mt-2 text-center font-sans text-muted">
          We sent a confirmation link. Open it to verify your account, then return here and sign in.
        </Text>
        <Pressable className="mt-8 rounded-xl bg-gold px-6 py-3 active:opacity-90" onPress={() => router.replace("/(auth)/login")}>
          <Text className="font-sans-medium text-white">Back to sign in</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}
