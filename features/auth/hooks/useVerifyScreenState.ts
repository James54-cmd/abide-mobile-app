import { OTP_CODE_LENGTH, isValidEmail } from "@/features/auth/validation";
import {
  resendSignupConfirmation,
  verifyEmailOtp,
  type EmailOtpKind,
} from "@/lib/supabase/emailAuth";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";

export function useVerifyScreenState({
  initialEmailParam,
  kind,
}: {
  initialEmailParam: string;
  kind: EmailOtpKind;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmailParam);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendHint, setResendHint] = useState<string | null>(null);
  const [showFieldValidation, setShowFieldValidation] = useState(false);
  const emailRef = useRef<TextInput>(null);

  const hasLockedEmail = initialEmailParam.length > 0;

  useEffect(() => {
    if (initialEmailParam) setEmail(initialEmailParam);
  }, [initialEmailParam]);

  useEffect(() => {
    setShowFieldValidation(false);
    setError(null);
  }, [email, code]);

  useEffect(() => {
    if (hasLockedEmail) return;
    const timer = setTimeout(() => emailRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [hasLockedEmail]);

  const setCodeDigits = useCallback((t: string) => {
    setCode(t.replace(/\D/g, "").slice(0, OTP_CODE_LENGTH));
  }, []);

  const emailInvalid = showFieldValidation && (!email.trim() || !isValidEmail(email));
  const codeInvalid = showFieldValidation && code.length !== OTP_CODE_LENGTH;

  const emailErrorMessage = emailInvalid
    ? !email.trim()
      ? "Enter your email"
      : "Enter a valid email"
    : undefined;
  const codeErrorMessage = codeInvalid
    ? `Enter the ${OTP_CODE_LENGTH}-digit code`
    : undefined;

  const onVerify = useCallback(async () => {
    setResendHint(null);
    const emailOk = email.trim().length > 0 && isValidEmail(email);
    const codeOk = code.length === OTP_CODE_LENGTH;
    if (!emailOk || !codeOk) {
      setShowFieldValidation(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const result = await verifyEmailOtp(email, code, kind);
      if (!result.ok) {
        setError(result.message);
        return;
      }
    } finally {
      setLoading(false);
    }
  }, [code, email, kind]);

  const onResend = useCallback(async () => {
    if (kind !== "signup") return;
    setResendHint(null);
    const emailOk = email.trim().length > 0 && isValidEmail(email);
    if (!emailOk) {
      setShowFieldValidation(true);
      return;
    }
    setError(null);
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

  return {
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
  };
}
