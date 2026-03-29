import { BrandLogo } from "@/components/brand/BrandLogo";
import { useRouter } from "expo-router";
import { KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginRoute() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-parchment px-4">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-center">
        <Pressable onPress={() => router.back()} className="absolute left-0 top-2 z-10 py-2" hitSlop={12}>
          <Text className="font-sans text-muted">Back</Text>
        </Pressable>

        <View className="mb-8 items-center">
          <BrandLogo variant="symbol" style={{ width: 72, height: 72 }} />
        </View>

        <BrandLogo variant="full" style={{ width: 180, height: 50, alignSelf: "center" }} />

        <Text className="mt-4 text-center font-sans text-muted">Receive a magic link to sign in.</Text>
        <TextInput
          className="mt-6 rounded-xl bg-cream px-4 py-3 font-sans text-ink"
          placeholder="Email"
          placeholderTextColor="#8C7B6A"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        <Pressable className="mt-3 rounded-xl bg-gold py-3 active:scale-95">
          <Text className="text-center font-sans-medium text-white">Send magic link</Text>
        </Pressable>

        <Pressable className="mt-6" onPress={() => router.replace("/(auth)/register")}>
          <Text className="text-center font-sans text-gold">New here? Create an account</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
