import { forwardRef } from "react";
import { Search, X } from "lucide-react";
import { useUiStore } from "../../state/uiStore";

export const SearchInput = forwardRef<HTMLInputElement>(function SearchInput(
  _props,
  ref,
) {
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors"
      style={{
        backgroundColor: "var(--color-bg-subtle)",
        border: "1px solid var(--color-border)",
      }}
    >
      <Search
        size={16}
        style={{ color: "var(--color-text-placeholder)", flexShrink: 0 }}
      />
      <input
        ref={ref}
        type="text"
        placeholder="搜索命令、描述、标签、参数..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="flex-1 bg-transparent outline-none text-sm"
        style={{
          color: "var(--color-text-primary)",
          border: "none",
        }}
        onFocus={(e) => {
          e.currentTarget.parentElement!.style.borderColor =
            "var(--color-accent)";
          e.currentTarget.parentElement!.style.boxShadow =
            "0 0 0 2px var(--color-accent-soft)";
        }}
        onBlur={(e) => {
          e.currentTarget.parentElement!.style.borderColor =
            "var(--color-border)";
          e.currentTarget.parentElement!.style.boxShadow = "none";
        }}
      />
      {searchQuery.length > 0 && (
        <button
          type="button"
          onClick={() => {
            setSearchQuery("");
            if (ref && "current" in ref && ref.current) ref.current.focus();
          }}
          className="shrink-0 cursor-pointer"
          style={{ color: "var(--color-text-placeholder)", background: "none", border: "none", padding: 0, display: "flex" }}
          aria-label="清除搜索"
        >
          <X size={14} />
        </button>
      )}
      <kbd
        className="text-xs px-1.5 py-0.5 rounded shrink-0"
        style={{
          backgroundColor: "var(--color-bg-hover)",
          color: "var(--color-text-tertiary)",
        }}
      >
        ⌘K
      </kbd>
    </div>
  );
});
