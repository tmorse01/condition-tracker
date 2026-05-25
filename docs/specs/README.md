# Document Upload + Condition Tracking System

## Overview

This package contains planning and implementation documentation for a construction loan document upload and condition tracking MVP.

The project is designed as a:

- TypeScript monorepo
- Railway-deployed demo application
- Object-storage-backed document system
- Construction-loan workflow showcase

The goal is to hand these docs directly to Codex or another implementation agent.

---

# Documentation Structure

| File | Purpose |
|---|---|
| `01-system-overview.md` | High-level architecture and product goals |
| `02-monorepo-architecture.md` | Monorepo layout and package structure |
| `03-data-model.md` | Database schema and entity design |
| `04-api-design.md` | REST API planning |
| `05-borrower-upload-flow.md` | Magic-link borrower workflow |
| `06-internal-review-workflow.md` | Internal review lifecycle |
| `07-storage-architecture.md` | Object storage abstraction and file strategy |
| `08-background-jobs.md` | Jobs, retries, notifications, cleanup |
| `09-ui-pages-and-routes.md` | Frontend routes and UX planning |
| `10-railway-deployment.md` | Railway deployment setup |
| `11-seed-data-and-demo-script.md` | Demo story and sample data |
| `12-codex-implementation-guide.md` | Guidance for Codex implementation |

---

# MVP Goals

The MVP should demonstrate:

- Borrower magic-link uploads
- Internal review workflows
- Document versioning
- Condition tracking
- Audit logging
- Notification simulation
- Storage abstraction
- Railway deployment

This is intentionally not production-grade yet.

Focus on:

- Clean architecture
- Good system design
- Realistic workflow modeling
- Demo-ready UX
- Readable code
- Extensible foundations

---

# Suggested Build Order

1. Monorepo setup
2. Database + seed data
3. Internal loan/condition pages
4. Borrower upload flow
5. File uploads + storage
6. Review workflow
7. Audit log
8. Notifications
9. Background jobs
10. Railway deployment
