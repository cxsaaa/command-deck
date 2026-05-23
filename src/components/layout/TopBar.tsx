import type { RefObject } from "react";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Plus, Settings } from "lucide-react";
import { IconButton } from "../common";
import { SearchInput } from "../search/SearchInput";
import { useUiStore } from "../../state/uiStore";

interface TopBarProps {
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export function TopBar({ searchInputRef }: TopBarProps) {
  const { t } = useTranslation();
  const openCreateCommandModal = useUiStore((s) => s.openCreateCommandModal);
  const openSettings = useUiStore((s) => s.openSettings);

  const handleDrag = useCallback(async (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("button, input, a")) return;
    const { getCurrentWebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const win = getCurrentWebviewWindow();
    await win.startDragging();
  }, []);

  return (
    <header
      data-tauri-drag-region
      onMouseDown={handleDrag}
      className="flex items-center border-b shrink-0"
      style={{
        height: "40px",
        paddingLeft: "78px",
        paddingRight: "16px",
        backgroundColor: "var(--color-bg-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Center: Search Box */}
      <div className="flex-1 flex justify-center">
        <div className="w-full max-w-sm">
          <SearchInput ref={searchInputRef} />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <IconButton
          icon={<Plus size={18} />}
          tooltip={t("topBar.create")}
          onClick={() => openCreateCommandModal()}
        />
        <IconButton
          icon={<Settings size={18} />}
          tooltip={t("topBar.settings")}
          onClick={openSettings}
        />
      </div>
    </header>
  );
}
