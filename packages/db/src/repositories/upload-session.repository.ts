import type { DbExecutor } from "./base-repository.js";
import { BaseRepository } from "./base-repository.js";

export class UploadSessionRepository extends BaseRepository {
  constructor(executor: DbExecutor) {
    super(executor);
  }

  findById(id: string) {
    return this.executor.selectFrom("UploadSession").selectAll().where("id", "=", id).executeTakeFirst();
  }
}
