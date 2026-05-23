import type { StateCreator } from "zustand";

export interface WindowState {
  hideOnBlur: boolean;
  dockToggle: boolean;
  autostartEnabled: boolean;
  trayMode: boolean;
  globalHotkey: string;
  setHideOnBlur: (enabled: boolean) => void;
  setDockToggle: (enabled: boolean) => void;
  setAutostartEnabled: (enabled: boolean) => void;
  setTrayMode: (enabled: boolean) => void;
  setGlobalHotkey: (hotkey: string) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createWindowSlice: StateCreator<any, [], [], WindowState> = (set) => ({
  hideOnBlur: false,
  dockToggle: false,
  autostartEnabled: false,
  trayMode: false,
  globalHotkey: "Super+Shift+Space",
  setHideOnBlur: (enabled) => set({ hideOnBlur: enabled }),
  setDockToggle: (enabled) => set({ dockToggle: enabled }),
  setAutostartEnabled: (enabled) => set({ autostartEnabled: enabled }),
  setTrayMode: (enabled) => set({ trayMode: enabled }),
  setGlobalHotkey: (hotkey) => set({ globalHotkey: hotkey }),
});
