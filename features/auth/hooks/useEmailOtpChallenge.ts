import {
  OTP_MAX_VERIFY_ATTEMPTS,
  OTP_RESEND_COOLDOWN_SEC,
} from "@/constants/auth";
import { sanitizeOtpDigits } from "@/features/auth/utils/otpInput";
import { OTP_CODE_LENGTH } from "@/features/auth/validation";
import { useCallback, useEffect, useRef, useState } from "react";

export function useEmailOtpChallenge(options?: {
  maxAttempts?: number;
  resendCooldownSec?: number;
}) {
  const maxAttempts = options?.maxAttempts ?? OTP_MAX_VERIFY_ATTEMPTS;
  const cooldownTotal = options?.resendCooldownSec ?? OTP_RESEND_COOLDOWN_SEC;

  const [code, setCode] = useState("");
  const wrongAttemptsRef = useRef(0);
  const [wrongAttempts, setWrongAttempts] = useState(0);
  const [resendCooldownSec, setResendCooldownSec] = useState(0);

  useEffect(() => {
    if (resendCooldownSec <= 0) return;
    const id = setTimeout(() => setResendCooldownSec((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldownSec]);

  const setCodeDigits = useCallback((t: string) => {
    setCode(sanitizeOtpDigits(t));
  }, []);

  const isLockedOut = wrongAttempts >= maxAttempts;
  const attemptsRemaining = Math.max(0, maxAttempts - wrongAttempts);

  const registerWrongCode = useCallback((): number => {
    wrongAttemptsRef.current += 1;
    setWrongAttempts(wrongAttemptsRef.current);
    return wrongAttemptsRef.current;
  }, []);

  const resetAttemptsAndCode = useCallback(() => {
    wrongAttemptsRef.current = 0;
    setWrongAttempts(0);
    setCode("");
  }, []);

  const startResendCooldown = useCallback(() => {
    setResendCooldownSec(cooldownTotal);
  }, [cooldownTotal]);

  return {
    code,
    setCode,
    setCodeDigits,
    codeLength: OTP_CODE_LENGTH,
    wrongAttempts,
    attemptsRemaining,
    isLockedOut,
    maxAttempts,
    registerWrongCode,
    resetAttemptsAndCode,
    resendCooldownSec,
    startResendCooldown,
  };
}
