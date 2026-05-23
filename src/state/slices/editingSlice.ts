import type { StateCreator } from "zustand";

export interface EditingState {
  platformRenameId: string | null;
  categoryRenameId: string | null;
  setPlatformRenameId: (id: string | null) => void;
  setCategoryRenameId: (id: string | null) => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createEditingSlice: StateCreator<any, [], [], EditingState> = (set) => ({
  platformRenameId: null,
  categoryRenameId: null,
  setPlatformRenameId: (id) => set({ platformRenameId: id }),
  setCategoryRenameId: (id) => set({ categoryRenameId: id }),
});
