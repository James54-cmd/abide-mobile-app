import { BrandLogo } from "@/components/brand/BrandLogo";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { colors } from "@/constants/theme";
import { useForgotPasswordState } from "@/features/auth/hooks/useForgotPasswordState";
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

export function ForgotPasswordScreen() {
  const {
    router,
    email,
    setEmail,
    emailRef,
    loading,
    error,
    emailInvalid,
    emailErrorMessage,
    onSubmit,
  } = useForgotPasswordState();

  return (
    <SafeAreaView className="flex-1 bg-parchment" style={{ paddingHorizontal: 24 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={() => router.back()}
          className="absolute left-0 top-2 z-10 flex-row items-center py-2"
          hitSlop={12}
        >
          <Feather name="chevron-left" size={22} color={colors.muted} />
          <Text className="ml-0.5 font-sans text-muted">Back</Text>
        </Pressable>

        <BrandLogo variant="full" style={{ width: 160, height: 44, alignSelf: "center" }} />

        <Text className="mt-3 text-center font-sans text-muted" style={{ fontSize: 14 }}>
          Reset your password
        </Text>
        <Text
          className="mt-2 text-center font-sans text-muted"
          style={{ fontSize: 13, lineHeight: 18, paddingHorizontal: 8 }}
        >
          We’ll email you a code. Enter it on the next screen, then choose a new password.
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

        <View style={{ marginTop: 28, gap: 22 }}>
          <FloatingLabelInput
            ref={emailRef}
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => void onSubmit()}
            error={emailInvalid}
            errorMessage={emailErrorMessage}
          />
        </View>

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
          accessibilityLabel="Send reset code"
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={{ color: colors.white, fontFamily: "sans-medium", fontSize: 16 }}>
              Send code
            </Text>
          )}
        </Pressable>

        <Pressable className="mt-6" onPress={() => router.replace("/(auth)/login")}>
          <Text className="text-center font-sans text-muted" style={{ fontSize: 14 }}>
            Back to sign in
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
