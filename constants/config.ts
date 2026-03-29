import Constants from "expo-constants";

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  apiUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/**
 * Populated from `app.config.ts` → `extra` (reads `.env.local` at startup).
 * Falls back to `EXPO_PUBLIC_*` for web/tests where `extra` may differ.
 */
export const API_URL = extra.apiUrl ?? process.env.EXPO_PUBLIC_API_URL ?? "";
export const SUPABASE_URL = extra.supabaseUrl ?? process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = extra.supabaseAnonKey ?? process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";
