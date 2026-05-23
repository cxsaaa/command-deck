import { getDb } from "../db";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "../../state/queryKeys";
import type { Command } from "../../domain/types";
import { listCommands } from "./commandCrud";

export async function toggleFavorite(id: string): Promise<Command> {
  const db = await getDb();
  const now = new Date().toISOString();

  await db.execute(
    `UPDATE commands
     SET is_favorite = CASE WHEN is_favorite = 1 THEN 0 ELSE 1 END,
         updated_at = $1
     WHERE id = $2`,
    [now, id],
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
    [now, id],
  );
}

export async function getVariableHistories(commandId: string): Promise<Record<string, string>> {
  const db = await getDb();
  const rows = await db.select<{ variable_name: string; last_value: string }[]>(
    "SELECT variable_name, last_value FROM command_variable_histories WHERE command_id = $1",
    [commandId],
  );
  const result: Record<string, string> = {};
  for (const row of rows) {
    result[row.variable_name] = row.last_value;
  }
  return result;
}

export async function saveVariableHistories(
  commandId: string,
  values: Record<string, string>,
): Promise<void> {
  const db = await getDb();
  const now = new Date().toISOString();
  // First, delete all existing histories for this command
  await db.execute("DELETE FROM command_variable_histories WHERE command_id = $1", [commandId]);
  // Then insert only non-empty values
  for (const [name, value] of Object.entries(values)) {
    if (value === "") continue;
    const id = `${commandId}_var_${name}`;
    await db.execute(
      `INSERT INTO command_variable_histories (id, command_id, variable_name, last_value, updated_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, commandId, name, value, now],
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

export function useCommands() {
  return useQuery({
    queryKey: queryKeys.commands({ navType: "all" }),
    queryFn: () => listCommands({ navType: "all" }),
  });
}
