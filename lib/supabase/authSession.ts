import { supabase } from "@/lib/supabase";

export async function signOutUser(): Promise<{ ok: true } | { ok: false; message: string }> {
  const { error } = await supabase.auth.signOut();
  if (error) return { ok: false, message: error.message };
  return { ok: true };
}
