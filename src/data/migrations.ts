import type Database from "@tauri-apps/plugin-sql";

interface Migration {
  version: number;
  sql: string;
}

const migrations: Migration[] = [
  {
    version: 1,
    sql: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version INTEGER PRIMARY KEY,
        applied_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS platforms (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        icon TEXT,
        color TEXT NOT NULL,
        description TEXT,
        sort_order INTEGER NOT NULL DEFAULT 0,
        is_visible INTEGER NOT NULL DEFAULT 1,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS categories (
        id TEXT PRIMARY KEY,
        platform_id TEXT NOT NULL,
        name TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS commands (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        command TEXT NOT NULL,
        description TEXT,
        platform_id TEXT NOT NULL,
        category_id TEXT,
        notes TEXT,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        usage_count INTEGER NOT NULL DEFAULT 0,
        last_used_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (platform_id) REFERENCES platforms(id) ON DELETE RESTRICT,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
      );

      CREATE TABLE IF NOT EXISTS tags (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL UNIQUE
      );

      CREATE TABLE IF NOT EXISTS command_tags (
        command_id TEXT NOT NULL,
        tag_id TEXT NOT NULL,
        PRIMARY KEY (command_id, tag_id),
        FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE,
        FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS command_examples (
        id TEXT PRIMARY KEY,
        command_id TEXT NOT NULL,
        example TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS command_parameters (
        id TEXT PRIMARY KEY,
        command_id TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        sort_order INTEGER NOT NULL DEFAULT 0,
        FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_platforms_visible_sort ON platforms(is_visible, sort_order);
      CREATE INDEX IF NOT EXISTS idx_categories_platform_sort ON categories(platform_id, sort_order);
      CREATE INDEX IF NOT EXISTS idx_commands_platform ON commands(platform_id);
      CREATE INDEX IF NOT EXISTS idx_commands_category ON commands(category_id);
      CREATE INDEX IF NOT EXISTS idx_commands_favorite ON commands(is_favorite);
      CREATE INDEX IF NOT EXISTS idx_commands_recent ON commands(last_used_at);
      CREATE INDEX IF NOT EXISTS idx_command_tags_command ON command_tags(command_id);
      CREATE INDEX IF NOT EXISTS idx_command_tags_tag ON command_tags(tag_id);
    `,
  },
  {
    version: 2,
    sql: `
      ALTER TABLE platforms ADD COLUMN sort_index INTEGER DEFAULT 0;
      CREATE INDEX IF NOT EXISTS idx_platforms_sort ON platforms (sort_index ASC);
    `,
  },
  {
    version: 3,
    sql: `
      INSERT INTO categories (id, name, platform_id, sort_order)
      SELECT 'uncategorized_' || id, '未分类', id, 9999
      FROM platforms
      WHERE NOT EXISTS (
        SELECT 1 FROM categories WHERE id = 'uncategorized_' || platforms.id
      );
    `,
  },
  {
    version: 4,
    sql: `
      CREATE TABLE IF NOT EXISTS command_variable_histories (
        id TEXT PRIMARY KEY,
        command_id TEXT NOT NULL,
        variable_name TEXT NOT NULL,
        last_value TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        FOREIGN KEY (command_id) REFERENCES commands(id) ON DELETE CASCADE
      );
      CREATE UNIQUE INDEX IF NOT EXISTS idx_cvh_command_variable
        ON command_variable_histories(command_id, variable_name);
    `,
  },
];

export async function runMigrations(db: Database): Promise<void> {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version INTEGER PRIMARY KEY,
      applied_at TEXT NOT NULL
    );
  `);

  const rows = await db.select<{ version: number }[]>(
    "SELECT version FROM schema_migrations ORDER BY version",
  );
  const applied = new Set(rows.map((r) => r.version));

  for (const migration of migrations) {
    if (!applied.has(migration.version)) {
      const statements = migration.sql
        .split(";")
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      for (const stmt of statements) {
        await db.execute(stmt);
      }

      await db.execute("INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES ($1, $2)", [
        migration.version,
        new Date().toISOString(),
      ]);
    }
  }
}
