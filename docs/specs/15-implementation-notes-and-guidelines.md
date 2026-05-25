# Implementation Notes and Guidelines

# Goal

These are reference notes for implementation decisions during development.

Not all of these need to be implemented immediately.

---

# Architectural Priorities

## Prioritize Domain Clarity

The important thing is:

```txt
clear workflow modeling
```

not perfect infrastructure.

---

# Keep Storage Separate

Storage should not own:

- review state
- condition status
- approval workflow

The database owns those concerns.

---

# Keep APIs Thin

Controllers should mostly:

```txt
validate
orchestrate
return responses
```

Business logic belongs in services.

---

# Avoid Premature Generic Abstractions

Do not build:

```txt
workflow engine
rules engine
plugin architecture
low-code framework
```

This is still an MVP showcase app.

---

# File Upload Guidance

## MVP

Use:

```txt
multipart/form-data
backend uploads file to storage
```

---

## Future

Move to:

```txt
presigned direct uploads
```

when needed.

---

# Document Versioning Guidance

Every upload creates:

```txt
new DocumentVersion
```

Never overwrite files.

---

# Review Workflow Guidance

The important state transitions are:

```txt
PendingUpload
PendingReview
Rejected
Satisfied
```

Keep workflow understandable.

---

# Audit Logging Guidance

Only log meaningful events.

Good examples:

```txt
DocumentUploaded
DocumentRejected
ConditionSatisfied
UploadSessionCreated
```

Do not log every tiny field update.

---

# UI Guidance

Prioritize:

```txt
clarity
status visibility
workflow visibility
```

The app should demo well.

---

# Good MVP Tradeoffs

It is okay if:

- auth is mocked
- notifications are simulated
- jobs are interval-based
- uploads proxy through the backend

Do not let infrastructure complexity block progress.

---

# Recommended Mindset

Build:

```txt
A realistic internal platform MVP
```

not:

```txt
A perfect enterprise document platform
```
