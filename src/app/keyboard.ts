import { useEffect, type RefObject } from "react";
import { useUiStore } from "../state/uiStore";
import type { Command } from "../domain/types";

/**
 * Registers global keyboard shortcuts.
 * Must be called inside a React component (uses useEffect).
 */
export function useGlobalKeyboard(
  searchInputRef: RefObject<HTMLInputElement | null>,
  commands: Command[],
  handleCopyCommand: (command: Command) => void,
) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const store = useUiStore.getState();

      // Skip global shortcuts when a modal is open
      const modalOpen = store.commandModal !== null || store.deleteConfirmCommandId !== null;

      // Esc → close modal first, then clear search
      if (e.key === "Escape") {
        if (store.commandModal) {
          store.closeCommandModal();
          return;
        }
        if (store.deleteConfirmCommandId) {
          store.closeDeleteConfirm();
          return;
        }
        if (store.searchQuery) {
          store.setSearchQuery("");
          searchInputRef.current?.blur();
          return;
        }
      }

      // Don't process other shortcuts while a modal is open
      if (modalOpen) return;

      // ⌘K → focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      // ⌘N → new command
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        store.openCreateCommandModal();
        return;
      }

      // Arrow keys & Enter only when search is active and input is focused
      if (document.activeElement === searchInputRef.current && store.searchQuery.trim()) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          const nextIndex =
            store.selectedResultIndex < commands.length - 1 ? store.selectedResultIndex + 1 : 0;
          store.setSelectedResultIndex(nextIndex);
          return;
        }

        if (e.key === "ArrowUp") {
          e.preventDefault();
          const prevIndex =
            store.selectedResultIndex > 0 ? store.selectedResultIndex - 1 : commands.length - 1;
          store.setSelectedResultIndex(prevIndex);
          return;
        }

        if (e.key === "Enter") {
          e.preventDefault();
          if (store.selectedResultIndex >= 0 && store.selectedResultIndex < commands.length) {
            handleCopyCommand(commands[store.selectedResultIndex]);
          }
          return;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [searchInputRef, commands, handleCopyCommand]);
}
