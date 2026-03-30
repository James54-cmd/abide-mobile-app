import { isValidEmail, PASSWORD_MIN_LENGTH } from "@/features/auth/validation";
import { supabase } from "@/lib/supabase";

export type EmailAuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; message: string };

/** Matches Supabase email OTP flows (confirm signup vs accept invite). */
export type EmailOtpKind = "signup" | "invite";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function normalizeOtpToken(token: string): string {
  return token.replace(/\s|-/g, "");
}

export async function signInWithEmailPassword(
  email: string,
  password: string
): Promise<EmailAuthResult> {
  const trimmed = normalizeEmail(email);
  if (!trimmed) {
    return { ok: false, message: "Please enter your email." };
  }
  if (!isValidEmail(trimmed)) {
    return { ok: false, message: "Enter a valid email." };
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
  const trimmed = normalizeEmail(email);
  if (!trimmed) {
    return { ok: false, message: "Please enter your email." };
  }
  if (!isValidEmail(trimmed)) {
    return { ok: false, message: "Enter a valid email." };
  }
  if (!password || password.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      message: `Use a password of at least ${PASSWORD_MIN_LENGTH} characters.`,
    };
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

/**
 * Confirm signup or invite using the numeric code from email (`{{ .Token }}` in templates).
 * No browser / localhost redirect required.
 */
export async function verifyEmailOtp(
  email: string,
  token: string,
  kind: EmailOtpKind
): Promise<EmailAuthResult> {
  const trimmed = normalizeEmail(email);
  if (!trimmed) {
    return { ok: false, message: "Please enter your email." };
  }
  if (!isValidEmail(trimmed)) {
    return { ok: false, message: "Enter a valid email." };
  }
  const code = normalizeOtpToken(token);
  if (code.length < 6) {
    return { ok: false, message: "Enter the full code from your email." };
  }

  const { error } = await supabase.auth.verifyOtp({
    email: trimmed,
    token: code,
    type: kind
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

/** Resend signup confirmation email (same code flow). Not available for invite. */
export async function resendSignupConfirmation(email: string): Promise<EmailAuthResult> {
  const trimmed = normalizeEmail(email);
  if (!trimmed) {
    return { ok: false, message: "Please enter your email." };
  }
  if (!isValidEmail(trimmed)) {
    return { ok: false, message: "Enter a valid email." };
  }

  const { error } = await supabase.auth.resend({
    type: "signup",
    email: trimmed
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
