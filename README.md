# Abide

Mobile app for **Abide**, a spiritual encouragement companion. Built with **Expo** (SDK 52), **Expo Router** (file-based routing), **React Native**, and **TypeScript**. Styling uses **NativeWind** (Tailwind-style classes) on top of the app theme in `constants/theme.ts`.

## Requirements

- **Node.js** (LTS recommended)
- **npm** (or compatible package manager)
- For device or simulator builds: **Xcode** (iOS) and/or **Android Studio** (Android)

## Quick start

```bash
npm install
```

Create **`.env.local`** in the project root (Expo loads `EXPO_PUBLIC_*` at build time):

| Variable | Purpose |
| -------- | ------- |
| `EXPO_PUBLIC_API_URL` | Backend API base URL |
| `EXPO_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `EXPO_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key |

Start the dev server:

```bash
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

## Project layout

| Path | Role |
| ---- | ---- |
| `app/` | Expo Router routes only—thin shells that import feature screens |
| `features/` | Product UI: `welcome`, `home`, and other feature folders with `screens/` (and hooks/components as they grow) |
| `components/` | Shared UI (e.g. `brand/` for logo marks) |
| `constants/` | Theme tokens, splash/brand asset maps, app config |
| `lib/` | Data clients, Supabase helpers, `lib/native/*` device wrappers (haptics, offline, etc.) |
| `store/` | Cross-feature Zustand stores |
| `assets/` | `brand/`, `splash/`, fonts, and other bundled media |
| `supabase/migrations/` | SQL migrations |
| `SKILL.md` | In-repo conventions for structuring React Native / Expo features |

### Entry flow

- **`app/index.tsx`** → welcome / marketing (`features/welcome/screens/WelcomeScreen.tsx`): intro, carousel art, sign-up and log-in CTAs.
- **`app/(auth)/`** → magic-link style auth routes.
- **`app/(tabs)/`** → main app tabs (home is `home.tsx` so it does not clash with the root index route).

## Tech highlights

- **Expo Router** with typed routes (`experiments.typedRoutes` in `app.json`)
- **Supabase** client for auth and data (`@supabase/supabase-js`)
- **Reanimated** for welcome animations
- **expo-secure-store** for sensitive tokens (not `AsyncStorage`)

For deeper rules on where files belong (hooks vs screens vs `lib/`), see **`SKILL.md`**.
