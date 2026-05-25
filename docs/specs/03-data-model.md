# Data Model

## Loan

````txt
id
loanNumber
borrowerName
propertyAddress
status
createdAt
updatedAt
````

---

## Condition

````txt
id
loanId
title
description
status
dueDate
createdAt
updatedAt
````

Statuses:

````txt
PendingUpload
PendingReview
NeedsMoreInfo
Satisfied
Waived
````

---

## Document

Logical document entity.

````txt
id
loanId
title
documentType
currentVersionId
createdAt
updatedAt
````

---

## DocumentVersion

Physical uploaded file.

````txt
id
documentId
versionNumber
fileName
contentType
fileSizeBytes
storageKey
uploadStatus
reviewStatus
reviewNotes
uploadedBy
uploadedAt
reviewedBy
reviewedAt
````

---

## ConditionDocument

Join table.

````txt
id
conditionId
documentId
documentVersionId
status
createdAt
````

---

## UploadSession

Magic-link upload session.

````txt
id
loanId
tokenHash
status
expiresAt
createdAt
usedAt
revokedAt
````

---

## AuditLog

````txt
id
loanId
conditionId
documentId
documentVersionId
actorType
actorName
action
message
metadataJson
createdAt
````

---

## Notification

````txt
id
recipient
templateKey
status
payloadJson
attemptCount
createdAt
sentAt
````

---

# Relationships

````txt
Loan
  -> many Conditions

Loan
  -> many Documents

Document
  -> many DocumentVersions

Condition
  -> many ConditionDocuments

Document
  -> many ConditionDocuments
````
