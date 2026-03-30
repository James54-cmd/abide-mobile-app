import Constants from "expo-constants";

type Extra = {
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  apiUrl?: string;
};

const extra = (Constants.expoConfig?.extra ?? {}) as Extra;

/**
 * Populated from `app.config.ts` → `extra` (reads `.env.local` at startup).
 * Falls back to env vars for web/tests where `extra` may differ (same order as `app.config.ts`).
 */
export const API_URL =
  extra.apiUrl?.trim() ||
  process.env.EXPO_PUBLIC_API_URL?.trim() ||
  process.env.NEXT_PUBLIC_API_URL?.trim() ||
  "";

/** Same fallback order as `app.config.ts` → `extra` (Expo-first, then Next-style names). */
export const SUPABASE_URL =
  extra.supabaseUrl?.trim() ||
  process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
  "";

export const SUPABASE_ANON_KEY =
  extra.supabaseAnonKey?.trim() ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
  "";
