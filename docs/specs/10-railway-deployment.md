# Railway Deployment

# Goal

Deploy the full demo app to Railway.

---

# Services

## Web Service

Frontend application.

---

## API Service

Backend API.

---

## Database

PostgreSQL.

---

## Storage Bucket

Private object storage.

---

# Environment Variables

```txt
DATABASE_URL
STORAGE_BUCKET_NAME
STORAGE_ACCESS_KEY_ID
STORAGE_SECRET_ACCESS_KEY
STORAGE_ENDPOINT
STORAGE_REGION
APP_BASE_URL
API_BASE_URL
MAGIC_LINK_SECRET
```

---

# Deployment Strategy

## MVP

Single Railway project containing:

- web
- api
- database
- storage

---

# Future Improvements

```txt
Preview environments
CI/CD
Separate worker service
Monitoring
Centralized logging
```
