import { PASSWORD_MIN_LENGTH } from "@/features/auth/validation";
import { setPostSignOutRedirect } from "@/lib/auth/postSignOutRedirect";
import {
  clearSignedInHomeNavigationSuppression,
  suppressNextSignedInHomeNavigation,
} from "@/lib/auth/signedInNavigationGate";
import { signOutUser } from "@/lib/supabase/authSession";
import { updatePassword } from "@/lib/supabase/emailAuth";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";

export function useResetPasswordState() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showFieldValidation, setShowFieldValidation] = useState(false);
  const [phase, setPhase] = useState<"form" | "success">("form");

  useEffect(() => {
    return () => {
      clearSignedInHomeNavigationSuppression();
    };
  }, []);

  useEffect(() => {
    setShowFieldValidation(false);
    setError(null);
  }, [password, confirmPassword]);

  const runSignOutAndLogin = useCallback(async () => {
    setPostSignOutRedirect("/(auth)/login");
    const out = await signOutUser();
    if (!out.ok) {
      setError(out.message);
      setPhase("form");
      clearSignedInHomeNavigationSuppression();
      return;
    }
    clearSignedInHomeNavigationSuppression();
  }, []);

  const onContinueToLogin = useCallback(() => {
    void runSignOutAndLogin();
  }, [runSignOutAndLogin]);

  const passwordInvalid =
    showFieldValidation &&
    (password.length < PASSWORD_MIN_LENGTH ||
      (confirmPassword.length > 0 && password !== confirmPassword));
  const confirmInvalid =
    showFieldValidation &&
    (confirmPassword.length === 0 ||
      (password.length >= PASSWORD_MIN_LENGTH && password !== confirmPassword));

  const passwordErrorMessage = passwordInvalid
    ? password.length < PASSWORD_MIN_LENGTH
      ? `Use at least ${PASSWORD_MIN_LENGTH} characters`
      : "Passwords don't match"
    : undefined;
  const confirmErrorMessage = confirmInvalid
    ? confirmPassword.length === 0
      ? "Confirm your password"
      : "Passwords don't match"
    : undefined;

  const onSubmit = useCallback(async () => {
    const passwordOk = password.length >= PASSWORD_MIN_LENGTH;
    const matchOk = confirmPassword.length > 0 && password === confirmPassword;
    if (!passwordOk || !matchOk) {
      setShowFieldValidation(true);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      suppressNextSignedInHomeNavigation();
      const result = await updatePassword(password);
      if (!result.ok) {
        clearSignedInHomeNavigationSuppression();
        setError(result.message);
        return;
      }
      setPhase("success");
    } finally {
      setLoading(false);
    }
  }, [confirmPassword, password]);

  return {
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
    phase,
    onContinueToLogin,
  };
}
