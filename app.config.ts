import type { ConfigContext, ExpoConfig } from "expo/config";

/**
 * Runs in Node when Expo starts. Reads `.env.local` (and friends) so both
 * `EXPO_PUBLIC_*` (mobile convention) and `NEXT_PUBLIC_*` (shared with Next.js)
 * work for Supabase—values are passed into the bundle via `extra`.
 *
 * API base URL: `EXPO_PUBLIC_API_URL` → `NEXT_PUBLIC_API_URL`.
 */
export default ({ config }: ConfigContext): ExpoConfig => {
  const supabaseUrl =
    process.env.EXPO_PUBLIC_SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const supabaseAnonKey =
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  const apiBibleBaseUrl =
    process.env.EXPO_PUBLIC_API_BIBLE_BASE_URL ?? process.env.API_BIBLE_BASE_URL ?? "";
  const apiBibleKey = process.env.EXPO_PUBLIC_API_BIBLE_KEY ?? process.env.API_BIBLE_KEY ?? "";
  const apiBibleIdNiv =
    process.env.EXPO_PUBLIC_API_BIBLE_ID_NIV ?? process.env.API_BIBLE_ID_NIV ?? "";
  const apiBibleIdNlt =
    process.env.EXPO_PUBLIC_API_BIBLE_ID_NLT ?? process.env.API_BIBLE_ID_NLT ?? "";

  const apiUrl =
    process.env.EXPO_PUBLIC_API_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_URL?.trim() ||
    "";

  return {
    ...config,
    extra: {
      ...config.extra,
      supabaseUrl,
      supabaseAnonKey,
      apiUrl,
      apiBibleBaseUrl,
      apiBibleKey,
      apiBibleIdNiv,
      apiBibleIdNlt
    }
  } as ExpoConfig;
};
