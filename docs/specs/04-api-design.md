# API Design

## Loans

````txt
GET /api/loans
GET /api/loans/:loanId
````

---

## Conditions

````txt
GET /api/loans/:loanId/conditions
POST /api/loans/:loanId/conditions
PATCH /api/conditions/:conditionId
````

---

## Upload Sessions

````txt
POST /api/loans/:loanId/upload-sessions
GET /api/upload-sessions/:sessionId/validate
````

---

## Borrower Uploads

````txt
POST /api/upload-sessions/:sessionId/documents
````

Multipart upload request:

````txt
token
conditionId
file
title
````

---

## Documents

````txt
GET /api/loans/:loanId/documents
GET /api/documents/:documentId
GET /api/documents/:documentId/versions
GET /api/document-versions/:versionId/download
````

---

## Review APIs

````txt
POST /api/document-versions/:versionId/approve
POST /api/document-versions/:versionId/reject
````

---

## Audit APIs

````txt
GET /api/loans/:loanId/audit-log
GET /api/documents/:documentId/audit-log
````

---

# API Principles

## Keep Responses Simple

Avoid premature GraphQL complexity.

---

## Versioning

Not needed for MVP.

---

## Validation

Validate:

- upload session tokens
- file sizes
- required fields
- condition associations

---

## Idempotency

Important later for:

- uploads
- notifications
- retries
