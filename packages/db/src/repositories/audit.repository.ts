import type { DbExecutor } from "./base-repository.js";
import { BaseRepository } from "./base-repository.js";

export class AuditRepository extends BaseRepository {
  constructor(executor: DbExecutor) {
    super(executor);
  }

  findByLoanId(loanId: string) {
    return this.executor.selectFrom("AuditLog").selectAll().where("loanId", "=", loanId).execute();
  }
}
