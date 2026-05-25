import type { Kysely, Transaction } from "kysely";
import type { Database } from "../types/database.js";

export type DbExecutor = Kysely<Database> | Transaction<Database>;

export abstract class BaseRepository {
  constructor(protected readonly executor: DbExecutor) {}
}
