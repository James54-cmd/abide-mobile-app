import { useEmailPasswordAuth } from "@/features/auth/hooks/useEmailPasswordAuth";
import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/features/auth/validation";
import { hasEmailValue, normalizeEmail } from "@/lib/utils/email";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";

export function useRegisterScreenState() {
  const router = useRouter();
  const { signUp, loading, error, clearError } = useEmailPasswordAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showFieldValidation, setShowFieldValidation] = useState(false);
  const emailRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => emailRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    clearError();
    setShowFieldValidation(false);
  }, [name, email, password, confirmPassword, clearError]);

  const emailInvalid = showFieldValidation && (!hasEmailValue(email) || !isValidEmail(email));
  const passwordInvalid =
    showFieldValidation &&
    (password.length < PASSWORD_MIN_LENGTH ||
      (password.length >= PASSWORD_MIN_LENGTH &&
        confirmPassword.length > 0 &&
        password !== confirmPassword));
  const confirmInvalid =
    showFieldValidation &&
    (confirmPassword.length === 0 ||
      (password.length >= PASSWORD_MIN_LENGTH && password !== confirmPassword));

  const emailErrorMessage = emailInvalid
    ? !hasEmailValue(email)
      ? "Enter your email"
      : "Enter a valid email"
    : undefined;
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
    const emailOk = hasEmailValue(email) && isValidEmail(email);
    const passwordOk = password.length >= PASSWORD_MIN_LENGTH;
    const confirmOk = confirmPassword.length > 0 && password === confirmPassword;
    if (!emailOk || !passwordOk || !confirmOk) {
      setShowFieldValidation(true);
      return;
    }
    const result = await signUp(email, password, name || undefined);
    if (!result.ok) return;
    if (result.needsEmailConfirmation) {
      router.replace({
        pathname: "/(auth)/verify",
        params: { email: normalizeEmail(email), kind: "signup" },
      });
    }
  }, [email, password, confirmPassword, name, router, signUp]);

  return {
    router,
    name,
    setName,
    email,
    setEmail,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    emailRef,
    loading,
    error,
    emailInvalid,
    passwordInvalid,
    confirmInvalid,
    emailErrorMessage,
    passwordErrorMessage,
    confirmErrorMessage,
    onSubmit,
  };
}
