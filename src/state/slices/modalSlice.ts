import type { StateCreator } from "zustand";

export interface CommandModalState {
  type: "create" | "edit";
  commandId?: string;
  initialTitle?: string;
}

export interface ModalState {
  commandModal: CommandModalState | null;
  deleteConfirmCommandId: string | null;
  openCreateCommandModal: (initialTitle?: string) => void;
  openEditCommandModal: (commandId: string) => void;
  closeCommandModal: () => void;
  openDeleteConfirm: (commandId: string) => void;
  closeDeleteConfirm: () => void;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createModalSlice: StateCreator<any, [], [], ModalState> = (set) => ({
  commandModal: null,
  deleteConfirmCommandId: null,
  openCreateCommandModal: (initialTitle) => set({ commandModal: { type: "create", initialTitle } }),
  openEditCommandModal: (commandId) => set({ commandModal: { type: "edit", commandId } }),
  closeCommandModal: () => set({ commandModal: null }),
  openDeleteConfirm: (commandId) => set({ deleteConfirmCommandId: commandId }),
  closeDeleteConfirm: () => set({ deleteConfirmCommandId: null }),
});
