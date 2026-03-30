import { useEmailOtpChallenge } from "@/features/auth/hooks/useEmailOtpChallenge";
import { isValidEmail, OTP_CODE_LENGTH } from "@/features/auth/validation";
import { clearSignedInHomeNavigationSuppression, suppressNextSignedInHomeNavigation } from "@/lib/auth/signedInNavigationGate";
import {
  requestPasswordRecoveryOtp,
  resendSignupConfirmation,
  verifyAuthOtp,
  type AuthOtpKind,
} from "@/lib/supabase/emailAuth";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";

const LOCKOUT_SIGNUP =
  "Too many incorrect codes. Tap Resend code for a new one, then try again.";
const LOCKOUT_INVITE =
  "Too many incorrect codes. Ask your organizer for a new invitation.";
const LOCKOUT_RECOVERY =
  "Too many incorrect codes. Go back and request a new reset email.";

export function useVerifyScreenState({
  initialEmailParam,
  kind,
}: {
  initialEmailParam: string;
  kind: AuthOtpKind;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmailParam);
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendHint, setResendHint] = useState<string | null>(null);
  const [showFieldValidation, setShowFieldValidation] = useState(false);
  const [verificationPhase, setVerificationPhase] = useState<"form" | "success">("form");
  const emailRef = useRef<TextInput>(null);
  const registrationCompleteRef = useRef(false);

  const {
    code,
    setCodeDigits,
    isLockedOut,
    maxAttempts,
    attemptsRemaining,
    registerWrongCode,
    resetAttemptsAndCode,
    startResendCooldown,
    resendCooldownSec,
  } = useEmailOtpChallenge();
  const hasResend = kind === "signup" || kind === "recovery";
  const hasLockedEmail = initialEmailParam.length > 0;
  const isRegistrationKind = kind === "signup" || kind === "invite";

  useEffect(() => {
    if (initialEmailParam) setEmail(initialEmailParam);
  }, [initialEmailParam]);

  useEffect(() => {
    if (verificationPhase === "success") return;
    setShowFieldValidation(false);
    setError(null);
  }, [email, code, verificationPhase]);

  useEffect(() => {
    if (hasLockedEmail) return;
    const timer = setTimeout(() => emailRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, [hasLockedEmail]);

  useEffect(() => {
    return () => {
      clearSignedInHomeNavigationSuppression();
    };
  }, []);

  const continueToHomeAfterRegistration = useCallback(() => {
    if (registrationCompleteRef.current) return;
    registrationCompleteRef.current = true;
    clearSignedInHomeNavigationSuppression();
    router.replace("/(tabs)/home");
  }, [router]);

  const emailInvalid = showFieldValidation && (!email.trim() || !isValidEmail(email));
  const codeInvalid =
    showFieldValidation && code.length !== OTP_CODE_LENGTH && !isLockedOut;

  const emailErrorMessage = emailInvalid
    ? !email.trim()
      ? "Enter your email"
      : "Enter a valid email"
    : undefined;
  const codeErrorMessage = codeInvalid
    ? `Enter the ${OTP_CODE_LENGTH}-digit code`
    : undefined;

  const lockoutMessage =
    kind === "invite" ? LOCKOUT_INVITE : kind === "recovery" ? LOCKOUT_RECOVERY : LOCKOUT_SIGNUP;

  const onVerify = useCallback(async () => {
    if (verificationPhase === "success" || isLockedOut) return;
    setResendHint(null);
    const emailOk = email.trim().length > 0 && isValidEmail(email);
    const codeOk = code.length === OTP_CODE_LENGTH;
    if (!emailOk || !codeOk) {
      setShowFieldValidation(true);
      return;
    }
    setError(null);
    suppressNextSignedInHomeNavigation();
    setLoading(true);
    try {
      const result = await verifyAuthOtp(email, code, kind);
      if (!result.ok) {
        clearSignedInHomeNavigationSuppression();
        const n = registerWrongCode();
        setError(n >= maxAttempts ? lockoutMessage : result.message);
        return;
      }

      if (kind === "recovery") {
        clearSignedInHomeNavigationSuppression();
        router.replace("/(auth)/reset-password");
        return;
      }

      registrationCompleteRef.current = false;
      setVerificationPhase("success");
    } finally {
      setLoading(false);
    }
  }, [
    code,
    email,
    isLockedOut,
    kind,
    lockoutMessage,
    maxAttempts,
    registerWrongCode,
    router,
    verificationPhase,
  ]);

  const onContinueToHome = useCallback(() => {
    continueToHomeAfterRegistration();
  }, [continueToHomeAfterRegistration]);

  const onResend = useCallback(async () => {
    if (!hasResend || isLockedOut) return;
    setResendHint(null);
    const emailOk = email.trim().length > 0 && isValidEmail(email);
    if (!emailOk) {
      setShowFieldValidation(true);
      return;
    }
    setError(null);
    setResendLoading(true);
    try {
      const result =
        kind === "signup"
          ? await resendSignupConfirmation(email)
          : await requestPasswordRecoveryOtp(email);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      resetAttemptsAndCode();
      startResendCooldown();
      setResendHint(
        kind === "recovery"
          ? "We sent a new reset email. Check your inbox."
          : "We sent a new email. Check your inbox."
      );
    } finally {
      setResendLoading(false);
    }
  }, [email, hasResend, isLockedOut, kind, resetAttemptsAndCode, startResendCooldown]);

  const canResend =
    hasResend &&
    !isLockedOut &&
    email.trim().length > 0 &&
    resendCooldownSec <= 0 &&
    !resendLoading &&
    verificationPhase === "form";

  return {
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
    attemptsRemaining,
    maxVerifyAttempts: maxAttempts,
    hasResend,
    isRegistrationKind,
  };
}
