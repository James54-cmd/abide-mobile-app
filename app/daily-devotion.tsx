import { DailyDevotionStoryScreen } from "@/features/home/screens/DailyDevotionStoryScreen";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/store/useAuthStore";
import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

export default function DailyDevotionRoute() {
  const isAuthed = useAuthStore((s) => s.isAuthed);
  const [authResolved, setAuthResolved] = useState(false);
  const [hasSession, setHasSession] = useState(isAuthed);

  useEffect(() => {
    let cancelled = false;

    async function resolveAuth() {
      if (isAuthed) {
        if (!cancelled) {
          setHasSession(true);
          setAuthResolved(true);
        }
        return;
      }

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!cancelled) {
        setHasSession(Boolean(session?.user));
        setAuthResolved(true);
      }
    }

    void resolveAuth();

    return () => {
      cancelled = true;
    };
  }, [isAuthed]);

  if (!authResolved) {
    return <View style={{ flex: 1, backgroundColor: "#1A1410" }} />;
  }

  if (!hasSession) {
    return <Redirect href="/" />;
  }

  return <DailyDevotionStoryScreen />;
}
