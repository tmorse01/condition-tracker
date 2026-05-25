# UI Pages and Routes

# Internal Pages

## Dashboard

````txt
/
````

Shows:

- recent loans
- pending reviews
- recent uploads

---

## Loan List

````txt
/loans
````

---

## Loan Detail

````txt
/loans/:loanId
````

Tabs:

````txt
Overview
Conditions
Documents
Audit Log
````

---

## Document Detail

````txt
/documents/:documentId
````

Shows:

- current version
- version history
- review history
- associated conditions

---

# Borrower Pages

## Upload Page

````txt
/upload/:sessionId
````

States:

````txt
Validating
Invalid
Expired
Ready
Uploading
Complete
````

---

# UI Design Goals

Focus on:

- clarity
- workflow visibility
- status badges
- clean demo UX

Avoid:

- excessive animations
- overly complex dashboards
