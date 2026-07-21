import { create } from "zustand";
import { invoke } from "@tauri-apps/api/core";
import type {
  Application,
  ApplicationFilter,
  ApplicationStatus,
  CreateApplicationInput,
  UpdateApplicationInput,
} from "@/types/application";

interface ApplicationStore {
  applications: Application[];
  filter: ApplicationFilter;
  loading: boolean;
  error: string | null;

  fetchApplications: (filter?: ApplicationFilter) => Promise<void>;
  setFilter: (filter: ApplicationFilter) => void;
  createApplication: (data: CreateApplicationInput) => Promise<Application>;
  updateApplication: (id: string, data: UpdateApplicationInput) => Promise<Application>;
  updateStatus: (id: string, status: ApplicationStatus) => Promise<void>;
  deleteApplication: (id: string) => Promise<void>;
}

export const useApplicationStore = create<ApplicationStore>((set) => ({
  applications: [],
  filter: {},
  loading: false,
  error: null,

  fetchApplications: async (filter?: ApplicationFilter) => {
    set({ loading: true, error: null });
    try {
      const applications = await invoke<Application[]>("list_applications", { filter: filter || {} });
      set({ applications, loading: false, filter: filter || {} });
    } catch (err) {
      set({ error: String(err), loading: false });
    }
  },

  setFilter: (filter: ApplicationFilter) => {
    set({ filter });
  },

  createApplication: async (data: CreateApplicationInput) => {
    try {
      const application = await invoke<Application>("create_application", { data });
      set((state) => ({ applications: [application, ...state.applications] }));
      return application;
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },

  updateApplication: async (id: string, data: UpdateApplicationInput) => {
    try {
      const application = await invoke<Application>("update_application", { id, data });
      set((state) => ({
        applications: state.applications.map((a) => (a.id === id ? application : a)),
      }));
      return application;
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },

  updateStatus: async (id: string, status: ApplicationStatus) => {
    try {
      const application = await invoke<Application>("update_application_status", { id, status });
      set((state) => ({
        applications: state.applications.map((a) => (a.id === id ? application : a)),
      }));
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },

  deleteApplication: async (id: string) => {
    try {
      await invoke<void>("delete_application", { id });
      set((state) => ({
        applications: state.applications.filter((a) => a.id !== id),
      }));
    } catch (err) {
      set({ error: String(err) });
      throw err;
    }
  },
}));