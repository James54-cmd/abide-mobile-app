import { useEmailPasswordAuth } from "@/features/auth/hooks/useEmailPasswordAuth";
import { isValidEmail } from "@/features/auth/validation";
import { hasEmailValue } from "@/lib/utils/email";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import type { TextInput } from "react-native";

export function useLoginScreenState() {
  const router = useRouter();
  const { signIn, loading, error, clearError } = useEmailPasswordAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showFieldValidation, setShowFieldValidation] = useState(false);
  const emailRef = useRef<TextInput>(null);

  useEffect(() => {
    const timer = setTimeout(() => emailRef.current?.focus(), 300);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    clearError();
    setShowFieldValidation(false);
  }, [email, password, clearError]);

  const emailInvalid = showFieldValidation && (!hasEmailValue(email) || !isValidEmail(email));
  const passwordInvalid = showFieldValidation && password.length === 0;

  const emailErrorMessage = emailInvalid
    ? !hasEmailValue(email)
      ? "Enter your email"
      : "Enter a valid email"
    : undefined;
  const passwordErrorMessage = passwordInvalid ? "Enter your password" : undefined;

  const onSubmit = useCallback(async () => {
    const emailOk = hasEmailValue(email) && isValidEmail(email);
    const passwordOk = password.length > 0;
    if (!emailOk || !passwordOk) {
      setShowFieldValidation(true);
      return;
    }
    await signIn(email, password);
  }, [email, password, signIn]);

  return {
    router,
    email,
    setEmail,
    password,
    setPassword,
    emailRef,
    loading,
    error,
    emailInvalid,
    passwordInvalid,
    emailErrorMessage,
    passwordErrorMessage,
    onSubmit,
  };
}
