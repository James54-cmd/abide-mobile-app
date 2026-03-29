import { supabase } from "@/lib/supabase";

export type EmailAuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; message: string };

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<EmailAuthResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { ok: false, message: "Please enter your email." };
  }
  if (!password) {
    return { ok: false, message: "Please enter your password." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: trimmed,
    password
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function signUpWithEmailPassword(
  email: string,
  password: string,
  fullName?: string
): Promise<EmailAuthResult> {
  const trimmed = email.trim().toLowerCase();
  if (!trimmed) {
    return { ok: false, message: "Please enter your email." };
  }
  if (!password || password.length < 6) {
    return { ok: false, message: "Use a password of at least 6 characters." };
  }

  const { error, data } = await supabase.auth.signUp({
    email: trimmed,
    password,
    options: {
      data: {
        full_name: fullName?.trim() || undefined
      }
    }
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (!data.session) {
    return { ok: true, needsEmailConfirmation: true };
  }
  return { ok: true };
}
