import { create } from "zustand";
import type { GreetingResult } from "@/types/greeting";
import { generateGreetingStream } from "@/lib/ai";
import { useProfileStore } from "@/stores/profileStore";
import { usePositionStore } from "@/stores/positionStore";
import { useSettingsStore } from "@/stores/settingsStore";
import { useApplicationStore } from "@/stores/applicationStore";
import { useGreetingVersionStore } from "@/stores/greetingVersionStore";

// ── Stop words for keyword extraction ──
const STOP_WORDS = new Set([
  "的", "了", "是", "在", "有", "和", "就", "不", "人", "都",
  "一", "一个", "上", "也", "很", "到", "说", "要", "去", "你",
  "会", "着", "没有", "看", "好", "自己", "这", "他", "她", "它",
  "们", "与", "对", "等", "从", "被", "把", "让", "给", "为",
  "所", "以", "能", "下", "而", "但", "其", "中", "或", "及",
  "the", "a", "an", "is", "are", "was", "were", "be", "been",
  "being", "have", "has", "had", "do", "does", "did", "will",
  "would", "could", "should", "may", "might", "shall", "can",
  "to", "of", "in", "for", "on", "with", "at", "by", "from",
  "as", "into", "through", "during", "before", "after", "above",
  "below", "between", "out", "off", "over", "under", "again",
  "further", "then", "once", "here", "there", "when", "where",
  "why", "how", "all", "each", "every", "both", "few", "more",
  "most", "other", "some", "such", "no", "nor", "not", "only",
  "own", "same", "so", "than", "too", "very", "just", "because",
  "but", "about", "up", "what", "which", "who", "whom", "this",
  "that", "these", "those", "it",
]);

const MAX_KEYWORDS = 20;

interface GreetingStore {
  jdContent: string;
  selectedPositionId: string | null;
  result: GreetingResult | null;
  generating: boolean;
  isStreaming: boolean;
  streamingContent: string;
  error: string | null;
  progress: string;

  // Keywords
  keywords: string[];
  selectedKeywords: string[];

  setJdContent: (content: string) => void;
  setSelectedPosition: (id: string) => void;
  generateGreeting: () => Promise<void>;
  extractKeywords: (jd: string) => void;
  setSelectedKeywords: (keywords: string[]) => void;
  switchVersion: (versionId: string) => void;
  loadVersionsForPosition: (positionId: string) => void;
  reset: () => void;
}

export const useGreetingStore = create<GreetingStore>((set, get) => ({
  jdContent: "",
  selectedPositionId: null,
  result: null,
  generating: false,
  isStreaming: false,
  streamingContent: "",
  error: null,
  progress: "",

  keywords: [],
  selectedKeywords: [],

  setJdContent: (content: string) => {
    set({ jdContent: content, error: null });
    get().extractKeywords(content);
  },

  setSelectedPosition: (id: string) => {
    set({ selectedPositionId: id, error: null });
    get().loadVersionsForPosition(id);
  },

  extractKeywords: (jd: string) => {
    if (!jd.trim()) {
      set({ keywords: [], selectedKeywords: [] });
      return;
    }

    // Split by Chinese/English punctuation and whitespace
    const tokens = jd.split(/[\s,，。；;：:、！!？?（）()（）\[\]【】{}"'"「」『』]+/);

    // Filter and count
    const freq = new Map<string, number>();
    for (const token of tokens) {
      const trimmed = token.trim().toLowerCase();
      if (trimmed.length < 2) continue;
      if (STOP_WORDS.has(trimmed)) continue;
      // Skip pure numbers
      if (/^\d+$/.test(trimmed)) continue;
      freq.set(trimmed, (freq.get(trimmed) || 0) + 1);
    }

    // Sort by frequency, then by length (longer = more specific), take top N
    const sorted = [...freq.entries()]
      .sort((a, b) => {
        const freqDiff = b[1] - a[1];
        if (freqDiff !== 0) return freqDiff;
        return b[0].length - a[0].length;
      })
      .slice(0, MAX_KEYWORDS)
      .map(([word]) => word);

    set({ keywords: sorted, selectedKeywords: [] });
  },

  setSelectedKeywords: (keywords: string[]) => {
    set({ selectedKeywords: keywords });
  },

  switchVersion: (versionId: string) => {
    const version = useGreetingVersionStore.getState().getVersion(versionId);
    if (version) {
      set({
        result: version.result,
        streamingContent: "",
        isStreaming: false,
        generating: false,
        progress: "",
      });
      useGreetingVersionStore.getState().setCurrentVersion(versionId);
    }
  },

  loadVersionsForPosition: (positionId: string) => {
    useGreetingVersionStore.getState().loadVersions(positionId);
  },

  generateGreeting: async () => {
    const { jdContent, selectedPositionId, selectedKeywords } = get();

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

    set({
      generating: true,
      isStreaming: false,
      streamingContent: "",
      error: null,
      progress: "正在分析 JD...",
      result: null,
    });

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

      set({ progress: "正在生成打招呼...", isStreaming: true });

      // Create abort controller for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30_000);

      try {
        const result = await generateGreetingStream(
          { profile, position, jdContent, settings, selectedKeywords },
          (token) => {
            const current = get().streamingContent;
            set({ streamingContent: current + token });
          },
          controller.signal,
        );

        clearTimeout(timeoutId);

        set({
          result,
          streamingContent: "",
          isStreaming: false,
          generating: false,
          progress: "生成完成",
        });

        // Save to version history
        useGreetingVersionStore.getState().saveVersion(
          position.id,
          position.title,
          position.title,
          jdContent,
          selectedKeywords,
          result,
        );

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
          console.warn("Failed to auto-create application record");
        }
      } catch (err) {
        clearTimeout(timeoutId);
        throw err;
      }
    } catch (err) {
      set({
        error: String(err),
        generating: false,
        isStreaming: false,
        streamingContent: "",
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
      isStreaming: false,
      streamingContent: "",
      error: null,
      progress: "",
      keywords: [],
      selectedKeywords: [],
    });
  },
}));