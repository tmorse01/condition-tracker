# Internal Review Workflow

# Goal

Allow internal users to review uploaded documents against conditions.

---

# Review Flow

````txt
1. Internal user opens condition
2. Internal user reviews latest document version
3. Internal user approves or rejects
4. Condition status updates
5. Audit log entry created
6. Notification created
````

---

# Approval Rules

Approving a document should:

````txt
Mark DocumentVersion Approved
Mark Condition Satisfied
Write audit log
Create notification
````

---

# Rejection Rules

Rejecting a document should:

````txt
Mark DocumentVersion Rejected
Mark Condition NeedsMoreInfo
Require rejection notes
Write audit log
Create notification
````

---

# Version History

Internal users should see:

````txt
Version Number
Uploaded By
Uploaded At
Review Status
Review Notes
````

---

# Future Enhancements

Potential additions:

````txt
Multi-stage approvals
Role-based review
Comment threads
Annotations
````
