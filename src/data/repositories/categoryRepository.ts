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
