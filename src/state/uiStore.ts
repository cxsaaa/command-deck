import { create } from "zustand";
import { createNavigationSlice } from "./slices/navigationSlice";
import { createSearchSlice } from "./slices/searchSlice";
import { createDisplaySlice } from "./slices/displaySlice";
import { createSettingsSlice } from "./slices/settingsSlice";
import { createWindowSlice } from "./slices/windowSlice";
import { createEditingSlice } from "./slices/editingSlice";
import { createModalSlice } from "./slices/modalSlice";
import type { NavigationState } from "./slices/navigationSlice";
import type { SearchState } from "./slices/searchSlice";
import type { DisplayState } from "./slices/displaySlice";
import type { SettingsState } from "./slices/settingsSlice";
import type { WindowState } from "./slices/windowSlice";
import type { EditingState } from "./slices/editingSlice";
import type { ModalState } from "./slices/modalSlice";

// Re-export all types for backward compatibility
export type { NavType } from "./slices/navigationSlice";
export type { SearchScope } from "./slices/searchSlice";
export type { DensityMode, SortMode, ThemeMode, Locale } from "./slices/displaySlice";
export type { CommandModalState } from "./slices/modalSlice";

type UiState = NavigationState &
  SearchState &
  DisplayState &
  SettingsState &
  WindowState &
  EditingState &
  ModalState;

export const useUiStore = create<UiState>()((...args) => ({
  ...createNavigationSlice(...args),
  ...createSearchSlice(...args),
  ...createDisplaySlice(...args),
  ...createSettingsSlice(...args),
  ...createWindowSlice(...args),
  ...createEditingSlice(...args),
  ...createModalSlice(...args),
}));
