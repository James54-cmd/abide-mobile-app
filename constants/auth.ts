/**
 * Signup / recovery email OTP resend: minimum seconds between successful send/resend in the app.
 * Independent of OTP validity — expiry is configured in Supabase (Auth → email; often ~10 minutes).
 */
export const OTP_RESEND_COOLDOWN_SEC = 90;

/** Wrong-code submissions before lockout (per code issuance; reset on successful resend). */
export const OTP_MAX_VERIFY_ATTEMPTS = 3;

/** How long to show the verify success state before navigating (session already synced). */
export const OTP_SUCCESS_DISPLAY_MS = 1600;
