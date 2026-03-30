import { BrandLogo } from "@/components/brand/BrandLogo";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { AuthSuccessState } from "@/features/auth/components/AuthSuccessState";
import { colors } from "@/constants/theme";
import { useVerifyScreenState } from "@/features/auth/hooks/useVerifyScreenState";
import { OTP_CODE_LENGTH } from "@/features/auth/validation";
import type { AuthOtpKind } from "@/lib/supabase/emailAuth";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useMemo } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function parseKind(raw: string | string[] | undefined): AuthOtpKind {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v === "invite") return "invite";
  if (v === "recovery") return "recovery";
  return "signup";
}

export function VerifyScreen() {
  const params = useLocalSearchParams<{ email?: string; kind?: string }>();
  const kind = useMemo(() => parseKind(params.kind), [params.kind]);
  const initialEmailParam = useMemo(() => {
    const e = params.email;
    const s = Array.isArray(e) ? e[0] : e;
    return s?.trim() ?? "";
  }, [params.email]);

  const {
    router,
    email,
    setEmail,
    code,
    setCodeDigits,
    loading,
    resendLoading,
    resendCooldownSec,
    canResend,
    error,
    resendHint,
    emailRef,
    hasLockedEmail,
    emailInvalid,
    codeInvalid,
    emailErrorMessage,
    codeErrorMessage,
    onVerify,
    onResend,
    onContinueToHome,
    verificationPhase,
    isLockedOut,
    hasResend,
    isRegistrationKind,
  } = useVerifyScreenState({ initialEmailParam, kind });

  const isInvite = kind === "invite";
  const isRecovery = kind === "recovery";
  const titleLine1 = isInvite ? "Enter your" : isRecovery ? "Reset your" : "Verify your";
  const titleLine2 = isInvite ? "Invite code" : isRecovery ? "Password" : "Email";
  const subtitle = isInvite
    ? `Use the ${OTP_CODE_LENGTH}-digit code from your invitation email. You can stay in the app—no link required.`
    : isRecovery
      ? `Enter the ${OTP_CODE_LENGTH}-digit code from your password reset email.`
      : `Enter the ${OTP_CODE_LENGTH}-digit code we emailed you. No need to open a browser link.`;

  if (verificationPhase === "success" && isRegistrationKind) {
    return (
      <SafeAreaView className="flex-1 bg-parchment">
        <Pressable
          style={{ flex: 1 }}
          onPress={onContinueToHome}
          accessibilityRole="button"
          accessibilityLabel="Continue to home. Tap anywhere to open Abide."
        >
          <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <AuthSuccessState
              title="Your email has been successfully verified."
              subtitle="Tap anywhere to continue to Abide."
            />
          </View>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-parchment" style={{ paddingHorizontal: 24 }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 justify-center"
      >
        {/* Back */}
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

        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 36 }}>
          <BrandLogo variant="symbol" style={{ width: 44, height: 44, marginBottom: 24 }} />

          {/* Small uppercase label above the big title */}
          <Text
            style={{
              fontFamily: "serif",
              fontSize: 13,
              letterSpacing: 3,
              textTransform: "uppercase",
              color: colors.gold,
              marginBottom: 6,
            }}
          >
            {titleLine1}
          </Text>

          {/* Big serif title word */}
          <Text
            style={{
              fontFamily: "serif",
              fontSize: 40,
              lineHeight: 44,
              color: colors.ink,
              textAlign: "center",
            }}
          >
            {titleLine2}
          </Text>

          {/* Decorative gold rule with icon */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 14,
              gap: 8,
              width: "55%",
            }}
          >
            <View style={{ flex: 1, height: 1, backgroundColor: "rgba(201,151,58,0.3)" }} />
            <Feather name="mail" size={12} color={colors.gold} style={{ opacity: 0.7 }} />
            <View style={{ flex: 1, height: 1, backgroundColor: "rgba(201,151,58,0.3)" }} />
          </View>

          <Text
            style={{
              marginTop: 16,
              fontFamily: "serif",
              fontSize: 14,
              lineHeight: 22,
              color: colors.muted,
              textAlign: "center",
              maxWidth: 300,
            }}
          >
            {subtitle}
          </Text>
        </View>

        {/* Error banner */}
        {error ? (
          <View
            style={{
              marginBottom: 16,
              backgroundColor: colors.errorBg,
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Feather name="alert-circle" size={14} color="#b91c1c" />
            <Text
              className="font-sans text-sm text-red-700"
              style={{ flex: 1 }}
              accessibilityLiveRegion="polite"
            >
              {error}
            </Text>
          </View>
        ) : null}

        {/* Resend hint banner */}
        {resendHint ? (
          <View
            style={{
              marginBottom: 16,
              backgroundColor: "rgba(13,148,136,0.08)",
              borderRadius: 10,
              paddingVertical: 10,
              paddingHorizontal: 14,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
            }}
          >
            <Feather name="check-circle" size={14} color={colors.teal} />
            <Text
              className="font-sans text-sm"
              style={{ color: colors.teal, flex: 1 }}
              accessibilityLiveRegion="polite"
            >
              {resendHint}
            </Text>
          </View>
        ) : null}

        {/* Inputs */}
        <View style={{ gap: 22 }}>
          <FloatingLabelInput
            ref={emailRef}
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="next"
            editable={!hasLockedEmail && !isLockedOut}
            error={emailInvalid}
            errorMessage={emailErrorMessage}
          />

          <FloatingLabelInput
            label={`${OTP_CODE_LENGTH}-digit code`}
            value={code}
            onChangeText={setCodeDigits}
            keyboardType="number-pad"
            maxLength={OTP_CODE_LENGTH}
            returnKeyType="done"
            onSubmitEditing={() => void onVerify()}
            textContentType="oneTimeCode"
            autoComplete="one-time-code"
            editable={!isLockedOut}
            error={codeInvalid}
            errorMessage={codeErrorMessage}
            inputStyle={{
              textAlign: "center",
              fontSize: 20,
              lineHeight: 26,
              height: 36,
              letterSpacing: 8,
            }}
          />
        </View>

        {/* Verify button */}
        <Pressable
          style={{
            marginTop: 28,
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
          onPress={() => void onVerify()}
          disabled={loading || isLockedOut}
          accessibilityRole="button"
          accessibilityLabel="Verify"
        >
          {loading ? (
            <ActivityIndicator color={colors.white} />
          ) : (
            <Text style={{ color: colors.white, fontFamily: "sans-medium", fontSize: 16 }}>
              Verify
            </Text>
          )}
        </Pressable>

        {/* Resend */}
        {hasResend ? (
          <Pressable
            style={{ marginTop: 16, paddingVertical: 6, alignItems: "center" }}
            onPress={() => void onResend()}
            disabled={!canResend}
            accessibilityState={{ disabled: !canResend }}
          >
            {resendLoading ? (
              <ActivityIndicator color={colors.gold} size="small" />
            ) : resendCooldownSec > 0 ? (
              <Text
                className="font-sans text-muted"
                style={{ fontSize: 14, textAlign: "center" }}
                accessibilityLiveRegion="polite"
              >
                Resend code in {resendCooldownSec}s
              </Text>
            ) : (
              <Text className="font-sans" style={{ color: colors.muted, fontSize: 14 }}>
                Didn't get it?{" "}
                <Text style={{ fontFamily: "sans-medium", color: colors.gold }}>Resend code</Text>
              </Text>
            )}
          </Pressable>
        ) : null}

        {/* Back to login */}
        <Pressable
          style={{ marginTop: 10, paddingVertical: 6, alignItems: "center" }}
          onPress={() => router.replace("/(auth)/login")}
        >
          <Text className="font-sans text-muted" style={{ fontSize: 14 }}>
            Back to sign in
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}