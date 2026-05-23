import type { StateCreator } from "zustand";

export interface SettingsState {
  settingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createSettingsSlice: StateCreator<any, [], [], SettingsState> = (set) => ({
  settingsOpen: false,
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
});
