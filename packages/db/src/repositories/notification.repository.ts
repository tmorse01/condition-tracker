import type { DbExecutor } from "./base-repository.js";
import { BaseRepository } from "./base-repository.js";

export class NotificationRepository extends BaseRepository {
  constructor(executor: DbExecutor) {
    super(executor);
  }

  findPending() {
    return this.executor.selectFrom("Notification").selectAll().where("status", "=", "Pending").execute();
  }
}
