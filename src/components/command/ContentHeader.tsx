import { ArrowUpDown, Calendar, BarChart3, Star } from "lucide-react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { useUiStore } from "../../state/uiStore";
import { useQuery } from "@tanstack/react-query";
import * as platformRepository from "../../data/repositories/platformRepository";
import { queryKeys } from "../../state/queryKeys";
import type { SortMode } from "../../domain/types";

interface ContentHeaderProps {
  count: number;
}

interface SortOption {
  mode: SortMode;
  label: string;
  icon: React.ReactNode;
  showIn: ("platform" | "all" | "favorites" | "recent")[];
}

const sortOptions: SortOption[] = [
  { mode: "createdAt", label: "按创建时间", icon: <Calendar size={14} />, showIn: ["platform", "all", "favorites", "recent"] },
  { mode: "usageCount", label: "按使用次数", icon: <BarChart3 size={14} />, showIn: ["platform", "all", "favorites", "recent"] },
  { mode: "favoritedAt", label: "按收藏时间", icon: <Star size={14} />, showIn: ["favorites"] },
];

export function ContentHeader({ count }: ContentHeaderProps) {
  const navType = useUiStore((s) => s.navType);
  const currentPlatformId = useUiStore((s) => s.currentPlatformId);
  const searchQuery = useUiStore((s) => s.searchQuery);
  const sortMode = useUiStore((s) => s.sortMode);
  const setSortMode = useUiStore((s) => s.setSortMode);

  const { data: platforms } = useQuery({
    queryKey: queryKeys.platforms,
    queryFn: platformRepository.listPlatforms,
  });

  const currentPlatform = platforms?.find((p) => p.id === currentPlatformId);

  let title = "";
  let unit = "条命令";

  if (searchQuery.trim()) {
    title = `搜索结果：${searchQuery}`;
    unit = "条结果";
  } else if (navType === "platform" && currentPlatform) {
    title = currentPlatform.name;
  } else if (navType === "all") {
    title = "全部命令";
  } else if (navType === "favorites") {
    title = "收藏";
  } else if (navType === "recent") {
    title = "最近使用";
  }

  const availableOptions = sortOptions.filter((o) => o.showIn.includes(navType));
  const currentLabel = availableOptions.find((o) => o.mode === sortMode)?.label ?? "排序";

  return (
    <div className="flex items-center gap-2 px-4 pt-3 pb-1">
      <h2
        className="text-lg font-semibold"
        style={{ color: "var(--color-text-primary)" }}
      >
        {title}
      </h2>
      <span
        className="text-sm"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        {count} {unit}
      </span>
      <div className="flex-1" />
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>
          <button
            type="button"
            className="flex items-center gap-1 px-2 py-1 rounded-md text-xs cursor-pointer transition-colors"
            style={{
              color: "var(--color-text-tertiary)",
              background: "none",
              border: "none",
            }}
          >
            <ArrowUpDown size={14} />
            <span>{currentLabel}</span>
          </button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            className="min-w-[140px] rounded-lg p-1 shadow-lg z-50"
            style={{
              backgroundColor: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
            }}
            sideOffset={4}
          >
            {availableOptions.map((option) => (
              <DropdownMenu.Item
                key={option.mode}
                className="flex items-center gap-2 px-2 py-1.5 rounded-md text-sm cursor-pointer outline-none transition-colors"
                style={{
                  color: sortMode === option.mode ? "var(--color-accent)" : "var(--color-text-secondary)",
                  backgroundColor: sortMode === option.mode ? "var(--color-accent-soft)" : "transparent",
                }}
                onSelect={() => setSortMode(option.mode)}
              >
                {option.icon}
                <span>{option.label}</span>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>
  );
}
