import { create } from "zustand";
import { persist } from "zustand/middleware";
import { User, Video, Brand } from "./api";

// Auth Store
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: "auth-storage",
    }
  )
);

// Video Store
interface VideoState {
  videos: Video[];
  filters: { status: string; brand: string; search: string };
  setVideos: (videos: Video[]) => void;
  setFilter: (key: "status" | "brand" | "search", value: string) => void;
}

export const useVideoStore = create<VideoState>((set) => ({
  videos: [],
  filters: { status: "all", brand: "all", search: "" },
  setVideos: (videos) => set({ videos }),
  setFilter: (key, value) => set((state) => ({ filters: { ...state.filters, [key]: value } })),
}));

// Brand Store
interface BrandState {
  brands: Brand[];
  setBrands: (brands: Brand[]) => void;
}

export const useBrandStore = create<BrandState>((set) => ({
  brands: [],
  setBrands: (brands) => set({ brands }),
}));
