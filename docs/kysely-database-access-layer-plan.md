# Kysely Database Access Layer Plan

# Goal

Use Kysely as the primary database access layer for the document upload and condition tracking platform.

The goals are:

- full TypeScript type safety
- maintainable SQL access
- predictable migrations
- excellent developer experience
- Railway/Postgres compatibility
- monorepo integration
- CI/CD validation

This document defines:

- architecture
- folder structure
- migration strategy
- typing strategy
- repository patterns
- transaction patterns
- CI/CD integration
- conventions

---

# Why Kysely

Kysely fits this project well because:

- SQL-first mindset
- excellent TypeScript support
- lightweight runtime
- works well in monorepos
- avoids heavy ORM abstraction
- easier long-term SQL optimization
- easier migration toward enterprise complexity later

Compared to heavier ORMs:

```txt
More SQL control
Less ORM magic
Better query visibility
Simpler mental model
```

---

# Core Philosophy

The database layer should:

```txt
Be explicit
Be strongly typed
Stay close to SQL
Remain easy to debug
Avoid hidden behavior
```

Avoid:

```txt
Massive ActiveRecord-style models
Hidden lazy loading
Auto-generated business logic
Deep ORM abstractions
```

---

# Recommended Stack

## Database

```txt
PostgreSQL
```

---

## Query Builder

```txt
Kysely
```

---

## Driver

Recommended:

```txt
pg
```

---

## Migration Tooling

Recommended:

```txt
kysely
kysely-codegen
```

Potential additions later:

```txt
dbmate
node-pg-migrate
custom migration tooling
```

---

# Monorepo Placement

## Recommended Structure

````txt
packages/
  db/
    src/
      client/
      migrations/
      repositories/
      schema/
      seeds/
      types/
      utils/
````

---

# Package Responsibilities

## client/

Database connection setup.

Examples:

```txt
createKyselyClient
transaction helpers
connection lifecycle
```

---

## migrations/

Migration files.

Examples:

```txt
001_initial_schema.ts
002_add_notifications.ts
003_add_indexes.ts
```

---

## repositories/

Database access layer.

Examples:

```txt
loan.repository.ts
condition.repository.ts
document.repository.ts
```

---

## schema/

Table definitions and database interfaces.

---

## seeds/

Seed scripts for demo data.

---

## types/

Generated database types.

---

## utils/

Shared query helpers.

Examples:

```txt
pagination helpers
sorting helpers
audit helpers
```

---

# Recommended Database Interface

## database.ts

Example structure:

````ts
export interface Database {
  Loan: LoanTable;
  Condition: ConditionTable;
  Document: DocumentTable;
  DocumentVersion: DocumentVersionTable;
  ConditionDocument: ConditionDocumentTable;
  UploadSession: UploadSessionTable;
  AuditLog: AuditLogTable;
  Notification: NotificationTable;
}
````

This becomes the root type for Kysely.

---

# Table Typing Strategy

Use Kysely utility types:

````ts
Generated<T>
Selectable<T>
Insertable<T>
Updateable<T>
````

Example:

````ts
export interface LoanTable {
  id: Generated<string>;
  loanNumber: string;
  borrowerName: string;
  propertyAddress: string | null;
  status: string;
  createdAt: Generated<Date>;
  updatedAt: Date | null;
}
````

---

# Type Export Strategy

Each table should expose:

````ts
export type Loan = Selectable<LoanTable>;
export type NewLoan = Insertable<LoanTable>;
export type LoanUpdate = Updateable<LoanTable>;
````

This gives:

```txt
read types
insert types
update types
```

without duplication.

---

# Recommended Repository Pattern

## Goal

Keep SQL centralized.

Avoid SQL directly inside controllers.

---

# Example Structure

````txt
repositories/
  loan.repository.ts
  condition.repository.ts
  document.repository.ts
````

---

# Example Repository Style

````ts
export class LoanRepository {
  constructor(private readonly db: Kysely<Database>) {}

  async getById(id: string) {
    return this.db
      .selectFrom("Loan")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }
}
````

---

# Repository Responsibilities

Repositories should:

```txt
Own SQL
Own joins
Own filtering logic
Return typed results
```

Repositories should NOT:

```txt
Contain business workflow logic
Send notifications
Handle HTTP requests
```

---

# Service Layer Pattern

Recommended layering:

````txt
Controller
  -> Service
      -> Repository
          -> Database
````

---

# Example

````txt
DocumentController
  -> DocumentService
      -> DocumentRepository
      -> AuditRepository
      -> NotificationService
````

---

# Transaction Strategy

Use explicit transactions.

Example:

