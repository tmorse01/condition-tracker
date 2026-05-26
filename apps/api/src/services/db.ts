import "../load-env.js";
import { createKyselyClient } from "@condition-tracker/db";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const client = createKyselyClient({ databaseUrl });

export const db = client.db;
export const dbPool = client.pool;

export const assertDatabaseReady = async () => {
  await db.selectFrom("Loan").select("id").limit(1).executeTakeFirst();
};
