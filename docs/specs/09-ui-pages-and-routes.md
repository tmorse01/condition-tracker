# Front-End Requirements: Indigo Document Workspace

## Product Experience

ConditionFlow is a document-first construction-loan review workspace. The client should feel calm, operational, and easy to scan: internal users identify requests needing action, review submitted PDFs, and send secure borrower upload links without navigating through dense enterprise screens.

The experience borrows familiar document-workflow conventions from products such as DocuSign while keeping ConditionFlow naming, workflow rules, and visual identity.

## Visual System

- Primary brand/action color: indigo, centered on `#4F46E5` with dark emphasis near `#312E81`.
- Surfaces: white cards on slate/off-white application backgrounds with subtle borders.
- Semantic statuses: green for completed/approved, yellow for pending work, red for rejection/errors, indigo for active workflow actions.
- Typography: `Inter` or system sans-serif fallbacks.
- Layout: a compact internal navigation shell and a separate minimal borrower shell.
- Interaction: visible focus/action states, text labels alongside color, responsive stacking on narrow screens.

## Internal Routes

### Dashboard (`/`)

The staff home page must show:

- active loan, pending-review, and awaiting-upload summary counts
- selectable pending-approval queue with document, loan, status, and review navigation
- bulk approval for selected pending submissions
- outstanding borrower upload requests
- recent meaningful audit activity

Bulk rejection is intentionally excluded because rejection notes must be specific to one document request.

### Loans (`/loans`)

The loan list must provide:

- text search across loan number, borrower, and property address
- loan status filter
- outstanding requirement count per loan
- status, updated date, and direct access to the loan record

### Loan Record (`/loans/:loanId`)

The loan workspace must provide:

- borrower/property summary and condition/document metrics
- `Overview`, `Conditions`, `Documents`, and `Audit log` tabs
- condition states and direct review access for pending submissions
- PDF miniature previews for submitted document records
- secure borrower-link creation, with expiration, copy, and open controls

One newly generated link is loan-scoped and may be used for one eligible upload.

### Document Detail (`/documents/:documentId`)

The document workspace must provide:

- inline PDF preview of the selected document version
- selectable visual version history with status
- explicit download action
- associated condition links and document audit history

### Condition Review (`/conditions/:conditionId`)

The review workbench must provide:

- inline PDF preview of the latest submission
- current condition and version state
- visual version history
- approval action
- rejection action requiring reviewer notes
- clear success/failure feedback after decisions

## Borrower Route

### Secure Upload (`/upload/:sessionId?token=...`)

The borrower page must use a minimal external-facing shell and support:

- validating, invalid, expired, ready, uploading, complete, and failed states
- display of sanitized loan/request context when the link is valid
- selection of one eligible `PendingUpload` or `NeedsMoreInfo` requirement
- PDF file picker and drag/drop upload
- completion message after accepted submission

## Workflow Rules

- Staff-generated upload links expire after seven days.
- A generated link stores no reusable raw token on the server and becomes unusable after one successful upload.
- Borrower uploads accept PDF content only, with a maximum size of 10 MB.
- Each successful upload creates a new document version, links it to the selected condition, transitions the condition to `PendingReview`, and writes audit activity.
- Approval satisfies the condition; rejection requires notes and returns it to `NeedsMoreInfo`.
- Preview and download surfaces operate on the actual stored PDF bytes.

## Current Phase 3 Delivery

Included in this iteration:

- inline PDF previews and miniature document surfaces
- drag/drop borrower PDF upload
- selectable queue with bulk approval

Deferred:

- persisted inline comments
- document annotations
- OCR and automated classification

## Acceptance Criteria

- All six routes use the indigo document-workspace system and responsive shells.
- Staff can create a usable borrower upload link from a loan record.
- A borrower can submit an eligible PDF through that link exactly once.
- Uploaded and seeded PDFs display through internal preview surfaces and remain downloadable.
- Pending submissions can be approved individually or selected for bulk approval; rejection requires notes.
- Status and audit information refresh after upload and review operations.
