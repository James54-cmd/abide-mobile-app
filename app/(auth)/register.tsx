import { BrandLogo } from "@/components/brand/BrandLogo";
import { useEmailPasswordAuth } from "@/features/auth/hooks/useEmailPasswordAuth";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function RegisterRoute() {
  const router = useRouter();
  const { signUp, loading, error } = useEmailPasswordAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit() {
    const result = await signUp(email, password, name || undefined);
    if (!result.ok) return;
    if (result.needsEmailConfirmation) {
      router.replace("/(auth)/verify");
    }
  }

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

        <Text className="mt-4 text-center font-sans text-muted">Create your account (min. 6 character password).</Text>

        {error ? (
          <Text className="mt-3 text-center font-sans text-sm text-red-700" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}

        <TextInput
          className="mt-4 rounded-xl bg-cream px-4 py-3 font-sans text-ink"
          placeholder="Name (optional)"
          placeholderTextColor="#8C7B6A"
          autoCapitalize="words"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          className="mt-3 rounded-xl bg-cream px-4 py-3 font-sans text-ink"
          placeholder="Email"
          placeholderTextColor="#8C7B6A"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          className="mt-3 rounded-xl bg-cream px-4 py-3 font-sans text-ink"
          placeholder="Password"
          placeholderTextColor="#8C7B6A"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          onSubmitEditing={() => void onSubmit()}
        />

        <Pressable
          className="mt-4 rounded-xl bg-gold py-3 active:scale-95"
          onPress={() => void onSubmit()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center font-sans-medium text-white">Create account</Text>
          )}
        </Pressable>

        <Pressable className="mt-6" onPress={() => router.replace("/(auth)/login")}>
          <Text className="text-center font-sans text-gold">Already have an account? Log in</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
