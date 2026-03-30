import { BrandLogo } from "@/components/brand/BrandLogo";
import { colors } from "@/constants/theme";
import {
  resendSignupConfirmation,
  verifyEmailOtp,
  type EmailOtpKind
} from "@/lib/supabase/emailAuth";
import { Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

function parseKind(raw: string | string[] | undefined): EmailOtpKind {
  const v = Array.isArray(raw) ? raw[0] : raw;
  return v === "invite" ? "invite" : "signup";
}

export default function VerifyRoute() {
  const router = useRouter();
  const params = useLocalSearchParams<{ email?: string; kind?: string }>();
  const kind = useMemo(() => parseKind(params.kind), [params.kind]);

  const initialEmail = useMemo(() => {
    const e = params.email;
    const s = Array.isArray(e) ? e[0] : e;
    return s?.trim() ?? "";
  }, [params.email]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendHint, setResendHint] = useState<string | null>(null);

  const onVerify = useCallback(async () => {
    setError(null);
    setResendHint(null);
    setLoading(true);
    try {
      const result = await verifyEmailOtp(email, code, kind);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      // Session is set by Supabase; AuthBootstrap sends the user to tabs on SIGNED_IN.
    } finally {
      setLoading(false);
    }
  }, [code, email, kind, router]);

  const onResend = useCallback(async () => {
    if (kind !== "signup") return;
    setError(null);
    setResendHint(null);
    setResendLoading(true);
    try {
      const result = await resendSignupConfirmation(email);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setResendHint("We sent a new email. Check your inbox.");
    } finally {
      setResendLoading(false);
    }
  }, [email, kind]);

  const title = kind === "invite" ? "Enter your invite code" : "Verify your email";
  const subtitle =
    kind === "invite"
      ? "Use the code from your invitation email. You can stay in the app—no link required."
      : "Enter the code we emailed you. No need to open a browser link.";

  return (
    <SafeAreaView className="flex-1 bg-parchment px-4">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-center">
        <Pressable
          accessibilityLabel="Back"
          accessibilityRole="button"
          onPress={() => router.back()}
          className="absolute left-0 top-2 z-10 py-2"
          hitSlop={12}
        >
          <Feather name="chevron-left" size={28} color={colors.muted} />
        </Pressable>

        <BrandLogo variant="symbol" style={{ width: 64, height: 64, alignSelf: "center", marginBottom: 20 }} />

        <Text className="text-center font-serif text-3xl text-ink">{title}</Text>
        <Text className="mt-2 text-center font-sans text-muted">{subtitle}</Text>

        {error ? (
          <Text className="mt-3 text-center font-sans text-sm text-red-700" accessibilityLiveRegion="polite">
            {error}
          </Text>
        ) : null}
        {resendHint ? (
          <Text className="mt-3 text-center font-sans text-sm text-teal" accessibilityLiveRegion="polite">
            {resendHint}
          </Text>
        ) : null}

        <TextInput
          className="mt-6 rounded-xl bg-cream px-4 py-3 font-sans text-ink"
          placeholder="Email"
          placeholderTextColor="#8C7B6A"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          editable={!initialEmail}
        />

        <TextInput
          className="mt-3 rounded-xl bg-cream px-4 py-3 font-sans text-ink text-center text-2xl tracking-[0.35em]"
          placeholder="000000"
          placeholderTextColor="#8C7B6A"
          keyboardType="number-pad"
          maxLength={12}
          value={code}
          onChangeText={(t) => setCode(t.replace(/[^\d]/g, ""))}
          onSubmitEditing={() => void onVerify()}
        />

        <Pressable
          className="mt-4 rounded-xl bg-gold py-3 active:scale-95"
          onPress={() => void onVerify()}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text className="text-center font-sans-medium text-white">Verify</Text>
          )}
        </Pressable>

        {kind === "signup" ? (
          <Pressable
            className="mt-4 py-2 active:opacity-80"
            onPress={() => void onResend()}
            disabled={resendLoading || !email.trim()}
          >
            {resendLoading ? (
              <ActivityIndicator color={colors.gold} />
            ) : (
              <Text className="text-center font-sans text-gold">Resend code</Text>
            )}
          </Pressable>
        ) : null}

        <Pressable className="mt-6" onPress={() => router.replace("/(auth)/login")}>
          <Text className="text-center font-sans text-muted">Back to sign in</Text>
        </Pressable>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
