# Monorepo Architecture

## Proposed Structure

````txt
document-conditions-demo/
  apps/
    web/
    api/
  packages/
    shared/
    db/
  docs/
````

---

# Apps

## apps/web

Frontend application.

Responsibilities:

- borrower upload flow
- internal review UI
- routing
- API integration

---

## apps/api

Backend application.

Responsibilities:

- REST APIs
- database access
- storage integration
- background jobs
- upload handling

---

# Packages

## packages/shared

Shared TypeScript types.

Examples:

````ts
Loan
Condition
Document
DocumentVersion
ApiResponse
````

---

## packages/db

Database layer.

Responsibilities:

- migrations
- schema definitions
- seed data

---

# Suggested Principles

## Shared Types

Avoid duplicating DTOs between frontend and backend.

---

## Thin Controllers

Controllers should orchestrate services.

Business logic belongs in services/modules.

---

## Feature-Oriented Modules

Example:

````txt
modules/
  loans/
  conditions/
  documents/
  uploadSessions/
  audit/
  notifications/
````

---

# Suggested Dev Commands

````bash
pnpm install
pnpm dev
pnpm build
pnpm db:migrate
pnpm db:seed
````
