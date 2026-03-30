/**
 * When true, AuthBootstrap skips `router.replace` to tabs on `SIGNED_IN` so screens can
 * show a short success state and navigate manually (e.g. verify OTP → home or reset-password).
 */
let suppressSignedInHome = false;

export function suppressNextSignedInHomeNavigation(): void {
  suppressSignedInHome = true;
}

export function clearSignedInHomeNavigationSuppression(): void {
  suppressSignedInHome = false;
}

export function isSignedInHomeNavigationSuppressed(): boolean {
  return suppressSignedInHome;
}
