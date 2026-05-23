import type { StateCreator } from "zustand";

export type SearchScope = "current" | "global";

export interface SearchState {
  searchQuery: string;
  searchScope: SearchScope;
  selectedResultIndex: number;
  setSearchQuery: (query: string) => void;
  setSearchScope: (scope: SearchScope) => void;
  setSelectedResultIndex: (index: number) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createSearchSlice: StateCreator<any, [], [], SearchState> = (set) => ({
  searchQuery: "",
  searchScope: "current",
  selectedResultIndex: -1,
  setSearchQuery: (query) => set({ searchQuery: query, selectedResultIndex: -1 }),
  setSearchScope: (scope) => set({ searchScope: scope }),
  setSelectedResultIndex: (index) => set({ selectedResultIndex: index }),
});
