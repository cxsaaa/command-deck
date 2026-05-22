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
     ORDER BY p.sort_order`
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
