import * as platformRepository from "../data/repositories/platformRepository";
import * as categoryRepository from "../data/repositories/categoryRepository";
import * as commandRepository from "../data/repositories/commandRepository";
import type { CommandDeckExport, ExportPlatform, ExportCategory } from "./importSchema";

export async function exportToJSON(): Promise<void> {
  const platforms = await platformRepository.listAllPlatforms();

  const exportPlatforms: ExportPlatform[] = [];

  for (const platform of platforms) {
    const categories = await categoryRepository.listCategories(platform.id);
    const commands = await commandRepository.listCommands({
      navType: "platform",
      platformId: platform.id,
    });

    // Group commands by category
    const catMap = new Map<string, ExportCategory>();
    for (const cat of categories) {
      catMap.set(cat.id, { name: cat.name, commands: [] });
    }

    for (const cmd of commands) {
      const catId = cmd.categoryId ?? `uncategorized_${platform.id}`;
      const exportCat = catMap.get(catId);
      if (exportCat) {
        exportCat.commands.push({
          title: cmd.title,
          command: cmd.command,
          description: cmd.description ?? undefined,
          tags: cmd.tags.length > 0 ? cmd.tags : undefined,
          examples: cmd.examples.length > 0 ? cmd.examples : undefined,
          parameters: cmd.parameters.length > 0 ? cmd.parameters : undefined,
          notes: cmd.notes ?? undefined,
        });
      }
    }

    exportPlatforms.push({
      name: platform.name,
      icon: platform.icon ?? undefined,
      color: platform.color,
      description: platform.description ?? undefined,
      categories: Array.from(catMap.values()).filter((c) => c.commands.length > 0),
    });
  }

  const data: CommandDeckExport = {
    version: "1.0",
    exportedAt: new Date().toISOString(),
    platforms: exportPlatforms,
  };

  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const date = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `commanddeck-export-${date}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
