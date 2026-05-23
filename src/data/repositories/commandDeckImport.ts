import { getDb } from "../db";
import { saveRelatedData } from "./commandCrud";

export interface ImportDeckResult {
  imported: number;
  skipped: number;
}

export async function importDeck(deckData: {
  platforms: { id: string; name: string; icon: string; sort_order: number }[];
  categories: { id: string; platform_id: string; name: string; sort_order: number }[];
  commands: {
    title: string;
    command: string;
    description: string | null;
    tags: string[];
    examples: string[];
    parameters: { name: string; description: string }[];
    notes: string | null;
    is_favorite: boolean;
  }[];
}): Promise<ImportDeckResult> {
  const db = await getDb();

  let imported = 0;
  let skipped = 0;

  await db.execute("BEGIN TRANSACTION");

  try {
    // Process platforms
    const platformIdMap = new Map<string, string>();
    for (const platform of deckData.platforms) {
      const existingPlatform = await db.select<{ id: string }[]>(
        "SELECT id FROM platforms WHERE name = $1",
        [platform.name],
      );

      let platformId: string;
      if (existingPlatform.length > 0) {
        platformId = existingPlatform[0].id;
      } else {
        platformId = crypto.randomUUID();
        await db.execute(
          "INSERT INTO platforms (id, name, icon, sort_order, created_at) VALUES ($1, $2, $3, $4, $5)",
          [platformId, platform.name, platform.icon, platform.sort_order, new Date().toISOString()],
        );
      }
      platformIdMap.set(platform.id, platformId);
    }

    // Process categories
    const categoryIdMap = new Map<string, string>();
    for (const category of deckData.categories) {
      const platformId = platformIdMap.get(category.platform_id);
      if (!platformId) continue;

      const existingCategory = await db.select<{ id: string }[]>(
        "SELECT id FROM categories WHERE name = $1 AND platform_id = $2",
        [category.name, platformId],
      );

      let categoryId: string;
      if (existingCategory.length > 0) {
        categoryId = existingCategory[0].id;
      } else {
        categoryId = crypto.randomUUID();
        await db.execute(
          "INSERT INTO categories (id, platform_id, name, sort_order, created_at) VALUES ($1, $2, $3, $4, $5)",
          [categoryId, platformId, category.name, category.sort_order, new Date().toISOString()],
        );
      }
      categoryIdMap.set(category.id, categoryId);
    }

    // Process commands
    for (const command of deckData.commands) {
      // Check for duplicate command text
      const existingCommand = await db.select<{ id: string }[]>(
        "SELECT id FROM commands WHERE command = $1",
        [command.command],
      );

      if (existingCommand.length > 0) {
        skipped++;
        continue;
      }

      // Find or create category
      let categoryId: string | null = null;
      // Try to find category by name in the first platform
      const firstPlatformId = platformIdMap.values().next().value;
      if (firstPlatformId) {
        const uncategorized = await db.select<{ id: string }[]>(
          "SELECT id FROM categories WHERE platform_id = $1 AND name = 'Uncategorized'",
          [firstPlatformId],
        );
        if (uncategorized.length > 0) {
          categoryId = uncategorized[0].id;
        }
      }

      const commandId = crypto.randomUUID();
      const now = new Date().toISOString();

      await db.execute(
        `INSERT INTO commands (id, title, command, description, platform_id, category_id, notes, is_favorite, usage_count, last_used_at, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 0, NULL, $9, $9)`,
        [
          commandId,
          command.title,
          command.command,
          command.description,
          firstPlatformId,
          categoryId,
          command.notes,
          command.is_favorite ? 1 : 0,
          now,
        ],
      );

      // Reuse saveRelatedData for tags, examples, and parameters
      await saveRelatedData(db, commandId, {
        title: command.title,
        command: command.command,
        platformId: firstPlatformId!,
        categoryId,
        description: command.description ?? undefined,
        tags: command.tags,
        examples: command.examples,
        parameters: command.parameters,
        notes: command.notes ?? undefined,
      });

      imported++;
    }

    await db.execute("COMMIT");
  } catch (error) {
    await db.execute("ROLLBACK");
    throw error;
  }

  return { imported, skipped };
}
