import { getDb } from "../db";
import type { Platform } from "../../domain/types";

interface PlatformRow {
  id: string;
  name: string;
  icon: string | null;
  color: string;
  description: string | null;
  sort_order: number;
  is_visible: number;
  sort_index: number;
  created_at: string;
  updated_at: string;
  command_count: number;
}

function rowToPlatform(row: PlatformRow): Platform {
  return {
    id: row.id,
    name: row.name,
    icon: row.icon,
    color: row.color,
    description: row.description,
    sortOrder: row.sort_order,
    isVisible: row.is_visible === 1,
    sortIndex: row.sort_index,
    commandCount: row.command_count,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listPlatforms(): Promise<Platform[]> {
  const db = await getDb();
  const rows = await db.select<PlatformRow[]>(
    `SELECT p.*, COUNT(c.id) as command_count
     FROM platforms p
     LEFT JOIN commands c ON c.platform_id = p.id
     WHERE p.is_visible = 1
     GROUP BY p.id
     ORDER BY p.sort_index ASC`
  );
  return rows.map(rowToPlatform);
}

export async function getPlatform(id: string): Promise<Platform | null> {
  const db = await getDb();
  const rows = await db.select<PlatformRow[]>(
    `SELECT p.*, COUNT(c.id) as command_count
     FROM platforms p
     LEFT JOIN commands c ON c.platform_id = p.id
     WHERE p.id = $1
     GROUP BY p.id`,
    [id]
  );
  if (rows.length === 0) return null;
  return rowToPlatform(rows[0]);
}

export async function updatePlatformSortOrder(
  platformIds: string[]
): Promise<void> {
  const db = await getDb();
  for (let i = 0; i < platformIds.length; i++) {
    await db.execute(
      "UPDATE platforms SET sort_index = $1, updated_at = $2 WHERE id = $3",
      [i, new Date().toISOString(), platformIds[i]]
    );
  }
}

export async function listAllPlatforms(): Promise<Platform[]> {
  const db = await getDb();
  const rows = await db.select<PlatformRow[]>(
    `SELECT p.*, COUNT(c.id) as command_count
     FROM platforms p
     LEFT JOIN commands c ON c.platform_id = p.id
     GROUP BY p.id
     ORDER BY p.sort_index ASC`
  );
  return rows.map(rowToPlatform);
}

export async function renamePlatform(id: string, name: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE platforms SET name = $1, updated_at = $2 WHERE id = $3",
    [name, new Date().toISOString(), id]
  );
}

export async function hidePlatform(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE platforms SET is_visible = 0, updated_at = $1 WHERE id = $2",
    [new Date().toISOString(), id]
  );
}

export async function showPlatform(id: string): Promise<void> {
  const db = await getDb();
  await db.execute(
    "UPDATE platforms SET is_visible = 1, updated_at = $1 WHERE id = $2",
    [new Date().toISOString(), id]
  );
}

export async function getPlatformCommandCount(id: string): Promise<number> {
  const db = await getDb();
  const rows = await db.select<{ count: number }[]>(
    "SELECT COUNT(*) as count FROM commands WHERE platform_id = $1",
    [id]
  );
  return rows[0]?.count ?? 0;
}

export async function deletePlatform(id: string): Promise<void> {
  const db = await getDb();
  await db.execute("DELETE FROM platforms WHERE id = $1", [id]);
}

const PLATFORM_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#F97316", "#6366F1", "#14B8A6",
];

export async function createPlatform(name: string): Promise<Platform> {
  const db = await getDb();
  const id = `platform_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const color = PLATFORM_COLORS[Math.floor(Math.random() * PLATFORM_COLORS.length)];
  const now = new Date().toISOString();

  // Get max sort_index
  const maxRows = await db.select<{ max_sort: number }[]>(
    "SELECT COALESCE(MAX(sort_index), 0) as max_sort FROM platforms"
  );
  const sortIndex = (maxRows[0]?.max_sort ?? 0) + 1;

  await db.execute(
    `INSERT INTO platforms (id, name, icon, color, description, sort_order, is_visible, sort_index, created_at, updated_at)
     VALUES ($1, $2, NULL, $3, NULL, 0, 1, $4, $5, $5)`,
    [id, name, color, sortIndex, now]
  );

  // Create uncategorized fallback category
  await db.execute(
    `INSERT INTO categories (id, name, platform_id, sort_order)
     VALUES ($1, '未分类', $2, 9999)`,
    [`uncategorized_${id}`, id]
  );

  return {
    id,
    name,
    icon: null,
    color,
    description: null,
    sortOrder: 0,
    isVisible: true,
    sortIndex,
    commandCount: 0,
    createdAt: now,
    updatedAt: now,
  };
}
