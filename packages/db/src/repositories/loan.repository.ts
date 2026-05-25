import type { DbExecutor } from "./base-repository.js";
import { BaseRepository } from "./base-repository.js";

export class LoanRepository extends BaseRepository {
  constructor(executor: DbExecutor) {
    super(executor);
  }

  findAll() {
    return this.executor.selectFrom("Loan").selectAll().orderBy("loanNumber", "asc").execute();
  }

  findById(id: string) {
    return this.executor.selectFrom("Loan").selectAll().where("id", "=", id).executeTakeFirst();
  }
}
