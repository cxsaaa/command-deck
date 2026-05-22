import { create } from "zustand";

export type NavType = "all" | "favorites" | "recent" | "platform";
export type SearchScope = "current" | "global";

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
}

export const useUiStore = create<UiState>((set) => ({
  navType: "platform",
  currentPlatformId: null,
  currentCategoryId: null,
  searchQuery: "",
  searchScope: "current",
  selectedResultIndex: -1,
  commandModal: null,
  deleteConfirmCommandId: null,

  setNavType: (navType) => set({ navType, currentCategoryId: null }),
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
}));
