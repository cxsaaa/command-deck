import { getDb } from "../data/db";
import * as platformRepository from "../data/repositories/platformRepository";
import * as categoryRepository from "../data/repositories/categoryRepository";
import { validateImport, type CommandDeckExport, type ConflictStrategy } from "./importSchema";

export interface ConflictItem {
  type: "platform" | "command";
  name: string;
  platformName?: string;
}

export interface ImportAnalysis {
  platformCount: number;
  categoryCount: number;
  commandCount: number;
  conflicts: ConflictItem[];
}

export async function parseImportJSON(file: File): Promise<CommandDeckExport> {
  const text = await file.text();
  const data = JSON.parse(text);
  const result = validateImport(data);
  if (!result.valid) {
    throw new Error(`Invalid import file:\n${result.errors.join("\n")}`);
  }
  return data as CommandDeckExport;
}

export async function analyzeImport(data: CommandDeckExport): Promise<ImportAnalysis> {
  const existingPlatforms = await platformRepository.listAllPlatforms();
  const existingNames = new Set(existingPlatforms.map((p) => p.name.toLowerCase()));

  const conflicts: ConflictItem[] = [];
  let categoryCount = 0;
  let commandCount = 0;

  for (const platform of data.platforms) {
    if (existingNames.has(platform.name.toLowerCase())) {
      conflicts.push({ type: "platform", name: platform.name });
    }
    for (const cat of platform.categories) {
      categoryCount++;
      commandCount += cat.commands.length;
    }
  }

  return {
    platformCount: data.platforms.length,
    categoryCount,
    commandCount,
    conflicts,
  };
}

export async function applyImport(
  data: CommandDeckExport,
  strategy: ConflictStrategy,
): Promise<{ imported: number; skipped: number }> {
  const db = await getDb();
  const existingPlatforms = await platformRepository.listAllPlatforms();
  const existingPlatformMap = new Map(existingPlatforms.map((p) => [p.name.toLowerCase(), p]));

  let imported = 0;
  let skipped = 0;

  for (const platformData of data.platforms) {
    const existingPlatform = existingPlatformMap.get(platformData.name.toLowerCase());
    let platformId: string;

    if (existingPlatform) {
      if (strategy === "skip") {
        skipped++;
        continue;
      }
      platformId = existingPlatform.id;
    } else {
      // Create new platform
      const newPlatform = await platformRepository.createPlatform(platformData.name);
      platformId = newPlatform.id;
    }

    for (const catData of platformData.categories) {
      // Find or create category
      const categories = await categoryRepository.listCategories(platformId);
      let category = categories.find((c) => c.name.toLowerCase() === catData.name.toLowerCase());

      if (!category) {
        category = await categoryRepository.createCategory(catData.name, platformId);
      }

      for (const cmdData of catData.commands) {
        // Check for existing command with same title in same platform
        const existingCommands = await db.select<{ id: string }[]>(
          "SELECT id FROM commands WHERE platform_id = $1 AND title = $2",
          [platformId, cmdData.title],
        );

        if (existingCommands.length > 0) {
          if (strategy === "skip") {
            skipped++;
            continue;
          }
          if (strategy === "overwrite") {
            // Update existing
            await db.execute(
              `UPDATE commands SET command = $1, description = $2, notes = $3, updated_at = $4 WHERE id = $5`,
              [
                cmdData.command,
                cmdData.description ?? null,
                cmdData.notes ?? null,
                new Date().toISOString(),
                existingCommands[0].id,
              ],
            );
            // Clear and re-insert related data
            await db.execute("DELETE FROM command_tags WHERE command_id = $1", [
              existingCommands[0].id,
            ]);
            await db.execute("DELETE FROM command_examples WHERE command_id = $1", [
              existingCommands[0].id,
            ]);
            await db.execute("DELETE FROM command_parameters WHERE command_id = $1", [
              existingCommands[0].id,
            ]);
            await saveImportRelatedData(db, existingCommands[0].id, cmdData);
            imported++;
            continue;
          }
          // rename strategy: append suffix
          cmdData.title = `${cmdData.title}_imported`;
        }

        // Create new command
        const cmdId = crypto.randomUUID();
        const now = new Date().toISOString();
        await db.execute(
          `INSERT INTO commands (id, title, command, description, platform_id, category_id, notes, is_favorite, usage_count, last_used_at, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, NULL, $8, $8)`,
          [
            cmdId,
            cmdData.title,
            cmdData.command,
            cmdData.description ?? null,
            platformId,
            category.id,
            cmdData.notes ?? null,
            now,
          ],
        );
        await saveImportRelatedData(db, cmdId, cmdData);
        imported++;
      }
    }
  }

  return { imported, skipped };
}

async function saveImportRelatedData(
  db: Awaited<ReturnType<typeof getDb>>,
  commandId: string,
  cmdData: {
    tags?: string[];
    examples?: string[];
    parameters?: { name: string; description: string }[];
  },
): Promise<void> {
  if (cmdData.tags && cmdData.tags.length > 0) {
    for (const tagName of cmdData.tags) {
      const tagId = `tag_${tagName}`;
      await db.execute("INSERT OR IGNORE INTO tags (id, name) VALUES ($1, $2)", [tagId, tagName]);
      await db.execute("INSERT OR IGNORE INTO command_tags (command_id, tag_id) VALUES ($1, $2)", [
        commandId,
        tagId,
      ]);
    }
  }

  if (cmdData.examples && cmdData.examples.length > 0) {
    for (let i = 0; i < cmdData.examples.length; i++) {
      await db.execute(
        "INSERT INTO command_examples (id, command_id, example, sort_order) VALUES ($1, $2, $3, $4)",
        [`${commandId}_ex_${i}`, commandId, cmdData.examples[i], i],
      );
    }
  }

  if (cmdData.parameters && cmdData.parameters.length > 0) {
    for (let i = 0; i < cmdData.parameters.length; i++) {
      const p = cmdData.parameters[i];
      await db.execute(
        "INSERT INTO command_parameters (id, command_id, name, description, sort_order) VALUES ($1, $2, $3, $4, $5)",
        [`${commandId}_param_${i}`, commandId, p.name, p.description, i],
      );
    }
  }
}
