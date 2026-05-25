import type { DbExecutor } from "./base-repository.js";
import { BaseRepository } from "./base-repository.js";

export class ConditionRepository extends BaseRepository {
  constructor(executor: DbExecutor) {
    super(executor);
  }

  findByLoanId(loanId: string) {
    return this.executor.selectFrom("Condition").selectAll().where("loanId", "=", loanId).execute();
  }
}
