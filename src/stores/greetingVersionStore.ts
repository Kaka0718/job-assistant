import { create } from "zustand";
import type { GreetingResult, GreetingVersion } from "@/types/greeting";

interface GreetingVersionStore {
  versions: GreetingVersion[];
  currentVersionId: string | null;
  loading: boolean;
  error: string | null;

  loadVersions(positionId: string): void;
  saveVersion(
    positionId: string,
    positionTitle: string,
    company: string,
    jdContent: string,
    selectedKeywords: string[] | undefined,
    result: GreetingResult,
  ): void;
  deleteVersion(id: string): void;
  setCurrentVersion(id: string | null): void;
  getVersion(id: string): GreetingVersion | undefined;
  getVersionsForPosition(positionId: string): GreetingVersion[];
}

const STORAGE_PREFIX = "greeting_versions_";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

export const useGreetingVersionStore = create<GreetingVersionStore>((set, get) => ({
  versions: [],
  currentVersionId: null,
  loading: false,
  error: null,

  loadVersions: (positionId: string) => {
    try {
      const key = `${STORAGE_PREFIX}${positionId}`;
      const stored = localStorage.getItem(key);
      if (stored) {
        const versions: GreetingVersion[] = JSON.parse(stored);
        set({
          versions,
          currentVersionId: versions.length > 0 ? versions[0].id : null,
        });
      } else {
        set({ versions: [], currentVersionId: null });
      }
    } catch {
      set({ versions: [], currentVersionId: null, error: "加载历史版本失败" });
    }
  },

  saveVersion: (
    positionId: string,
    positionTitle: string,
    company: string,
    jdContent: string,
    selectedKeywords: string[] | undefined,
    result: GreetingResult,
  ) => {
    const newVersion: GreetingVersion = {
      id: generateId(),
      positionId,
      positionTitle,
      company,
      jdContent,
      selectedKeywords,
      result,
      createdAt: new Date().toISOString(),
    };

    const versions = [newVersion, ...get().versions];
    set({ versions, currentVersionId: newVersion.id });

    // Persist to localStorage
    try {
      const key = `${STORAGE_PREFIX}${positionId}`;
      localStorage.setItem(key, JSON.stringify(versions));
    } catch {
      console.warn("Failed to persist greeting versions to localStorage");
    }
  },

  deleteVersion: (id: string) => {
    const { versions } = get();
    const filtered = versions.filter((v) => v.id !== id);

    let currentVersionId = get().currentVersionId;
    if (currentVersionId === id) {
      currentVersionId = filtered.length > 0 ? filtered[0].id : null;
    }

    set({ versions: filtered, currentVersionId });

    // Persist to localStorage (use the positionId from the remaining versions or the deleted one)
    const positionId = versions.find((v) => v.id === id)?.positionId;
    if (positionId) {
      try {
        const key = `${STORAGE_PREFIX}${positionId}`;
        if (filtered.length > 0) {
          localStorage.setItem(key, JSON.stringify(filtered));
        } else {
          localStorage.removeItem(key);
        }
      } catch {
        console.warn("Failed to persist greeting versions to localStorage");
      }
    }
  },

  setCurrentVersion: (id: string | null) => {
    set({ currentVersionId: id });
  },

  getVersion: (id: string) => {
    return get().versions.find((v) => v.id === id);
  },

  getVersionsForPosition: (positionId: string) => {
    return get().versions.filter((v) => v.positionId === positionId);
  },
}));