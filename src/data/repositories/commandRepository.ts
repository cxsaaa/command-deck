import { getDb } from "../db";
import type { Command, CommandInput, CommandFilter } from "../../domain/types";

interface CommandRow {
  id: string;
  title: string;
  command: string;
  description: string | null;
  platform_id: string;
  platform_name: string;
  category_id: string | null;
  category_name: string | null;
  notes: string | null;
  is_favorite: number;
  usage_count: number;
  last_used_at: string | null;
  created_at: string;
  updated_at: string;
}

interface TagRow {
  command_id: string;
  tag_name: string;
}

interface ExampleRow {
  command_id: string;
  example: string;
  sort_order: number;
}

interface ParameterRow {
  command_id: string;
  name: string;
  description: string;
  sort_order: number;
}

export async function listCommands(filter: CommandFilter): Promise<Command[]> {
  const db = await getDb();

  let whereClause = "WHERE 1=1";
  const params: unknown[] = [];

  if (filter.navType === "platform" && filter.platformId) {
    params.push(filter.platformId);
    whereClause += ` AND c.platform_id = $${params.length}`;
  }

  if (filter.navType === "favorites") {
    whereClause += " AND c.is_favorite = 1";
  }

  if (filter.navType === "recent") {
    whereClause += " AND c.last_used_at IS NOT NULL";
  }

  if (filter.categoryId) {
    params.push(filter.categoryId);
    whereClause += ` AND c.category_id = $${params.length}`;
  }

  if (filter.searchQuery && filter.searchQuery.trim().length > 0) {
    const trimmed = filter.searchQuery.trim();
    // Skip SQL LIKE for pure ASCII queries — they may be pinyin,
    // and LIKE cannot match Chinese text against romanized input.
    // The TS-layer search (searchCommands) handles pinyin scoring.
    const isPureAscii = /^[a-z0-9]+$/i.test(trimmed);
    if (!isPureAscii) {
      const query = `%${trimmed}%`;
      params.push(query, query, query, query);
      whereClause += ` AND (c.title LIKE $${params.length - 3} OR c.command LIKE $${params.length - 2} OR c.description LIKE $${params.length - 1} OR c.notes LIKE $${params.length})`;
    }
  }

  const commandRows = await db.select<CommandRow[]>(
    `SELECT
       c.id, c.title, c.command, c.description,
       c.platform_id, p.name as platform_name,
       c.category_id, cat.name as category_name,
       c.notes, c.is_favorite, c.usage_count,
       c.last_used_at, c.created_at, c.updated_at
     FROM commands c
     JOIN platforms p ON p.id = c.platform_id
     LEFT JOIN categories cat ON cat.id = c.category_id
     ${whereClause}
     ORDER BY c.is_favorite DESC, c.last_used_at DESC, c.usage_count DESC, c.title ASC`,
    params
  );

  if (commandRows.length === 0) return [];

  const commandIds = commandRows.map((r) => r.id);
  const placeholders = commandIds.map((_, i) => `$${i + 1}`).join(", ");

  const [tagRows, exampleRows, parameterRows] = await Promise.all([
    db.select<TagRow[]>(
      `SELECT ct.command_id, t.name as tag_name
       FROM command_tags ct
       JOIN tags t ON t.id = ct.tag_id
       WHERE ct.command_id IN (${placeholders})`,
      commandIds
    ),
    db.select<ExampleRow[]>(
      `SELECT command_id, example, sort_order
       FROM command_examples
       WHERE command_id IN (${placeholders})
       ORDER BY sort_order`,
      commandIds
    ),
    db.select<ParameterRow[]>(
      `SELECT command_id, name, description, sort_order
       FROM command_parameters
       WHERE command_id IN (${placeholders})
       ORDER BY sort_order`,
      commandIds
    ),
  ]);

  const tagMap = new Map<string, string[]>();
  for (const row of tagRows) {
    const existing = tagMap.get(row.command_id) ?? [];
    existing.push(row.tag_name);
    tagMap.set(row.command_id, existing);
  }

  const exampleMap = new Map<string, string[]>();
  for (const row of exampleRows) {
    const existing = exampleMap.get(row.command_id) ?? [];
    existing.push(row.example);
    exampleMap.set(row.command_id, existing);
  }

  const paramMap = new Map<string, { name: string; description: string }[]>();
  for (const row of parameterRows) {
    const existing = paramMap.get(row.command_id) ?? [];
    existing.push({ name: row.name, description: row.description });
    paramMap.set(row.command_id, existing);
  }

  return commandRows.map((row) => ({
    id: row.id,
    title: row.title,
    command: row.command,
    description: row.description,
    platformId: row.platform_id,
    platformName: row.platform_name,
    categoryId: row.category_id,
    categoryName: row.category_name,
    tags: tagMap.get(row.id) ?? [],
    examples: exampleMap.get(row.id) ?? [],
    parameters: paramMap.get(row.id) ?? [],
    notes: row.notes,
    isFavorite: row.is_favorite === 1,
    usageCount: row.usage_count,
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function getCommand(id: string): Promise<Command | null> {
  const commands = await listCommands({ navType: "all" });
  return commands.find((c) => c.id === id) ?? null;
}

export async function searchCommands(
  query: string,
  filter: CommandFilter
): Promise<Command[]> {
  // Use the same listCommands with search applied
  return listCommands({ ...filter, searchQuery: query });
}

export async function createCommand(input: CommandInput): Promise<Command> {
  const db = await getDb();
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.execute(
    `INSERT INTO commands (id, title, command, description, platform_id, category_id, notes, is_favorite, usage_count, last_used_at, created_at, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 0, 0, NULL, $8, $8)`,
    [
      id,
      input.title.trim(),
      input.command.trim(),
      input.description?.trim() ?? null,
      input.platformId,
      input.categoryId ?? null,
      input.notes?.trim() ?? null,
      now,
    ]
  );

  await saveRelatedData(db, id, input);

  // Fetch and return the created command
  const commands = await listCommands({
    navType: "platform",
    platformId: input.platformId,
  });
  const created = commands.find((c) => c.id === id);
  if (!created) throw new Error("Failed to retrieve created command");
  return created;
}

export async function updateCommand(
  id: string,
  input: CommandInput
): Promise<Command> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE commands
     SET title = $1, command = $2, description = $3, platform_id = $4,
         category_id = $5, notes = $6, updated_at = $7
     WHERE id = $8`,
    [
      input.title.trim(),
      input.command.trim(),
      input.description?.trim() ?? null,
      input.platformId,
      input.categoryId ?? null,
      input.notes?.trim() ?? null,
      now,
      id,
    ]
  );

  // Clear existing related data
  await db.execute("DELETE FROM command_tags WHERE command_id = $1", [id]);
  await db.execute("DELETE FROM command_examples WHERE command_id = $1", [id]);
  await db.execute("DELETE FROM command_parameters WHERE command_id = $1", [id]);

  // Re-insert related data
  await saveRelatedData(db, id, input);

  const commands = await listCommands({
    navType: "platform",
    platformId: input.platformId,
  });
  const updated = commands.find((c) => c.id === id);
  if (!updated) throw new Error("Failed to retrieve updated command");
  return updated;
}

export async function deleteCommand(id: string): Promise<void> {
  const db = await getDb();
  // Foreign key cascades handle related data deletion
  await db.execute("DELETE FROM commands WHERE id = $1", [id]);
}

export async function toggleFavorite(id: string): Promise<Command> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE commands
     SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END,
         updated_at = $1
     WHERE id = $2`,
    [now, id]
  );

  const commands = await listCommands({ navType: "all" });
  const updated = commands.find((c) => c.id === id);
  if (!updated) throw new Error("Failed to toggle favorite");
  return updated;
}

export async function recordCommandCopied(id: string): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE commands
     SET usage_count = usage_count + 1,
         last_used_at = $1,
         updated_at = $1
     WHERE id = $2`,
    [now, id]
  );
}

export async function getVariableHistories(
  commandId: string
): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.select<{ variable_name: string; last_value: string }[]>(
    "SELECT variable_name, last_value FROM command_variable_histories WHERE command_id = $1",
    [commandId]
  );
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.variable_name] = row.last_value;
  }
  return result;
}

export async function saveVariableHistories(
  commandId: string,
  values: Record<string, string>
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  // First, delete all existing histories for this command
  await db.execute(
    "DELETE FROM command_variable_histories WHERE command_id = $1",
    [commandId]
  );
  // Then insert only non-empty values
  for (const [name, value] of Object.entries(values)) {
    if (value === "") continue;
    const id = `${commandId}_var_${name}`;
    await db.execute(
      `INSERT INTO command_variable_histories (id, command_id, variable_name, last_value, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, commandId, name, value, now]
    );
  }
}

