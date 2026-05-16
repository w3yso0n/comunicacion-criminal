import { create } from "zustand";

import type { RegionFiltro } from "@/lib/types";

export type DateRangePreset = "24h" | "7d" | "30d";

type DashboardFiltersState = {
  region: RegionFiltro;
  datePreset: DateRangePreset;
  setRegion: (region: RegionFiltro) => void;
  setDatePreset: (preset: DateRangePreset) => void;
};

export const useDashboardFiltersStore = create<DashboardFiltersState>(
  (set) => ({
    region: "todas",
    datePreset: "24h",
    setRegion: (region) => set({ region }),
    setDatePreset: (datePreset) => set({ datePreset }),
  }),
);
