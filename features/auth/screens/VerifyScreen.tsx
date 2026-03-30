import { BrandLogo } from "@/components/brand/BrandLogo";
import { FloatingLabelInput } from "@/components/ui/FloatingLabelInput";
import { colors } from "@/constants/theme";
import { useVerifyScreenState } from "@/features/auth/hooks/useVerifyScreenState";
import { OTP_CODE_LENGTH } from "@/features/auth/validation";
import type { EmailOtpKind } from "@/lib/supabase/emailAuth";
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

function parseKind(raw: string | string[] | undefined): EmailOtpKind {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "invite" ? "invite" : "signup";
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
  } = useVerifyScreenState({ initialEmailParam, kind });

  const isInvite = kind === "invite";
  const titleLine1 = isInvite ? "Enter your" : "Verify your";
  const titleLine2 = isInvite ? "Invite code" : "Email";
  const subtitle = isInvite
    ? `Use the ${OTP_CODE_LENGTH}-digit code from your invitation email. You can stay in the app—no link required.`
    : `Enter the ${OTP_CODE_LENGTH}-digit code we emailed you. No need to open a browser link.`;

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
            editable={!hasLockedEmail}
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
          disabled={loading}
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
        {kind === "signup" ? (
          <Pressable
            style={{ marginTop: 16, paddingVertical: 6, alignItems: "center" }}
            onPress={() => void onResend()}
            disabled={resendLoading || !email.trim()}
          >
            {resendLoading ? (
              <ActivityIndicator color={colors.gold} size="small" />
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