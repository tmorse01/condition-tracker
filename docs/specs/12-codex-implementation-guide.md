# Codex Implementation Guide

# Goal

Use these docs to build a clean MVP showcase app.

---

# Priorities

Focus on:

````txt
Clean architecture
Readable code
Good seed data
Practical UX
Simple workflows
Railway deployability
````

---

# Avoid Overengineering

Do not add:

````txt
Complicated auth
Microservices
Workflow engines
AI pipelines
Enterprise RBAC
````

---

# Recommended Build Order

````txt
1. Monorepo setup
2. Database schema
3. Seed data
4. Internal UI
5. Upload sessions
6. File uploads
7. Review flow
8. Audit log
9. Notifications
10. Railway deployment
````

---

# Technical Goals

The app should demonstrate:

````txt
Borrower magic-link uploads
Internal review workflows
Document versioning
Condition tracking
Audit logging
Storage abstraction
````

---

# UX Goals

The app should feel:

````txt
Clean
Modern
Workflow-oriented
Easy to demo
````

---

# Important Design Principle

The database owns workflow state.

Storage only stores file bytes.