export async function clearRecentHistory(): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE commands SET usage_count = 0, last_used_at = NULL");
}

export async function factoryReset(): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM command_tags");
  await db.execute("DELETE FROM command_examples");
  await db.execute("DELETE FROM command_parameters");
  await db.execute("DELETE FROM commands");
  await db.execute("DELETE FROM categories");
  await db.execute("DELETE FROM platforms");
  await db.execute("DELETE FROM tags");
  await db.execute("DELETE FROM schema_migrations");
  // Re-initialize
  const { initDatabase } = await import("../db");
  await initDatabase();
}

async function saveRelatedData(
  db: Awaited<ReturnType<typeof getDb>>,
  commandId: string,
  input: CommandInput
): Promise<void> {
  // Tags - upsert
  if (input.tags && input.tags.length > 0) {
    const uniqueTags = [
      ...new Set(input.tags.map((t) => t.trim()).filter((t) => t.length > 0)),
    ];
    for (const tagName of uniqueTags) {
      const tagId = `tag_${tagName}`;
      await db.execute(
        "INSERT OR IGNORE INTO tags (id, name) VALUES ($1, $2)",
        [tagId, tagName]
      );
      await db.execute(
        "INSERT OR IGNORE INTO command_tags (command_id, tag_id) VALUES ($1, $2)",
        [commandId, tagId]
      );
    }
  }

  // Examples
  if (input.examples && input.examples.length > 0) {
    const filtered = input.examples
      .map((e) => e.trim())
      .filter((e) => e.length > 0);
    for (let i = 0; i < filtered.length; i++) {
      await db.execute(
        `INSERT INTO command_examples (id, command_id, example, sort_order)
         VALUES ($1, $2, $3, $4)`,
        [`${commandId}_ex_${i}`, commandId, filtered[i], i]
      );
    }
  }

  // Parameters
  if (input.parameters && input.parameters.length > 0) {
    for (let i = 0; i < input.parameters.length; i++) {
      const p = input.parameters[i];
      if (p.name.trim().length > 0 && p.description.trim().length > 0) {
        await db.execute(
          `INSERT INTO command_parameters (id, command_id, name, description, sort_order)
           VALUES ($1, $2, $3, $4, $5)`,
          [
            `${commandId}_param_${i}`,
            commandId,
            p.name.trim(),
            p.description.trim(),
            i,
          ]
        );
      }
    }
  }
}
