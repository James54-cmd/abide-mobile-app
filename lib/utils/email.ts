export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function hasEmailValue(email: string): boolean {
  return normalizeEmail(email).length > 0;
}
