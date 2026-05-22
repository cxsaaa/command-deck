import { create } from "zustand";

export type NavType = "all" | "favorites" | "recent" | "platform";
export type SearchScope = "current" | "global";
export type DensityMode = "comfortable" | "compact";
export type SortMode = "createdAt" | "usageCount" | "favoritedAt";
export type ThemeMode = "system" | "light" | "dark";
export type Locale = "zh-CN" | "en-US";

interface CommandModalState {
  type: "create" | "edit";
  commandId?: string;
  initialTitle?: string;
}

interface UiState {
  // Navigation
  navType: NavType;
  currentPlatformId: string | null;
  currentCategoryId: string | null;

  // Search
  searchQuery: string;
  searchScope: SearchScope;
  selectedResultIndex: number;

  // Density
  densityMode: DensityMode;

  // Sort
  sortMode: SortMode;

  // Theme
  themeMode: ThemeMode;

  // Locale
  locale: Locale;

  // Settings
  settingsOpen: boolean;

  // Window behavior
  hideOnBlur: boolean;
  dockToggle: boolean;

  // Autostart
  autostartEnabled: boolean;

  // Inline editing
  platformRenameId: string | null;
  categoryRenameId: string | null;

  // Modals
  commandModal: CommandModalState | null;
  deleteConfirmCommandId: string | null;

  // Actions
  setNavType: (navType: NavType) => void;
  setCurrentPlatform: (platformId: string | null) => void;
  setCurrentCategory: (categoryId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSearchScope: (scope: SearchScope) => void;
  setSelectedResultIndex: (index: number) => void;
  openCreateCommandModal: (initialTitle?: string) => void;
  openEditCommandModal: (commandId: string) => void;
  closeCommandModal: () => void;
  openDeleteConfirm: (commandId: string) => void;
  closeDeleteConfirm: () => void;
  toggleDensityMode: () => void;
  setSortMode: (mode: SortMode) => void;
  setThemeMode: (mode: ThemeMode) => void;
  setLocale: (locale: Locale) => void;
  openSettings: () => void;
  closeSettings: () => void;
  setPlatformRenameId: (id: string | null) => void;
  setCategoryRenameId: (id: string | null) => void;
  setHideOnBlur: (enabled: boolean) => void;
  setDockToggle: (enabled: boolean) => void;
  setAutostartEnabled: (enabled: boolean) => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  navType: "platform",
  currentPlatformId: null,
  currentCategoryId: null,
  searchQuery: "",
  searchScope: "current",
  selectedResultIndex: -1,
  densityMode: "comfortable",
  sortMode: "createdAt",
  themeMode: "system",
  locale: "zh-CN",
  settingsOpen: false,
  hideOnBlur: false,
  dockToggle: false,
  autostartEnabled: false,
  platformRenameId: null,
  categoryRenameId: null,
  commandModal: null,
  deleteConfirmCommandId: null,

  setNavType: (navType) =>
    set({
      navType,
      currentCategoryId: null,
      currentPlatformId: navType === "platform" ? get().currentPlatformId : null,
      sortMode: "createdAt",
    }),
  setCurrentPlatform: (platformId) =>
    set({
      currentPlatformId: platformId,
      currentCategoryId: null,
      navType: "platform",
    }),
  setCurrentCategory: (categoryId) => set({ currentCategoryId: categoryId }),
  setSearchQuery: (query) => set({ searchQuery: query, selectedResultIndex: -1 }),
  setSearchScope: (scope) => set({ searchScope: scope }),
  setSelectedResultIndex: (index) => set({ selectedResultIndex: index }),
  openCreateCommandModal: (initialTitle) =>
    set({ commandModal: { type: "create", initialTitle } }),
  openEditCommandModal: (commandId) =>
    set({ commandModal: { type: "edit", commandId } }),
  closeCommandModal: () => set({ commandModal: null }),
  openDeleteConfirm: (commandId) => set({ deleteConfirmCommandId: commandId }),
  closeDeleteConfirm: () => set({ deleteConfirmCommandId: null }),
  toggleDensityMode: () =>
    set({ densityMode: get().densityMode === "comfortable" ? "compact" : "comfortable" }),
  setSortMode: (mode) => set({ sortMode: mode }),
  setThemeMode: (mode) => set({ themeMode: mode }),
  setLocale: (locale) => set({ locale }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  setPlatformRenameId: (id) => set({ platformRenameId: id }),
  setCategoryRenameId: (id) => set({ categoryRenameId: id }),
  setHideOnBlur: (enabled) => set({ hideOnBlur: enabled }),
  setDockToggle: (enabled) => set({ dockToggle: enabled }),
  setAutostartEnabled: (enabled) => set({ autostartEnabled: enabled }),
}));
