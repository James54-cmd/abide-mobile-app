import { BrandLogo } from "@/components/brand/BrandLogo";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { colors } from "@/constants/theme";
import { useLoginScreenState } from "@/features/auth/hooks/useLoginScreenState";
import { Feather } from "@expo/vector-icons";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function LoginScreen() {
  const {
    router,
    email,
    setEmail,
    password,
    setPassword,
    emailRef,
    loading,
    error,
    emailInvalid,
    passwordInvalid,
    emailErrorMessage,
    passwordErrorMessage,
    onSubmit,
  } = useLoginScreenState();

  return (
    <SafeAreaView className="flex-1 bg-parchment" style={{ paddingHorizontal: 24 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        <Pressable
          onPress={() => router.back()}
          className="absolute left-0 top-2 z-10 py-2 flex-row items-center"
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <Feather name="chevron-left" size={22} color={colors.muted} />
          <Text className="font-sans text-muted ml-0.5">Back</Text>
        </Pressable>

        <BrandLogo variant="full" style={{ width: 160, height: 44, alignSelf: "center" }} />

        <Text className="mt-3 text-center font-sans text-muted" style={{ fontSize: 14 }}>
          Welcome back
        </Text>

        {error ? (
          <View
            style={{
              marginTop: 16,
              backgroundColor: colors.errorBg,
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 14,
            }}
          >
            <Text
              className="text-center font-sans text-sm text-red-700"
              accessibilityLiveRegion="polite"
            >
              {error}
            </Text>
          </View>
        ) : null}

        <View style={{ marginTop: 32, gap: 22 }}>
          <FloatingLabelInput
            ref={emailRef}
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            error={emailInvalid}
            errorMessage={emailErrorMessage}
          />

          <FloatingLabelInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            passwordVisibilityToggle
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={() => void onSubmit()}
            error={passwordInvalid}
            errorMessage={passwordErrorMessage}
          />
        </View>

        <Pressable
          className="mt-2 self-end py-2"
          hitSlop={12}
          onPress={() => router.push("/(auth)/forgot-password")}
          accessibilityRole="button"
          accessibilityLabel="Forgot password"
        >
          <Text style={{ fontSize: 13, color: colors.muted, fontFamily: "sans" }}>
            Forgot password?
          </Text>
        </Pressable>

        <Pressable
          style={{
            marginTop: 24,
            borderRadius: 14,
            backgroundColor: colors.gold,
            paddingVertical: 15,
            alignItems: "center",
            shadowColor: colors.gold,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.28,
            shadowRadius: 10,
            elevation: 4,
          }}
          onPress={() => void onSubmit()}
          disabled={loading}
          accessibilityRole="button"
          accessibilityLabel="Sign in"
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={{ color: colors.white, fontFamily: "sans-medium", fontSize: 16 }}>
              Sign in
            </Text>
          )}
        </Pressable>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 28,
            gap: 10,
          }}
        >
          <View style={{ flex: 1, height: 1, backgroundColor: colors.dividerMuted }} />
          <Text style={{ fontSize: 12, color: colors.muted, fontFamily: "sans" }}>or</Text>
          <View style={{ flex: 1, height: 1, backgroundColor: colors.dividerMuted }} />
        </View>

        <Pressable
          className="mt-5"
          onPress={() =>
            router.push({ pathname: "/(auth)/verify", params: { kind: "invite" } })
          }
        >
          <Text className="text-center font-sans text-muted" style={{ fontSize: 14 }}>
            Invited? Enter your code
          </Text>
        </Pressable>

        <Pressable className="mt-3" onPress={() => router.replace("/(auth)/register")}>
          <Text className="text-center font-sans text-gold" style={{ fontSize: 14 }}>
            New here?{" "}
            <Text style={{ fontFamily: "sans-medium" }}>Create an account</Text>
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
