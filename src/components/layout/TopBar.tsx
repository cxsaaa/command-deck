import { useRef } from "react";
import { Plus, Settings, Rows3, LayoutGrid } from "lucide-react";
import { Button, IconButton } from "../common";
import { SearchInput } from "../search/SearchInput";
import { useUiStore } from "../../state/uiStore";

export function TopBar() {
  const searchInputRef = useRef<HTMLInputElement>(null);
  const openCreateCommandModal = useUiStore((s) => s.openCreateCommandModal);
  const densityMode = useUiStore((s) => s.densityMode);
  const toggleDensityMode = useUiStore((s) => s.toggleDensityMode);

  return (
    <header
      className="flex items-center gap-4 px-6 border-b shrink-0"
      style={{
        height: "56px",
        backgroundColor: "var(--color-bg-surface)",
        borderColor: "var(--color-border)",
      }}
    >
      {/* Search Box */}
      <div className="flex-1 max-w-lg">
        <SearchInput ref={searchInputRef} />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="primary"
          size="md"
          onClick={() => openCreateCommandModal()}
        >
          <Plus size={16} />
          <span>新建</span>
        </Button>
        <IconButton
          icon={densityMode === "compact" ? <Rows3 size={18} /> : <LayoutGrid size={18} />}
          tooltip={densityMode === "compact" ? "切换到舒适模式" : "切换到紧凑模式"}
          onClick={toggleDensityMode}
        />
        <IconButton icon={<Settings size={18} />} tooltip="设置" />
      </div>
    </header>
  );
}
