import { getDb } from "../db";
import type { Category } from "../../domain/types";

interface CategoryRow {
  id: string;
  platform_id: string;
  name: string;
  sort_order: number;
}

function rowToCategory(row: CategoryRow): Category {
  return {
    id: row.id,
    platformId: row.platform_id,
    name: row.name,
    sortOrder: row.sort_order,
  };
}

export async function listCategories(platformId: string): Promise<Category[]> {
  const db = await getDb();
  const rows = await db.select<CategoryRow[]>(
    `SELECT * FROM categories WHERE platform_id = $1 ORDER BY sort_order`,
    [platformId]
  );
  return rows.map(rowToCategory);
}

export async function renameCategory(id: string, name: string): Promise<void> {
  const db = await getDb();
  await db.execute("UPDATE categories SET name = $1 WHERE id = $2", [name, id]);
}

export async function deleteCategory(id: string, platformId: string): Promise<void> {
  const db = await getDb();
  // Move commands to uncategorized fallback
  const uncategorizedId = `uncategorized_${platformId}`;
  await db.execute(
    "UPDATE commands SET category_id = $1 WHERE category_id = $2",
    [uncategorizedId, id]
  );
  await db.execute("DELETE FROM categories WHERE id = $1", [id]);
}

export async function moveCategory(id: string, direction: "left" | "right"): Promise<void> {
  const db = await getDb();
  const rows = await db.select<CategoryRow[]>(
    "SELECT * FROM categories WHERE id = $1",
    [id]
  );
  if (rows.length === 0) return;

  const cat = rows[0];
  const siblings = await db.select<CategoryRow[]>(
    "SELECT * FROM categories WHERE platform_id = $1 ORDER BY sort_order",
    [cat.platform_id]
  );

  const currentIndex = siblings.findIndex((s) => s.id === id);
  const targetIndex = direction === "left" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= siblings.length) return;

  // Swap sort_order values
  const current = siblings[currentIndex];
  const target = siblings[targetIndex];
  const tmpOrder = current.sort_order;
  await db.execute("UPDATE categories SET sort_order = $1 WHERE id = $2", [target.sort_order, current.id]);
  await db.execute("UPDATE categories SET sort_order = $1 WHERE id = $2", [tmpOrder, target.id]);
}

export async function createCategory(name: string, platformId: string): Promise<Category> {
  const db = await getDb();
  const id = `cat_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

  // Get max sort_order for this platform (excluding uncategorized)
  const maxRows = await db.select<{ max_sort: number }[]>(
    "SELECT COALESCE(MAX(sort_order), 0) as max_sort FROM categories WHERE platform_id = $1 AND sort_order < 9999",
    [platformId]
  );
  const sortOrder = (maxRows[0]?.max_sort ?? 0) + 1;

  await db.execute(
    "INSERT INTO categories (id, name, platform_id, sort_order) VALUES ($1, $2, $3, $4)",
    [id, name, platformId, sortOrder]
  );

  return { id, platformId, name, sortOrder };
}
