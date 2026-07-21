import { create } from "zustand";
import type { GreetingResult } from "@/types/greeting";
import { generateGreeting as generateGreetingAI } from "@/lib/ai";
import { useProfileStore } from "@/stores/profileStore";
import { usePositionStore } from "@/stores/positionStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useApplicationStore } from "@/stores/applicationStore";

interface GreetingStore {
  jdContent: string;
  selectedPositionId: string | null;
  result: GreetingResult | null;
  generating: boolean;
  error: string | null;
  progress: string;

  setJdContent: (content: string) => void;
  setSelectedPosition: (id: string) => void;
  generateGreeting: () => Promise<void>;
  reset: () => void;
}

export const useGreetingStore = create<GreetingStore>((set, get) => ({
  jdContent: "",
  selectedPositionId: null,
  result: null,
  generating: false,
  error: null,
  progress: "",

  setJdContent: (content: string) => {
    set({ jdContent: content, error: null });
  },

  setSelectedPosition: (id: string) => {
    set({ selectedPositionId: id, error: null });
  },

  generateGreeting: async () => {
    const { jdContent, selectedPositionId } = get();

    // Validate JD content
    if (!jdContent.trim()) {
      set({ error: "请粘贴 JD 内容" });
      return;
    }

    // Validate position selection
    if (!selectedPositionId) {
      set({ error: "请选择岗位档案" });
      return;
    }

    set({ generating: true, error: null, progress: "正在分析 JD...", result: null });

    try {
      // Get data from other stores
      const profile = useProfileStore.getState().profile;
      const position = usePositionStore
        .getState()
        .positions.find((p) => p.id === selectedPositionId);
      const settings = useSettingsStore.getState().settings;

      // Validate profile
      if (!profile) {
        throw new Error("请先完善个人档案");
      }

      // Validate position
      if (!position) {
        throw new Error("所选岗位档案已不存在，请重新选择");
      }

      // Validate API Key
      if (!settings.ai.apiKey) {
        throw new Error("API Key 未配置，请先前往设置页配置");
      }

      // Call AI API
      const result = await generateGreetingAI(
        { profile, position, jdContent, settings },
        (stage) => set({ progress: stage }),
      );

      set({ result, generating: false, progress: "生成完成" });

      // Auto-create application record
      try {
        await useApplicationStore.getState().createApplication({
          positionId: position.id,
          company: position.title,
          positionTitle: position.title,
          matchScore: result.analysis.matchScore,
          keywords: result.analysis.highlights,
          jdContent: jdContent,
          greeting: result.greeting,
        });
      } catch {
        // Non-critical: application record creation failure shouldn't block the UI
        console.warn("Failed to auto-create application record");
      }
    } catch (err) {
      set({
        error: String(err),
        generating: false,
        progress: "",
      });
    }
  },

  reset: () => {
    set({
      jdContent: "",
      selectedPositionId: null,
      result: null,
      generating: false,
      error: null,
      progress: "",
    });
  },
}));