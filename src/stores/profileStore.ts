import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type { Profile } from "@/types/profile";

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
      const profile = await invoke<Profile | null>("get_profile");
      set({ profile, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  saveProfile: async (data: Profile) => {
    set({ saving: true, error: null });
    try {
      const profile = await invoke<Profile>("save_profile", { data });
      set({ profile, saving: false });
    } catch (err) {
      set({ error: String(err), saving: false });
      throw err;
    }
  },
}));