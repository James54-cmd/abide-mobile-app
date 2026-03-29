import * as LocalAuthentication from "expo-local-authentication";
import { AppState, AppStateStatus } from "react-native";
import { getBiometricEnabled, getToken } from "@/lib/secure/storage";

export async function isBiometricAvailable(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return hasHardware && enrolled;
}

export async function promptBiometricUnlock(): Promise<boolean> {
  const enabled = await getBiometricEnabled();
  if (!enabled) return true;

  const available = await isBiometricAvailable();
  if (!available) return false;

  const result = await LocalAuthentication.authenticateAsync({
    promptMessage: "Unlock Abide",
    fallbackLabel: "Use email login"
  });
  return result.success;
}

export async function restoreSessionWithBiometrics(): Promise<string | null> {
  const unlocked = await promptBiometricUnlock();
  if (!unlocked) return null;
  return getToken();
}

export function registerBiometricForegroundHandler(onLockRequired: () => void): () => void {
  const sub = AppState.addEventListener("change", async (state: AppStateStatus) => {
    if (state === "active") {
      const ok = await promptBiometricUnlock();
      if (!ok) onLockRequired();
    }
  });

  return () => sub.remove();
}
