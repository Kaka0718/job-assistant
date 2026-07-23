import { create } from "zustand";
import type { Position, CreatePositionInput, UpdatePositionInput } from "@/types/position";
import { api } from "@/lib/tauri";

interface PositionStore {
  positions: Position[];
  loading: boolean;
  error: string | null;

  fetchPositions: () => Promise<void>;
  getPosition: (id: string) => Position | undefined;
  createPosition: (data: CreatePositionInput) => Promise<Position>;
  updatePosition: (id: string, data: UpdatePositionInput) => Promise<Position>;
  deletePosition: (id: string) => Promise<void>;
  archivePosition: (id: string) => Promise<Position>;
}

export const usePositionStore = create<PositionStore>((set, get) => ({
  positions: [],
  loading: false,
  error: null,

  fetchPositions: async () => {
    set({ loading: true, error: null });
    try {
      const positions = await api.listPositions();
      set({ positions, loading: false });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  getPosition: (id: string) => {
    return get().positions.find((p) => p.id === id);
  },

  createPosition: async (data: CreatePositionInput) => {
    try {
      const position = await api.createPosition(data);
      set((state) => ({ positions: [...state.positions, position] }));
      return position;
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },

  updatePosition: async (id: string, data: UpdatePositionInput) => {
    try {
      const position = await api.updatePosition(id, data);
      set((state) => ({
        positions: state.positions.map((p) => (p.id === id ? position : p)),
      }));
      return position;
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },

  deletePosition: async (id: string) => {
    try {
      await api.deletePosition(id);
      set((state) => ({
        positions: state.positions.filter((p) => p.id !== id),
      }));
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },

  archivePosition: async (id: string) => {
    try {
      const position = await api.archivePosition(id);
      set((state) => ({
        positions: state.positions.map((p) => (p.id === id ? position : p)),
      }));
      return position;
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },
}));