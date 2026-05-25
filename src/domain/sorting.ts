import type { Command, NavType, SortMode } from "./types";

export function sortCommands(
  commands: Command[],
  _navType: NavType,
  sortMode: SortMode = "createdAt",
): Command[] {
  const sorted = [...commands];

  switch (sortMode) {
    case "createdAt":
      sorted.sort((a, b) => {
        const cmp = b.createdAt.localeCompare(a.createdAt);
        if (cmp !== 0) return cmp;
        return a.id.localeCompare(b.id);
      });
      break;

    case "usageCount":
      sorted.sort((a, b) => {
        if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
        const cmp = b.createdAt.localeCompare(a.createdAt);
        if (cmp !== 0) return cmp;
        return a.id.localeCompare(b.id);
      });
      break;

    case "favoritedAt":
      sorted.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        const cmp = b.createdAt.localeCompare(a.createdAt);
        if (cmp !== 0) return cmp;
        return a.id.localeCompare(b.id);
      });
      break;
  }

  return sorted;
}
