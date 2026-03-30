import { signOutUser } from "@/lib/supabase/authSession";
import { useCallback, useState } from "react";

export function useSettingsScreenState() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onLogout = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signOutUser();
      if (!result.ok) setError(result.message);
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, onLogout };
}
