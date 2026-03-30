import { OTP_CODE_LENGTH } from "@/features/auth/validation";

export function sanitizeOtpDigits(input: string): string {
  return input.replace(/\D/g, "").slice(0, OTP_CODE_LENGTH);
}
