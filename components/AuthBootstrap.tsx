import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { router } from "expo-router";
import { useEffect } from "react";

function syncStoreFromSession(session: {
  user: { id: string; email?: string | null; user_metadata?: Record<string, unknown> };
  access_token: string;
} | null) {
  if (!session?.user?.id || !session.access_token) return;
  const metaName = session.user.user_metadata?.full_name;
  const name =
    typeof metaName === "string" && metaName.length > 0
      ? metaName
      : (session.user.email?.split("@")[0] ?? "Friend");
  useAuthStore.getState().setAuth({
    userId: session.user.id,
    name,
    jwt: session.access_token
  });
}

/** Keeps Zustand in sync with Supabase session and sends authed users to the main tabs. */
export function AuthBootstrap() {
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        useAuthStore.getState().clearAuth();
        return;
      }
      if (!session?.user) return;
      syncStoreFromSession(session);
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        router.replace("/(tabs)/home");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
