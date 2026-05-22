import { useRef, useCallback, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AppShell } from "./components/layout/AppShell";
import { TopBar } from "./components/layout/TopBar";
import { Sidebar } from "./components/layout/Sidebar";
import { CategoryTabs } from "./components/platform/CategoryTabs";
import { CommandList } from "./components/command/CommandList";
import { ContentHeader } from "./components/command/ContentHeader";
import { CommandFormModal } from "./components/command/CommandFormModal";
import { DeleteConfirmModal } from "./components/command/DeleteConfirmModal";
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

  const queryClient = useQueryClient();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Build the filter for the current view
  const filter: CommandFilter = useMemo(
    () => ({
      navType,
      platformId: currentPlatformId,
      categoryId: currentCategoryId,
      searchQuery: searchQuery.trim() || undefined,
      searchScope:
        navType === "platform" && currentPlatformId ? "current" : "global",
    }),
    [navType, currentPlatformId, currentCategoryId, searchQuery],
  );

  // Fetch commands
  const { data: rawCommands } = useQuery({
    queryKey: queryKeys.commands(filter as unknown as Record<string, unknown>),
    queryFn: () => commandRepository.listCommands(filter),
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
        const { writeText } = await import(
          "@tauri-apps/plugin-clipboard-manager"
        );
        await writeText(command.command);
        await commandRepository.recordCommandCopied(command.id);
        toast("已复制", "success");
        await queryClient.invalidateQueries();
      } catch {
        toast("复制失败", "error");
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
        topBar={<TopBar />}
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
                title="未找到匹配结果"
                description={`没有找到与 "${searchQuery}" 相关的命令`}
              />
            ) : navType === "platform" ? (
              <EmptyState
                icon={<Terminal size={40} />}
                title="暂无命令"
                description="添加第一条命令开始使用"
                action={{
                  label: "新建命令",
                  onClick: () => openCreateCommandModal(),
                }}
              />
            ) : navType === "favorites" ? (
              <EmptyState
                title="暂无收藏"
                description="收藏常用命令，方便快速查找"
              />
            ) : navType === "recent" ? (
              <EmptyState
                title="暂无最近使用"
                description="使用过的命令会显示在这里"
              />
            ) : (
              <EmptyState
                title="暂无命令"
                description="添加第一条命令开始使用"
                action={{
                  label: "新建命令",
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
    </>
  );
}

export default App;
