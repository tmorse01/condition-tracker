# Storage Architecture

# Goal

Keep file storage abstracted from the business workflow.

---

# Storage Responsibilities

Storage should only handle:

- file bytes
- upload/download
- delete operations

The database owns workflow state.

---

# Storage Interface

````ts
interface StorageService {
  uploadFile(input): Promise<Result>;
  getDownloadUrl(storageKey): Promise<string>;
  deleteFile(storageKey): Promise<void>;
}
````

---

# Recommended Storage Key Structure

````txt
loans/{loanId}/documents/{documentId}/versions/{versionId}/{fileName}
````

---

# Why Abstract Storage?

Allows future migration between:

- Railway buckets
- S3
- Azure Blob
- Box

without changing business logic.

---

# Railway Storage

The MVP should use Railway storage buckets.

Use:

- private buckets
- backend-mediated access
- temporary download URLs

---

# File Versioning

Never overwrite files.

Every upload creates:

````txt
new DocumentVersion
new storage object
````

---

# Future Improvements

````txt
Presigned uploads
Virus scanning
Thumbnail generation
Preview rendering
Storage lifecycle policies
````
