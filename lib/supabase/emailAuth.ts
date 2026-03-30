import { isValidEmail, OTP_CODE_LENGTH, PASSWORD_MIN_LENGTH } from "@/features/auth/validation";
import { supabase } from "@/lib/supabase";
import { normalizeEmail } from "@/lib/utils/email";

export type EmailAuthResult =
  | { ok: true; needsEmailConfirmation?: boolean }
  | { ok: false; message: string };

/** Supabase `verifyOtp` email types used in this app. */
export type AuthOtpKind = "signup" | "invite" | "recovery";

function normalizeOtpToken(token: string): string {
  return token.replace(/\D/g, "");
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
 * Confirm signup, invite, or password-recovery OTP (`{{ .Token }}` in templates).
 * Token must be exactly `OTP_CODE_LENGTH` digits (see `features/auth/validation.ts`).
 */
export async function verifyAuthOtp(
  email: string,
  token: string,
  kind: AuthOtpKind
): Promise<EmailAuthResult> {
  const trimmed = normalizeEmail(email);
  if (!trimmed) {
    return { ok: false, message: "Please enter your email." };
  }
  if (!isValidEmail(trimmed)) {
    return { ok: false, message: "Enter a valid email." };
  }
  const code = normalizeOtpToken(token);
  if (code.length !== OTP_CODE_LENGTH) {
    return {
      ok: false,
      message: `Enter the ${OTP_CODE_LENGTH}-digit code from your email.`,
    };
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

/** @deprecated Use `verifyAuthOtp` — kept for gradual migration */
export const verifyEmailOtp = verifyAuthOtp;

/**
 * Resend signup confirmation email (Supabase issues a new OTP; previous code stops working).
 */
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

/**
 * Sends password recovery email with OTP (same as “resend” for recovery flow).
 * OTP expiry is server-side; app enforces resend cooldown separately.
 */
export async function requestPasswordRecoveryOtp(email: string): Promise<EmailAuthResult> {
  const trimmed = normalizeEmail(email);
  if (!trimmed) {
    return { ok: false, message: "Please enter your email." };
  }
  if (!isValidEmail(trimmed)) {
    return { ok: false, message: "Enter a valid email." };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(trimmed);

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}

export async function updatePassword(newPassword: string): Promise<EmailAuthResult> {
  if (!newPassword || newPassword.length < PASSWORD_MIN_LENGTH) {
    return {
      ok: false,
      message: `Use a password of at least ${PASSWORD_MIN_LENGTH} characters.`,
    };
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) {
    return { ok: false, message: error.message };
  }
  return { ok: true };
}
