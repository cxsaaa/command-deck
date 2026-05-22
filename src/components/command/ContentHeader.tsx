import { useUiStore } from "../../state/uiStore";
import { useQuery } from "@tanstack/react-query";
import * as platformRepository from "../../data/repositories/platformRepository";
import { queryKeys } from "../../state/queryKeys";

interface ContentHeaderProps {
  count: number;
}

export function ContentHeader({ count }: ContentHeaderProps) {
  const navType = useUiStore((s) => s.navType);
  const currentPlatformId = useUiStore((s) => s.currentPlatformId);
  const searchQuery = useUiStore((s) => s.searchQuery);

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

  return (
    <div className="flex items-baseline gap-2 px-4 pt-3 pb-1">
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
    </div>
  );
}
