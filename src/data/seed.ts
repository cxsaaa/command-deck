import type Database from "@tauri-apps/plugin-sql";
import i18next from "i18next";
import { getSeedData } from "./seedData";

export async function seedIfEmpty(db: Database): Promise<void> {
  const rows = await db.select<{ count: number }[]>("SELECT COUNT(*) as count FROM platforms");

  if (rows[0]?.count > 0) {
    return;
  }

  const locale = i18next.language;
  const { platforms, categories, commands } = getSeedData(locale);

  const now = new Date().toISOString();

  // Insert platforms
  for (let i = 0; i < platforms.length; i++) {
    const p = platforms[i];
    await db.execute(
      `INSERT INTO platforms (id, name, icon, color, description, sort_order, is_visible, sort_index, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 1, $7, $8, $8)`,
      [p.id, p.name, p.icon, p.color, p.description, p.sortOrder, i, now],
    );
  }

  // Insert categories
  for (const c of categories) {
    await db.execute(
      `INSERT INTO categories (id, platform_id, name, sort_order)
       VALUES ($1, $2, $3, $4)`,
      [c.id, c.platformId, c.name, c.sortOrder],
    );
  }

  // Insert commands with related data
  for (const cmd of commands) {
    await db.execute(
      `INSERT INTO commands (id, title, command, description, platform_id, category_id, notes, is_favorite, usage_count, last_used_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, NULL, $8, $8)`,
      [
        cmd.id,
        cmd.title,
        cmd.command,
        cmd.description,
        cmd.platformId,
        cmd.categoryId,
        cmd.notes,
        now,
      ],
    );

    // Insert tags (upsert to avoid duplicates)
    for (const tagName of cmd.tags) {
      const tagId = `tag_${tagName}`;
      await db.execute(`INSERT OR IGNORE INTO tags (id, name) VALUES ($1, $2)`, [tagId, tagName]);
      await db.execute(`INSERT OR IGNORE INTO command_tags (command_id, tag_id) VALUES ($1, $2)`, [
        cmd.id,
        tagId,
      ]);
    }

    // Insert examples
    for (let i = 0; i < cmd.examples.length; i++) {
      await db.execute(
        `INSERT INTO command_examples (id, command_id, example, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [`${cmd.id}_ex_${i}`, cmd.id, cmd.examples[i], i],
      );
    }

    // Insert parameters
    for (let i = 0; i < cmd.parameters.length; i++) {
      await db.execute(
        `INSERT INTO command_parameters (id, command_id, name, description, sort_order)
         VALUES ($1, $2, $3, $4, $5)`,
        [`${cmd.id}_param_${i}`, cmd.id, cmd.parameters[i].name, cmd.parameters[i].description, i],
      );
    }
  }
}
