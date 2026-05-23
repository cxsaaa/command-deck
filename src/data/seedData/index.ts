import { platformStructure } from "./basePlatforms";
import { categoryStructure } from "./baseCategories";
import { commandStructure } from "./baseCommands";
import { zhCN } from "./localizations/zh-CN";
import { enUS } from "./localizations/en-US";
import type { SeedPlatform, SeedCategory, SeedCommand } from "./types";

export function getSeedData(locale: string): {
  platforms: SeedPlatform[];
  categories: SeedCategory[];
  commands: SeedCommand[];
} {
  const loc = locale.startsWith("en") ? enUS : zhCN;

  const platforms: SeedPlatform[] = platformStructure.map((p) => ({
    id: p.id,
    name: loc.platforms[p.id as keyof typeof loc.platforms].name,
    icon: p.icon,
    color: p.color,
    description: loc.platforms[p.id as keyof typeof loc.platforms].description,
    sortOrder: p.sortOrder,
  }));

  const categories: SeedCategory[] = categoryStructure.map((c) => ({
    id: c.id,
    platformId: c.platformId,
    name: loc.categories[c.id as keyof typeof loc.categories].name,
    sortOrder: c.sortOrder,
  }));

  const commands: SeedCommand[] = commandStructure.map((cmd) => {
    const cmdLoc = loc.commands[cmd.id as keyof typeof loc.commands];
    return {
      id: cmd.id,
      title: cmdLoc.title,
      command: cmd.command,
      description: cmdLoc.description,
      platformId: cmd.platformId,
      categoryId: cmd.categoryId,
      tags: [...cmdLoc.tags],
      examples: [...cmd.examples],
      parameters: cmd.parameters.map((p) => ({
        name: p.name,
        description: cmdLoc.parameters[p.name as keyof typeof cmdLoc.parameters] ?? p.name,
      })),
      notes: cmdLoc.notes,
    };
  });

  return { platforms, categories, commands };
}
