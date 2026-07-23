import { create } from "zustand";
import type { Settings } from "@/types/settings";
import { api } from "@/lib/tauri";
import { testConnection as testAIConnection } from "@/lib/ai";

const defaultSettings: Settings = {
  ai: {
    provider: "deepseek",
    apiKey: "",
    model: "deepseek-chat",
    baseUrl: "https://api.deepseek.com",
    temperature: 0.7,
    maxTokens: 2048,
  },
  app: {
    theme: "system",
    language: "zh-CN",
    dataDir: "./data",
  },
};

interface SettingsStore {
  settings: Settings;
  loaded: boolean;
  loading: boolean;
  saving: boolean;
  testing: boolean;
  testResult: { success: boolean; message: string } | null;
  error: string | null;

  fetchSettings: () => Promise<void>;
  saveSettings: (data: Settings) => Promise<void>;
  updateSettings: (partial: Partial<Settings>) => void;
  testConnection: () => Promise<void>;
}

export const useSettingsStore = create<SettingsStore>((set, get) => ({
  settings: defaultSettings,
  loaded: false,
  loading: false,
  saving: false,
  testing: false,
  testResult: null,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });
    try {
      const settings = await api.getSettings();
      set({ settings: settings ?? defaultSettings, loaded: true, loading: false });
    } catch (err) {
      // Use defaults if settings can't be loaded
      set({ loaded: true, loading: false });
      console.warn("Failed to load settings, using defaults:", err);
    }
  },

  saveSettings: async (data: Settings) => {
    set({ saving: true, error: null });
    try {
      const settings = await api.saveSettings(data);
      set({ settings, saving: false });
    } catch (err) {
      set({ error: String(err), saving: false });
      throw err;
    }
  },

  updateSettings: (partial: Partial<Settings>) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
  },

  testConnection: async () => {
    set({ testing: true, testResult: null });
    try {
      const { settings } = get();
      const success = await testAIConnection(settings);
      set({
        testing: false,
        testResult: {
          success,
          message: success ? "连接成功" : "连接失败",
        },
      });
    } catch (err) {
      set({
        testing: false,
        testResult: {
          success: false,
          message: String(err),
        },
      });
    }
  },
}));