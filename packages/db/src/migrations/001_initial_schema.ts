import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("Loan")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("loanNumber", "varchar(100)", (col) => col.notNull().unique())
    .addColumn("borrowerName", "varchar(255)", (col) => col.notNull())
    .addColumn("propertyAddress", "varchar(255)", (col) => col.notNull())
    .addColumn("status", "varchar(32)", (col) => col.notNull())
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(db.fn.now()))
    .addColumn("updatedAt", "timestamptz", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("Condition")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("loanId", "uuid", (col) => col.notNull().references("Loan.id").onDelete("cascade"))
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("status", "varchar(32)", (col) => col.notNull())
    .addColumn("dueDate", "timestamptz")
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(db.fn.now()))
    .addColumn("updatedAt", "timestamptz", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("Document")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("loanId", "uuid", (col) => col.notNull().references("Loan.id").onDelete("cascade"))
    .addColumn("title", "varchar(255)", (col) => col.notNull())
    .addColumn("documentType", "varchar(100)", (col) => col.notNull())
    .addColumn("currentVersionId", "uuid")
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(db.fn.now()))
    .addColumn("updatedAt", "timestamptz", (col) => col.notNull())
    .execute();

  await db.schema
    .createTable("DocumentVersion")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("documentId", "uuid", (col) => col.notNull().references("Document.id").onDelete("cascade"))
    .addColumn("versionNumber", "integer", (col) => col.notNull())
    .addColumn("fileName", "varchar(255)", (col) => col.notNull())
    .addColumn("contentType", "varchar(255)", (col) => col.notNull())
    .addColumn("fileSizeBytes", "integer", (col) => col.notNull())
    .addColumn("storageKey", "text", (col) => col.notNull().unique())
    .addColumn("uploadStatus", "varchar(32)", (col) => col.notNull())
    .addColumn("reviewStatus", "varchar(32)", (col) => col.notNull())
    .addColumn("reviewNotes", "text")
    .addColumn("uploadedBy", "varchar(255)", (col) => col.notNull())
    .addColumn("uploadedAt", "timestamptz", (col) => col.notNull().defaultTo(db.fn.now()))
    .addColumn("reviewedBy", "varchar(255)")
    .addColumn("reviewedAt", "timestamptz")
    .execute();

  await db.schema
    .createTable("ConditionDocument")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("conditionId", "uuid", (col) => col.notNull().references("Condition.id").onDelete("cascade"))
    .addColumn("documentId", "uuid", (col) => col.notNull().references("Document.id").onDelete("cascade"))
    .addColumn("documentVersionId", "uuid", (col) => col.notNull().references("DocumentVersion.id").onDelete("cascade"))
    .addColumn("status", "varchar(32)", (col) => col.notNull())
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(db.fn.now()))
    .execute();

  await db.schema
    .createTable("UploadSession")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("loanId", "uuid", (col) => col.notNull().references("Loan.id").onDelete("cascade"))
    .addColumn("tokenHash", "text", (col) => col.notNull().unique())
    .addColumn("status", "varchar(32)", (col) => col.notNull())
    .addColumn("expiresAt", "timestamptz", (col) => col.notNull())
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(db.fn.now()))
    .addColumn("usedAt", "timestamptz")
    .addColumn("revokedAt", "timestamptz")
    .execute();

  await db.schema
    .createTable("AuditLog")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("loanId", "uuid")
    .addColumn("conditionId", "uuid")
    .addColumn("documentId", "uuid")
    .addColumn("documentVersionId", "uuid")
    .addColumn("actorType", "varchar(32)", (col) => col.notNull())
    .addColumn("actorName", "varchar(255)", (col) => col.notNull())
    .addColumn("action", "varchar(100)", (col) => col.notNull())
    .addColumn("message", "text", (col) => col.notNull())
    .addColumn("metadataJson", "text", (col) => col.notNull())
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(db.fn.now()))
    .execute();

  await db.schema
    .createTable("Notification")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("recipient", "varchar(255)", (col) => col.notNull())
    .addColumn("templateKey", "varchar(100)", (col) => col.notNull())
    .addColumn("status", "varchar(32)", (col) => col.notNull())
    .addColumn("payloadJson", "text", (col) => col.notNull())
    .addColumn("attemptCount", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("createdAt", "timestamptz", (col) => col.notNull().defaultTo(db.fn.now()))
    .addColumn("sentAt", "timestamptz")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("Notification").execute();
  await db.schema.dropTable("AuditLog").execute();
  await db.schema.dropTable("UploadSession").execute();
  await db.schema.dropTable("ConditionDocument").execute();
  await db.schema.dropTable("DocumentVersion").execute();
  await db.schema.dropTable("Document").execute();
  await db.schema.dropTable("Condition").execute();
  await db.schema.dropTable("Loan").execute();
}
