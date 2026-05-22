import Database from "@tauri-apps/plugin-sql";
import { runMigrations } from "./migrations";
import { seedIfEmpty } from "./seed";

let dbInstance: Database | null = null;

export async function getDb(): Promise<Database> {
  if (!dbInstance) {
    dbInstance = await Database.load("sqlite:commanddeck.db");
  }
  return dbInstance;
}

export async function initDatabase(): Promise<void> {
  const db = await getDb();
  await runMigrations(db);
  await seedIfEmpty(db);
}
