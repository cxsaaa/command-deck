import type { StateCreator } from "zustand";

export type DensityMode = "comfortable" | "compact";
export type SortMode = "createdAt" | "usageCount" | "favoritedAt";
export type ThemeMode = "system" | "light" | "dark";
export type Locale = "zh-CN" | "en-US";

export interface DisplayState {
  densityMode: DensityMode;
  sortMode: SortMode;
  themeMode: ThemeMode;
  locale: Locale;
  toggleDensityMode: () => void;
  setSortMode: (mode: SortMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createDisplaySlice: StateCreator<any, [], [], DisplayState> = (set, get) => ({
  densityMode: "comfortable",
  sortMode: "createdAt",
  themeMode: "system",
  locale: "zh-CN",
  toggleDensityMode: () =>
    set({ densityMode: get().densityMode === "comfortable" ? "compact" : "comfortable" }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setLocale: (locale) => set({ locale }),
});
