import { create } from "zustand";

interface AuthStore {
  userId: string | null;
  name: string | null;
  jwt: string | null;
  isAuthed: boolean;
  setAuth: (payload: { userId: string; name: string; jwt: string }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  userId: null,
  name: null,
  jwt: null,
  isAuthed: false,
  setAuth: ({ userId, name, jwt }) => set({ userId, name, jwt, isAuthed: true }),
  clearAuth: () => set({ userId: null, name: null, jwt: null, isAuthed: false })
}));
