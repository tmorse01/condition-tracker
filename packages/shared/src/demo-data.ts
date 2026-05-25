import type {
  AuditLogEntry,
  Condition,
  ConditionDocument,
  Document,
  DocumentVersion,
  Loan,
  Notification,
  UploadSession,
} from "./index.js";

export const demoLoans: Loan[] = [
  {
    id: "loan_1001",
    loanNumber: "BC-1001",
    borrowerName: "Taylor Custom Build",
    propertyAddress: "42 Cedar Ridge Dr",
    status: "Active",
    createdAt: "2026-05-20T16:00:00.000Z",
    updatedAt: "2026-05-24T16:00:00.000Z",
  },
  {
    id: "loan_1002",
    loanNumber: "BC-1002",
    borrowerName: "Lakeview Townhomes",
    propertyAddress: "88 Lakeview Ave",
    status: "Active",
    createdAt: "2026-05-19T16:00:00.000Z",
    updatedAt: "2026-05-24T16:00:00.000Z",
  },
];

export const demoConditions: Condition[] = [
  {
    id: "cond_1",
    loanId: "loan_1001",
    title: "Signed Purchase Agreement",
    description: "Fully executed purchase agreement required before funding.",
    status: "Satisfied",
    dueDate: "2026-05-30T00:00:00.000Z",
    createdAt: "2026-05-20T16:00:00.000Z",
    updatedAt: "2026-05-24T16:00:00.000Z",
  },
  {
    id: "cond_2",
    loanId: "loan_1001",
    title: "Borrower Bank Statements",
    description: "Two most recent statements for reserve verification.",
    status: "PendingReview",
    dueDate: "2026-05-30T00:00:00.000Z",
    createdAt: "2026-05-20T16:00:00.000Z",
    updatedAt: "2026-05-24T16:00:00.000Z",
  },
  {
    id: "cond_3",
    loanId: "loan_1002",
    title: "Proof of Insurance",
    description: "Borrower must upload certificate naming lender as additional insured.",
    status: "PendingUpload",
    dueDate: "2026-05-31T00:00:00.000Z",
    createdAt: "2026-05-19T16:00:00.000Z",
    updatedAt: "2026-05-24T16:00:00.000Z",
  },
];

export const demoDocuments: Document[] = [
  {
    id: "doc_1",
    loanId: "loan_1001",
    title: "Purchase Agreement",
    documentType: "PurchaseAgreement",
    currentVersionId: "ver_1",
    createdAt: "2026-05-23T18:14:00.000Z",
    updatedAt: "2026-05-24T14:32:00.000Z",
  },
  {
    id: "doc_2",
    loanId: "loan_1001",
    title: "Borrower Bank Statements",
    documentType: "BankStatements",
    currentVersionId: "ver_2",
    createdAt: "2026-05-23T18:20:00.000Z",
    updatedAt: "2026-05-24T14:45:00.000Z",
  },
];

export const demoConditionDocuments: ConditionDocument[] = [
  {
    id: "cond_doc_1",
    conditionId: "cond_1",
    documentId: "doc_1",
    documentVersionId: "ver_1",
    status: "Linked",
    createdAt: "2026-05-24T14:32:00.000Z",
  },
  {
    id: "cond_doc_2",
    conditionId: "cond_2",
    documentId: "doc_2",
    documentVersionId: "ver_2",
    status: "Linked",
    createdAt: "2026-05-24T14:45:00.000Z",
  },
];

export const demoVersions: DocumentVersion[] = [
  {
    id: "ver_1",
    documentId: "doc_1",
    versionNumber: 1,
    fileName: "purchase-agreement.pdf",
    contentType: "application/pdf",
    fileSizeBytes: 184233,
    storageKey: "loans/loan_1001/documents/doc_1/versions/ver_1/purchase-agreement.pdf",
    uploadStatus: "Uploaded",
    reviewStatus: "Approved",
    reviewNotes: "All signatures present.",
    uploadedBy: "Taylor Borrower",
    uploadedAt: "2026-05-23T18:14:00.000Z",
    reviewedBy: "Avery Reviewer",
    reviewedAt: "2026-05-24T14:32:00.000Z",
  },
  {
    id: "ver_2",
    documentId: "doc_2",
    versionNumber: 1,
    fileName: "bank-statements.pdf",
    contentType: "application/pdf",
    fileSizeBytes: 812344,
    storageKey: "loans/loan_1001/documents/doc_2/versions/ver_2/bank-statements.pdf",
    uploadStatus: "Uploaded",
    reviewStatus: "Rejected",
    reviewNotes: "The second page is cropped. Please upload a clearer copy.",
    uploadedBy: "Taylor Borrower",
    uploadedAt: "2026-05-23T18:20:00.000Z",
    reviewedBy: "Avery Reviewer",
    reviewedAt: "2026-05-24T14:45:00.000Z",
  },
];

export const demoUploadSessions: UploadSession[] = [
  {
    id: "session_1",
    loanId: "loan_1001",
    tokenHash: "hash_demo_1",
    status: "Used",
    expiresAt: "2026-05-31T18:00:00.000Z",
    createdAt: "2026-05-24T18:00:00.000Z",
    usedAt: "2026-05-24T18:10:00.000Z",
    revokedAt: null,
  },
  {
    id: "session_2",
    loanId: "loan_1002",
    tokenHash: "hash_demo_2",
    status: "Active",
    expiresAt: "2026-05-30T18:00:00.000Z",
    createdAt: "2026-05-24T18:00:00.000Z",
    usedAt: null,
    revokedAt: null,
  },
];

export const demoAuditLog: AuditLogEntry[] = [
  {
    id: "audit_1",
    loanId: "loan_1001",
    conditionId: "cond_1",
    documentId: "doc_1",
    documentVersionId: "ver_1",
    actorType: "InternalUser",
    actorName: "Avery Reviewer",
    action: "ConditionSatisfied",
    message: "Approved purchase agreement and satisfied condition.",
    metadataJson: "{\"reviewStatus\":\"Approved\"}",
    createdAt: "2026-05-24T14:32:00.000Z",
  },
];

export const demoNotifications: Notification[] = [
  {
    id: "notif_1",
    recipient: "Taylor Borrower",
    templateKey: "document-rejected",
    status: "Sent",
    payloadJson: "{\"documentId\":\"doc_2\"}",
    attemptCount: 1,
    createdAt: "2026-05-24T14:45:00.000Z",
    sentAt: "2026-05-24T14:46:00.000Z",
  },
];
