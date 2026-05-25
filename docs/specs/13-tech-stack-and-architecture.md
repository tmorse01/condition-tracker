# Tech Stack and Architecture

# End Goal

A modern TypeScript monorepo deployed to Railway that demonstrates:

- realistic system design
- document workflows
- object storage patterns
- background jobs
- versioned uploads
- scalable architecture foundations

This is intended to feel like:

```txt
A real internal fintech / proptech platform MVP
```

without becoming enterprise-overengineered.

---

# Core Stack

## Frontend

### React + TypeScript

Use React for:

- borrower upload flow
- internal review workflow
- dashboards
- document management UI

---

## Build Tool

### Vite

Use Vite because:

- fast local startup
- strong TypeScript support
- modern React tooling
- lightweight config

---

## Routing

### React Router

Use route-based architecture.

Suggested routes:

```txt
/loans
/loans/:loanId
/documents/:documentId
/upload/:sessionId
```

---

## Styling

### Mantine UI

Recommended because:

- modern appearance
- easy theming
- fast MVP development
- strong TypeScript support
- cleaner modern defaults than older enterprise UI kits

Use:

- AppShell
- DataTable/Grid
- Drawer
- Modal
- Badge
- Tabs
- Notifications

---

# Backend

## Node.js + TypeScript

Use Node.js because:

- shared TypeScript ecosystem
- easy monorepo sharing
- fast iteration speed
- ideal for MVPs and Railway deployment

---

## API Style

### REST API

Avoid GraphQL for this MVP.

REST is:

- simpler
- easier for Codex
- easier to debug
- easier to document

---

## Database

### PostgreSQL

Use Postgres because:

- relational workflow data
- joins matter here
- easy Railway support
- excellent for audit/event history

---

## ORM / Query Layer

Recommended:

```txt
Drizzle ORM
```

or:

```txt
Prisma
```

Drizzle is preferred if wanting:

- more SQL control
- cleaner migrations
- better long-term backend experience

---

# Storage

## Railway Storage Buckets

Primary storage target.

Use for:

- uploaded files
- versioned documents
- download streams

Storage should be abstracted behind:

````ts
StorageService
````

so it can later support:

- S3
- Azure Blob
- Box

---

# Jobs / Async

For MVP:

```txt
Simple interval-based workers
```

inside the API service.

Future:

```txt
Queue workers
BullMQ
Temporal
Serverless jobs
```

---

# Monorepo Tooling

## pnpm

Use pnpm workspaces.

---

## Turbo

Use Turborepo for:

- task orchestration
- caching
- build pipelines

---

# Deployment

## Railway

Deploy:

```txt
web
api
postgres
storage bucket
```

inside a single Railway project.

---

# Future Scaling Direction

Long-term, this architecture could evolve into:

```txt
Frontend SPA
API service
Worker service
Queue
Object storage
Search service
OCR pipeline
AI document classification
```

without rewriting the core domain model.

---

# Philosophy

The goal is:

```txt
Simple architecture now
Expandable architecture later
```

Avoid:

- premature microservices
- overengineering
- complex auth
- event sourcing
- workflow DSLs
