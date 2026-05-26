import "./load-env.js";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { sql } from "kysely";
import { createKyselyClient } from "./client/create-kysely-client.js";

const migrationsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "migrations");

const getDatabaseUrl = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required");
  return databaseUrl;
};

const ensureMigrationsTable = async (db: ReturnType<typeof createKyselyClient>["db"]) => {
  const rawDb = db as any;
  await rawDb.schema
    .createTable("KyselyMigrations")
    .ifNotExists()
    .addColumn("name", "varchar(255)", (col: any) => col.primaryKey())
    .addColumn("executedAt", "timestamptz", (col: any) => col.notNull().defaultTo(sql`now()`))
    .execute();
};

const loadMigrationFiles = async () =>
  (await fs.readdir(migrationsDirectory))
    .filter((file) => /^\d+_.+\.js$/.test(file))
    .sort();

const main = async () => {
  const { db, pool } = createKyselyClient({ databaseUrl: getDatabaseUrl() });
  try {
    await ensureMigrationsTable(db);
    const applied = await (db as any).selectFrom("KyselyMigrations").select("name").execute();
    const appliedNames = new Set(applied.map((item: { name: string }) => item.name));

    for (const fileName of await loadMigrationFiles()) {
      const migrationName = fileName.replace(/\.js$/, "");
      if (appliedNames.has(migrationName)) continue;

      const migration = await import(pathToFileURL(path.join(migrationsDirectory, fileName)).href);
      if (typeof migration.up !== "function") {
        throw new Error(`Migration ${fileName} must export up()`);
      }

      await migration.up(db);
      await (db as any).insertInto("KyselyMigrations").values({ name: migrationName }).execute();
      console.log(`Applied migration ${migrationName}`);
    }
  } finally {
    await pool.end();
  }
};

void main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
