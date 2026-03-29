# Abide

Mobile app for **Abide**, a spiritual encouragement companion. Built with **Expo** (SDK 52), **Expo Router** (file-based routing), **React Native**, and **TypeScript**. Styling uses **NativeWind** (Tailwind-style classes) on top of the app theme in `constants/theme.ts`.

## Requirements

- **Node.js** (LTS recommended)
- **npm** (or compatible package manager)
- For device or simulator builds: **Xcode** (iOS) and/or **Android Studio** (Android)

## Environment (`.env.local`)

Put client-safe values in **`.env.local`** at the project root. When you run `npx expo start`, Expo loads that file into `process.env` while evaluating **`app.config.ts`**, which copies Supabase (and optional API URL) into **`expo.extra`**. **`constants/config.ts`** reads them via **`expo-constants`**—the normal pattern for mobile so secrets are not hard-coded.

You can use either naming style (handy if you share one `.env.local` with a Next.js app):

| Variable | Purpose |
| -------- | ------- |
| `EXPO_PUBLIC_SUPABASE_URL` or `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` or `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous (public) key |

Optional:

| Variable | Purpose |
| -------- | ------- |
| `EXPO_PUBLIC_API_URL` | Backend API base URL (for non-Supabase HTTP calls later) |

**Do not** put the Supabase **service role** key in this file—it must never ship inside the mobile app. Transactional email (confirmations, invites, etc.) is configured in the [Supabase Dashboard](https://supabase.com/dashboard) under **Authentication → Email Templates**, not in the client.

## Quick start

```bash
npm install
npm run start
```

Then open in Expo Go, a **development build** (recommended for native modules), or press `i` / `a` for iOS / Android after configuring simulators.

### Native builds and dev client

This repo includes **`eas.json`** with a **development client** profile. After changing native config (splash, icons, plugins), create a new dev build:

```bash
npx eas build --profile development --platform ios
# or --platform android
```

Splash and icon paths live in **`app.json`** (`assets/brand/`).

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run start` | Start Expo dev server |
| `npm run ios` | Run on iOS (`expo run:ios`) |
| `npm run android` | Run on Android (`expo run:android`) |
| `npm run lint` | Run Expo ESLint |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |

## Auth

Sign-in uses **Supabase Auth** with **email and password** (`signInWithPassword` / `signUp`). Logic lives in `lib/supabase/emailAuth.ts`; UI uses `features/auth/hooks/useEmailPasswordAuth.ts`. After a successful sign-in, `components/AuthBootstrap.tsx` syncs the session to `store/useAuthStore.ts` and navigates to the main tabs.

If your Supabase project requires **email confirmation** on sign-up, new users are sent to **`/(auth)/verify`** until they confirm, then they can sign in on **`/(auth)/login`**.

## Project layout

| Path | Role |
| ---- | ---- |
| `app/` | Expo Router routes only—thin shells that import feature screens |
| `features/` | Product UI: `welcome`, `home`, `auth` hooks, etc. |
| `components/` | Shared UI (e.g. `brand/`, `AuthBootstrap`) |
| `constants/` | Theme tokens, splash/brand asset maps, `config.ts` (env-backed) |
| `lib/` | Supabase client, `lib/supabase/*` auth helpers, `lib/native/*` device wrappers |
| `store/` | Cross-feature Zustand stores |
| `assets/` | `brand/`, `splash/`, fonts, and other bundled media |
| `supabase/migrations/` | SQL migrations |
| `SKILL.md` | In-repo conventions for structuring React Native / Expo features |

### Entry flow

- **`app/index.tsx`** → welcome / marketing (`features/welcome/screens/WelcomeScreen.tsx`).
- **`app/(auth)/`** → email/password **login**, **register**, and **verify** (confirmation reminder).
- **`app/(tabs)/`** → main app tabs (`home.tsx` avoids clashing with the root `index` route).

## Tech highlights

- **Expo Router** with typed routes (`experiments.typedRoutes` in `app.json`)
- **Supabase** client for auth and data (`@supabase/supabase-js`), **AsyncStorage** session persistence in `lib/supabase.ts`
- **Reanimated** for welcome animations
- **expo-secure-store** reserved for other sensitive flows (tokens should not live in plain `AsyncStorage` beyond what Supabase auth uses)

For deeper rules on where files belong (hooks vs screens vs `lib/`), see **`SKILL.md`**.
