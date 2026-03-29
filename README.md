# Abide Mobile App

Expo Router v3 + React Native TypeScript scaffold for the Abide spiritual encouragement companion.

## Quick start

1. Install dependencies:
   - `npm install`
2. Create `.env.local` with:
   - `EXPO_PUBLIC_API_URL=...`
   - `EXPO_PUBLIC_SUPABASE_URL=...`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY=...`
3. Run dev server:
   - `npm run start`

## Core folders

- `app/` route shells only
- `features/` screen UI composition
- `lib/` API and native wrappers
- `store/` global Zustand state
- `supabase/migrations/` SQL migrations