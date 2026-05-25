# Borrower Upload Flow

# Goal

Allow borrowers to upload files without full authentication.

Use secure magic links.

---

# Flow

````txt
1. Internal user generates upload link
2. UploadSession created
3. Borrower opens link
4. API validates token
5. Borrower uploads file
6. Document + DocumentVersion created
7. File stored in object storage
8. Condition moves to PendingReview
9. Audit log written
````

---

# Upload Session Rules

## Expiration

Upload sessions should expire.

Suggested:

````txt
7 days
````

---

## Validation

Validate:

- token
- expiration
- revoked status

---

# Borrower UI States

````txt
Validating
Invalid Link
Expired Link
Ready
Uploading
Upload Complete
Upload Failed
````

---

# Re-Uploads

Rejected files should create new document versions.

Never overwrite existing files.

---

# Upload Strategy

For MVP:

````txt
multipart/form-data
API uploads to storage
````

Future:

````txt
Presigned direct uploads
````
