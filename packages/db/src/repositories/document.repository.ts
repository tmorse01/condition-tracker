import type { DbExecutor } from "./base-repository.js";
import { BaseRepository } from "./base-repository.js";

export class DocumentRepository extends BaseRepository {
  constructor(executor: DbExecutor) {
    super(executor);
  }

  findByLoanId(loanId: string) {
    return this.executor.selectFrom("Document").selectAll().where("loanId", "=", loanId).execute();
  }

  findVersionsByDocumentIds(documentIds: readonly string[]) {
    return this.executor
      .selectFrom("DocumentVersion")
      .selectAll()
      .where("documentId", "in", [...documentIds])
      .orderBy("versionNumber", "desc")
      .execute();
  }
}
