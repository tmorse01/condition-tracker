# System Overview

## Goal

Build a lightweight construction loan document workflow system.

Borrowers can:

- Open a secure magic link
- Upload documents
- Re-upload rejected files

Internal users can:

- Track loan conditions
- Review uploaded files
- Approve or reject submissions
- View audit history

---

# Core System Design

````txt
Browser
  |
  +--> Borrower Upload UI
  |
  +--> Internal Review UI
           |
           v
        API Server
           |
           +--> Database
           |
           +--> Object Storage
           |
           +--> Background Jobs
````

---

# Key Design Principles

## Database Owns Workflow State

The database should control:

- Review status
- Condition status
- Document associations
- Version history
- Audit history

Object storage only stores file bytes.

---

## Never Overwrite Files

Every upload creates a new document version.

This makes:

- audit history easier
- borrower retries cleaner
- approvals safer

---

## Storage Provider Independence

The app should not care whether files are stored in:

- Railway storage buckets
- S3
- Azure Blob
- Box

Storage should be abstracted behind a service layer.

---

## Keep the MVP Simple

Avoid:

- complicated auth
- enterprise RBAC
- workflow engines
- OCR
- AI classification

The goal is a clean demo app with realistic architecture.
