import { Kysely, PostgresDialect } from "kysely";
import pg from "pg";
import type { Database } from "../types/database.js";

export interface CreateKyselyClientInput {
  databaseUrl: string;
}

export function createKyselyClient({ databaseUrl }: CreateKyselyClientInput) {
  const pool = new pg.Pool({ connectionString: databaseUrl });

  const db = new Kysely<Database>({
    dialect: new PostgresDialect({
      pool,
    }),
  });

  return { db, pool };
}
