const EMAIL_RE =
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9-]+(\.[a-zA-Z0-9-]+)*\.[a-zA-Z]{2,}$/;

export function isValidEmail(value: string): boolean {
  const email = value.trim();

  if (!EMAIL_RE.test(email)) return false;

  // Split safely
  const [local, domain] = email.split("@");
  if (!local || !domain) return false;

  // ❌ Local part rules
  if (local.startsWith(".") || local.endsWith(".")) return false;
  if (local.includes("..")) return false;

  // ❌ Domain rules
  const domainParts = domain.split(".");

  for (const part of domainParts) {
    if (!part.length) return false;

    // no leading/trailing hyphen per label
    if (part.startsWith("-") || part.endsWith("-")) return false;

    // no double hyphens at extremes (optional strictness)
    if (part.includes("..")) return false;
  }

  return true;
}

export const PASSWORD_MIN_LENGTH = 8;