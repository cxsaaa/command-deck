import type { Command, NavType } from "./types";

export function sortCommands(commands: Command[], navType: NavType): Command[] {
  const sorted = [...commands];

  switch (navType) {
    case "platform":
    case "all":
      sorted.sort((a, b) => {
        // Favorite first
        if (a.isFavorite !== b.isFavorite) return a.isFavorite ? -1 : 1;
        // Last used descending
        const aDate = a.lastUsedAt ?? "";
        const bDate = b.lastUsedAt ?? "";
        if (aDate !== bDate) return bDate.localeCompare(aDate);
        // Usage count descending
        if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
        // Category order
        const aCat = a.categoryName ?? "";
        const bCat = b.categoryName ?? "";
        if (aCat !== bCat) return aCat.localeCompare(bCat);
        // Title ascending
        return a.title.localeCompare(b.title);
      });
      break;

    case "favorites":
      sorted.sort((a, b) => {
        // Last used descending
        const aDate = a.lastUsedAt ?? "";
        const bDate = b.lastUsedAt ?? "";
        if (aDate !== bDate) return bDate.localeCompare(aDate);
        // Usage count descending
        if (a.usageCount !== b.usageCount) return b.usageCount - a.usageCount;
        // Platform name
        return a.platformName.localeCompare(b.platformName);
      });
      break;

    case "recent":
      sorted.sort((a, b) => {
        const aDate = a.lastUsedAt ?? "";
        const bDate = b.lastUsedAt ?? "";
        return bDate.localeCompare(aDate);
      });
      break;
  }

  return sorted;
}
