import type { StateCreator } from "zustand";

export type NavType = "all" | "favorites" | "recent" | "platform";

export interface NavigationState {
  navType: NavType;
  currentPlatformId: string | null;
  currentCategoryId: string | null;
  setNavType: (navType: NavType) => void;
  setCurrentPlatform: (platformId: string | null) => void;
  setCurrentCategory: (categoryId: string | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createNavigationSlice: StateCreator<any, [], [], NavigationState> = (set, get) => ({
  navType: "platform",
  currentPlatformId: null,
  currentCategoryId: null,
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
});
