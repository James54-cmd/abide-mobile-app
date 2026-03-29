import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Runs in Node when Expo starts. Reads `.env.local` (and friends) so both
 * `EXPO_PUBLIC_*` (mobile convention) and `NEXT_PUBLIC_*` (shared with Next.js)
 * work for Supabase—values are passed into the bundle via `extra`.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

  return {
    ...config,
    extra: {
      ...config.extra,
      supabaseUrl,
      supabaseAnonKey,
      apiUrl: process.env.EXPO_PUBLIC_API_URL ?? ""
    }
  } as ExpoConfig;
};
