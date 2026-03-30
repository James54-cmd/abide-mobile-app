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

/**
 * `getSession()` only reads local storage. `getUser()` hits Supabase Auth so we drop
 * stale sessions (deleted user, revoked session, invalid JWT) instead of staying "logged in".
 * Skip sign-out on retryable / 5xx errors so offline users are not kicked.
 */
async function validateStoredSessionWithServer() {
  const {
    data: { session }
  } = await supabase.auth.getSession();
  if (!session?.access_token) return;

  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (user) return;
  if (!error) return;

  const name = "name" in error ? String((error as { name?: string }).name) : "";
  if (name === "AuthRetryableFetchError") return;

  const status = "status" in error ? (error as { status?: number }).status : undefined;
  if (status !== undefined && status >= 500) return;

  await supabase.auth.signOut();
}

/** Keeps Zustand in sync with Supabase session and sends authed users to the main tabs. */
export function AuthBootstrap() {
  useEffect(() => {
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        useAuthStore.getState().clearAuth();
        router.replace("/");
        return;
      }
      if (!session?.user) return;
      syncStoreFromSession(session);
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        router.replace("/(tabs)/home");
      }
    });

    void validateStoredSessionWithServer();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return null;
}
