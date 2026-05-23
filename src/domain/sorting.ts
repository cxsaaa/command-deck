import type { Command, NavType, SortMode } from "./types";

export function sortCommands(
  commands: Command[],
  _navType: NavType,
  sortMode: SortMode = "createdAt",
): Command[] {
  const sorted = [...commands];

  switch (sortMode) {
    case "createdAt":
      sorted.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      break;

    case "usageCount":
      sorted.sort((a, b) => {
        if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
        return b.createdAt.localeCompare(a.createdAt);
      });
      break;

    case "favoritedAt":
      // Favorites first, then by createdAt desc
      sorted.sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        return b.createdAt.localeCompare(a.createdAt);
      });
      break;
  }

  return sorted;
}
