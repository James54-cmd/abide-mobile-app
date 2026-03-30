import { BrandLogo } from "@/components/brand/BrandLogo";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { colors } from "@/constants/theme";
import { useResetPasswordState } from "@/features/auth/hooks/useResetPasswordState";
import { PASSWORD_MIN_LENGTH } from "@/features/auth/validation";
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

export function ResetPasswordScreen() {
  const {
    router,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    loading,
    error,
    passwordInvalid,
    confirmInvalid,
    passwordErrorMessage,
    confirmErrorMessage,
    onSubmit,
  } = useResetPasswordState();

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
          New password
        </Text>
        <Text
          className="mt-2 text-center font-sans text-muted"
          style={{ fontSize: 13, lineHeight: 18, paddingHorizontal: 8 }}
        >
          Choose a password of at least {PASSWORD_MIN_LENGTH} characters.
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
            label="Password"
            value={password}
            onChangeText={setPassword}
            passwordVisibilityToggle
            secureTextEntry
            returnKeyType="next"
            error={passwordInvalid}
            errorMessage={passwordErrorMessage}
          />
          <FloatingLabelInput
            label="Confirm password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            passwordVisibilityToggle
            secureTextEntry
            returnKeyType="done"
            onSubmitEditing={() => void onSubmit()}
            error={confirmInvalid}
            errorMessage={confirmErrorMessage}
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
          accessibilityLabel="Update password"
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={{ color: colors.white, fontFamily: "sans-medium", fontSize: 16 }}>
              Update password
            </Text>
          )}
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
