import {
  signInWithEmailPassword,
  signUpWithEmailPassword,
  type EmailAuthResult
} from "@/lib/supabase/emailAuth";
import { useCallback, useState } from "react";

export function useEmailPasswordAuth() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signIn = useCallback(async (email: string, password: string): Promise<EmailAuthResult> => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithEmailPassword(email, password);
      if (!result.ok) setError(result.message);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string): Promise<EmailAuthResult> => {
      setError(null);
      setLoading(true);
      try {
        const result = await signUpWithEmailPassword(email, password, fullName);
        if (!result.ok) setError(result.message);
        return result;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return { signIn, signUp, loading, error, clearError };
}
