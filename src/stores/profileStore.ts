import { create } from "zustand";
import type { Profile } from "@/types/profile";
import { api } from "@/lib/tauri";

interface ProfileStore {
  profile: Profile | null;
  loading: boolean;
  saving: boolean;
  error: string | null;

  fetchProfile: () => Promise<void>;
  saveProfile: (data: Profile) => Promise<void>;
}

export const useProfileStore = create<ProfileStore>((set) => ({
  profile: null,
  loading: false,
  saving: false,
  error: null,

  fetchProfile: async () => {
    set({ loading: true, error: null });
    try {
      const profile = await api.getProfile();
      set({ profile, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  saveProfile: async (data: Profile) => {
    set({ saving: true, error: null });
    try {
      const profile = await api.saveProfile(data);
      set({ profile, saving: false });
    } catch (err) {
      set({ error: String(err), saving: false });
      throw err;
    }
  },
}));