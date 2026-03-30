import { isValidEmail } from "@/features/auth/validation";
import { requestPasswordRecoveryOtp } from "@/lib/supabase/emailAuth";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";

export function useForgotPasswordState() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFieldValidation, setShowFieldValidation] = useState(false);
  const emailRef = useRef<TextInput>(null);

  useEffect(() => {
    const t = setTimeout(() => emailRef.current?.focus(), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    setShowFieldValidation(false);
    setError(null);
  }, [email]);

  const emailInvalid = showFieldValidation && (!email.trim() || !isValidEmail(email));
  const emailErrorMessage = emailInvalid
    ? !email.trim()
      ? "Enter your email"
      : "Enter a valid email"
    : undefined;

  const onSubmit = useCallback(async () => {
    const ok = email.trim().length > 0 && isValidEmail(email);
    if (!ok) {
      setShowFieldValidation(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await requestPasswordRecoveryOtp(email);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push({
        pathname: "/(auth)/verify",
        params: { kind: "recovery", email: email.trim().toLowerCase() },
      });
    } finally {
      setLoading(false);
    }
  }, [email, router]);

  return {
    router,
    email,
    setEmail,
    emailRef,
    loading,
    error,
    emailInvalid,
    emailErrorMessage,
    onSubmit,
  };
}
