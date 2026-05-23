import { useRef, useCallback, useMemo, useEffect } from "react";
import { useTranslation } from "react-i18next";
import i18n from "./i18n";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { invoke } from "@tauri-apps/api/core";
import { AppShell } from "./components/layout/AppShell";
import { TopBar } from "./components/layout/TopBar";
import { Sidebar } from "./components/layout/Sidebar";
import { CategoryTabs } from "./components/platform/CategoryTabs";
import { CommandList } from "./components/command/CommandList";
import { ContentHeader } from "./components/command/ContentHeader";
import { CommandFormModal } from "./components/command/CommandFormModal";
import { DeleteConfirmModal } from "./components/command/DeleteConfirmModal";
import { SettingsModal } from "./components/settings/SettingsModal";
import { EmptyState } from "./components/common";
import { toast } from "./components/common/Toast";
import { useUiStore } from "./state/uiStore";
import { queryKeys } from "./state/queryKeys";
import * as commandRepository from "./data/repositories/commandRepository";
import { searchCommands as clientSearch } from "./domain/search";
import { sortCommands } from "./domain/sorting";
import { useGlobalKeyboard } from "./app/keyboard";
import { Terminal, Search } from "lucide-react";
import type { Command, CommandFilter } from "./domain/types";

function App() {
  const { t } = useTranslation();
  const navType = useUiStore((s) => s.navType);
  const currentPlatformId = useUiStore((s) => s.currentPlatformId);
  const currentCategoryId = useUiStore((s) => s.currentCategoryId);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const selectedResultIndex = useUiStore((s) => s.selectedResultIndex);
  const openCreateCommandModal = useUiStore((s) => s.openCreateCommandModal);
  const commandModal = useUiStore((s) => s.commandModal);
  const closeCommandModal = useUiStore((s) => s.closeCommandModal);
  const deleteConfirmCommandId = useUiStore((s) => s.deleteConfirmCommandId);
  const closeDeleteConfirm = useUiStore((s) => s.closeDeleteConfirm);
  const densityMode = useUiStore((s) => s.densityMode);
  const sortMode = useUiStore((s) => s.sortMode);
  const themeMode = useUiStore((s) => s.themeMode);
  const locale = useUiStore((s) => s.locale);
  const settingsOpen = useUiStore((s) => s.settingsOpen);
  const closeSettings = useUiStore((s) => s.closeSettings);
  const hideOnBlur = useUiStore((s) => s.hideOnBlur);

  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const globalHotkey = useUiStore((s) => s.globalHotkey);

  // Register global hotkey on app start
  useEffect(() => {
    const registerHotkey = async () => {
      try {
        await invoke("register_global_shortcut", { shortcut: globalHotkey });
        console.log("Global hotkey registered:", globalHotkey);
      } catch (err) {
        console.error("Failed to register global hotkey:", err);
      }
    };
    registerHotkey();
  }, [globalHotkey]);

  // Theme effect: apply data-theme to <html>
  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      root.setAttribute("data-theme", prefersDark ? "dark" : "light");
    } else {
      root.setAttribute("data-theme", themeMode);
    }
  }, [themeMode]);

  // Listen for system theme changes when in "system" mode
  useEffect(() => {
    if (themeMode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute("data-theme", e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [themeMode]);

  // Locale effect: sync i18n language with store
  useEffect(() => {
    i18n.changeLanguage(locale);
  }, [locale]);

  // Hide on blur effect
  useEffect(() => {
    if (!hideOnBlur) return;
    let unlisten: (() => void) | undefined;
    import("@tauri-apps/api/window").then(({ getCurrentWindow }) => {
      const win = getCurrentWindow();
      win
        .onFocusChanged(({ payload: focused }) => {
          if (!focused) win.hide();
        })
        .then((fn) => {
          unlisten = fn;
        });
    });
    return () => {
      unlisten?.();
    };
  }, [hideOnBlur]);

  // Build the filter for the current view
  const filter: CommandFilter = useMemo(
    () => ({
      navType,
      platformId: currentPlatformId,
      categoryId: currentCategoryId,
      searchQuery: searchQuery.trim() || undefined,
      searchScope: navType === "platform" && currentPlatformId ? "current" : "global",
    }),
    [navType, currentPlatformId, currentCategoryId, searchQuery],
  );

  // Fetch commands
  const { data: rawCommands } = useQuery({
    queryKey: queryKeys.commands(filter as unknown as Record<string, unknown>),
    queryFn: () => commandRepository.listCommands(filter),
    placeholderData: keepPreviousData,
  });

  // Apply client-side search/sorting
  const commands: Command[] = useMemo(() => {
    if (!rawCommands) return [];
    const sorted = sortCommands(rawCommands, navType, sortMode);
    if (searchQuery.trim()) {
      return clientSearch(sorted, searchQuery, filter);
    }
    return sorted;
  }, [rawCommands, searchQuery, filter, navType, sortMode]);

  // Copy handler (also used by keyboard shortcuts)
  const handleCopyCommand = useCallback(
    async (command: Command) => {
      try {
        const { writeText } = await import("@tauri-apps/plugin-clipboard-manager");
        await writeText(command.command);
        await commandRepository.recordCommandCopied(command.id);
        toast(t("command.copied"), "success");
        await queryClient.invalidateQueries();
      } catch {
        toast(t("command.copyFailed"), "error");
      }
    },
    [queryClient],
  );

  // Global keyboard shortcuts
  useGlobalKeyboard(searchInputRef, commands, handleCopyCommand);

  // Determine empty state
  const showSearchResults = searchQuery.trim().length > 0;
  const isEmpty = commands.length === 0;

  return (
    <>
      <AppShell
        topBar={<TopBar searchInputRef={searchInputRef} />}
        sidebar={<Sidebar />}
        header={<CategoryTabs />}
        density={densityMode}
      >
        {/* Content header - scrolls with content */}
        <ContentHeader count={commands.length} />

        {/* Command list or empty state */}
        {isEmpty ? (
          <div className="flex-1 flex items-center justify-center px-4 pb-8">
            {showSearchResults ? (
              <EmptyState
                icon={<Search size={40} />}
                title={t("emptyState.noResults")}
                description={t("emptyState.noResultsDesc", { query: searchQuery })}
              />
            ) : navType === "platform" ? (
              <EmptyState
                icon={<Terminal size={40} />}
                title={t("emptyState.noCommands")}
                description={t("emptyState.noCommandsDesc")}
                action={{
                  label: t("emptyState.createCommand"),
                  onClick: () => openCreateCommandModal(),
                }}
              />
            ) : navType === "favorites" ? (
              <EmptyState
                title={t("emptyState.noFavorites")}
                description={t("emptyState.noFavoritesDesc")}
              />
            ) : navType === "recent" ? (
              <EmptyState
                title={t("emptyState.noRecent")}
                description={t("emptyState.noRecentDesc")}
              />
            ) : (
              <EmptyState
                title={t("emptyState.noCommands")}
                description={t("emptyState.noCommandsDesc")}
                action={{
                  label: t("emptyState.createCommand"),
                  onClick: () => openCreateCommandModal(),
                }}
              />
            )}
          </div>
        ) : (
          <CommandList
            commands={commands}
            selectedResultIndex={showSearchResults ? selectedResultIndex : -1}
            searchQuery={showSearchResults ? searchQuery : undefined}
          />
        )}
      </AppShell>

      {/* Command create/edit modal */}
      {commandModal && (
        <CommandFormModal
          open
          onClose={closeCommandModal}
          mode={commandModal.type}
          commandId={commandModal.commandId}
          initialTitle={commandModal.initialTitle}
        />
      )}

      {/* Delete confirmation modal */}
      <DeleteConfirmModal
        open={!!deleteConfirmCommandId}
        commandId={deleteConfirmCommandId}
        onClose={closeDeleteConfirm}
      />

      {/* Settings modal */}
      <SettingsModal open={settingsOpen} onClose={closeSettings} />
    </>
  );
}

export default App;