````ts
await db.transaction().execute(async (trx) => {
  await documentRepository.create(trx, input);
  await auditRepository.insert(trx, auditLog);
});
````

---

# Important Rule

Repositories should accept either:

```txt
db
or
trx
```

so transactions work naturally.

---

# Migration Strategy

## Goal

Migrations should be:

```txt
Readable
Sequential
Reviewable
Safe
```

---

# Migration Naming

````txt
001_initial_schema.ts
002_add_document_versions.ts
003_add_notification_indexes.ts
````

---

# Migration Structure

Example:

````ts
export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable("Loan")
    .addColumn("id", "uuid", (col) => col.primaryKey())
    .addColumn("loanNumber", "varchar(100)", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable("Loan").execute();
}
````

---

# Migration Philosophy

Prefer:

```txt
Many small migrations
```

instead of giant migrations.

---

# Seed Strategy

Create deterministic seed data.

Recommended scripts:

````txt
seed:base
seed:demo
seed:reset
````

---

# Demo Seed Data

Include:

```txt
Loans
Conditions
Documents
Rejected uploads
Approved uploads
Audit history
Notifications
Expired sessions
```

---

# Type Generation Strategy

## Use kysely-codegen

Generate types directly from Postgres schema.

Recommended flow:

````txt
Migrations run
Database updated
Codegen generates DB types
App builds against generated types
````

---

# Suggested Generated File

````txt
packages/db/src/types/generated.ts
````

---

# Benefits

This gives:

```txt
Real database alignment
Compile-time safety
No duplicated schema typing
Safer refactors
```

---

# Query Patterns

# Preferred Style

Use:

````ts
selectFrom()
insertInto()
updateTable()
deleteFrom()
````

Keep queries readable.

---

# Avoid

Avoid giant nested abstractions.

Do not try to recreate LINQ or ActiveRecord patterns.

---

# Pagination Pattern

Recommended:

````ts
.limit(limit)
.offset(offset)
````

Future:

```txt
cursor pagination
```

if needed.

---

# Filtering Strategy

Build composable filters.

Example:

````ts
let query = db.selectFrom("Document");

if (conditionId) {
  query = query.where("conditionId", "=", conditionId);
}
````

---

# Audit Logging Strategy

Audit inserts should happen inside transactions.

Example:

````txt
Approve document
Update condition
Insert audit log
Commit transaction
````

---

# Soft Delete Strategy

Recommended:

````txt
isInactive boolean
````

instead of hard deletes for important entities.

---

# Timestamps

Recommended fields:

````txt
createdAt
updatedAt
````

Potential future additions:

````txt
createdBy
updatedBy
````

---

# Railway Integration

## Database

Use Railway PostgreSQL.

Environment variable:

````txt
DATABASE_URL
````

---

# Startup Strategy

API should:

```txt
Validate DB connection on startup
```

Fail fast if database unavailable.

---

# Local Development

Recommended local scripts:

````bash
pnpm db:migrate
pnpm db:generate
pnpm db:seed
````

---

# CI/CD Integration

# Goal

CI should validate:

```txt
Type safety
Migration integrity
Schema generation
Build correctness
```

---

# Recommended CI Pipeline

## Step 1

Install dependencies.

````bash
pnpm install
````

---

## Step 2

Run linting.

````bash
pnpm lint
````

---

## Step 3

Run migrations against temporary database.

````bash
pnpm db:migrate
````

---

## Step 4

Run type generation.

````bash
pnpm db:generate
````

---

## Step 5

Run TypeScript validation.

````bash
pnpm typecheck
````

---

## Step 6

Run tests.

````bash
pnpm test
````

---

## Step 7

Build apps.

````bash
pnpm build
````

---

# Important CI Rule

Generated database types should always be committed or reproducibly generated.

Avoid:

```txt
Schema drift
```

between:

```txt
database
generated types
application code
```

---

# GitHub Actions Example Structure

````yaml
name: CI

on:
  pull_request:
  push:

jobs:
  validate:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 22

      - run: pnpm install

      - run: pnpm db:migrate

      - run: pnpm db:generate

      - run: pnpm lint

      - run: pnpm typecheck

      - run: pnpm build
````

---

# Future Improvements

Potential additions later:

```txt
Read replicas
Query tracing
Performance instrumentation
Multi-tenant patterns
Soft-delete helpers
Search indexing
CQRS patterns
```

---

# Final Philosophy

The database layer should feel:

```txt
Explicit
Predictable
Type-safe
SQL-oriented
Maintainable
```

The goal is not:

```txt
Hide SQL
```

The goal is:

```txt
Make SQL safer and easier to evolve
```
