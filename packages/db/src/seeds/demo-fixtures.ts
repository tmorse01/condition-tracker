import type {
  AuditLogEntry,
  Condition,
  ConditionDocument,
  Document,
  DocumentVersion,
  Loan,
  Notification,
  UploadSession,
} from "@condition-tracker/shared";

export const demoLoans: Loan[] = [
  { id: "11111111-1111-4111-8111-111111111111", loanNumber: "BC-1001", borrowerName: "Taylor Custom Build", propertyAddress: "42 Cedar Ridge Dr", status: "Active", createdAt: "2026-05-20T16:00:00.000Z", updatedAt: "2026-05-24T16:00:00.000Z" },
  { id: "22222222-2222-4222-8222-222222222222", loanNumber: "BC-1002", borrowerName: "Lakeview Townhomes", propertyAddress: "88 Lakeview Ave", status: "Active", createdAt: "2026-05-19T16:00:00.000Z", updatedAt: "2026-05-24T16:00:00.000Z" },
];

export const demoConditions: Condition[] = [
  { id: "33333333-3333-4333-8333-333333333331", loanId: "11111111-1111-4111-8111-111111111111", title: "Signed Purchase Agreement", description: "Fully executed purchase agreement required before funding.", status: "Satisfied", dueDate: "2026-05-30T00:00:00.000Z", createdAt: "2026-05-20T16:00:00.000Z", updatedAt: "2026-05-24T16:00:00.000Z" },
  { id: "33333333-3333-4333-8333-333333333332", loanId: "11111111-1111-4111-8111-111111111111", title: "Borrower Bank Statements", description: "Two most recent statements for reserve verification.", status: "PendingReview", dueDate: "2026-05-30T00:00:00.000Z", createdAt: "2026-05-20T16:00:00.000Z", updatedAt: "2026-05-24T16:00:00.000Z" },
  { id: "33333333-3333-4333-8333-333333333333", loanId: "22222222-2222-4222-8222-222222222222", title: "Proof of Insurance", description: "Borrower must upload certificate naming lender as additional insured.", status: "PendingReview", dueDate: "2026-05-31T00:00:00.000Z", createdAt: "2026-05-19T16:00:00.000Z", updatedAt: "2026-05-24T16:00:00.000Z" },
  { id: "33333333-3333-4333-8333-333333333334", loanId: "22222222-2222-4222-8222-222222222222", title: "Builder Contract", description: "Executed builder contract with budget and completion milestones.", status: "PendingUpload", dueDate: "2026-06-02T00:00:00.000Z", createdAt: "2026-05-19T16:00:00.000Z", updatedAt: "2026-05-24T16:00:00.000Z" },
];

export const demoDocuments: Document[] = [
  { id: "44444444-4444-4444-8444-444444444441", loanId: "11111111-1111-4111-8111-111111111111", title: "Purchase Agreement", documentType: "PurchaseAgreement", currentVersionId: "55555555-5555-4555-8555-555555555551", createdAt: "2026-05-23T18:14:00.000Z", updatedAt: "2026-05-24T14:32:00.000Z" },
  { id: "44444444-4444-4444-8444-444444444442", loanId: "11111111-1111-4111-8111-111111111111", title: "Borrower Bank Statements", documentType: "BankStatements", currentVersionId: "55555555-5555-4555-8555-555555555553", createdAt: "2026-05-23T18:20:00.000Z", updatedAt: "2026-05-24T14:45:00.000Z" },
  { id: "44444444-4444-4444-8444-444444444443", loanId: "22222222-2222-4222-8222-222222222222", title: "Proof of Insurance", documentType: "InsuranceCertificate", currentVersionId: "55555555-5555-4555-8555-555555555554", createdAt: "2026-05-24T09:00:00.000Z", updatedAt: "2026-05-24T10:15:00.000Z" },
];

export const demoConditionDocuments: ConditionDocument[] = [
  { id: "66666666-6666-4666-8666-666666666661", conditionId: "33333333-3333-4333-8333-333333333331", documentId: "44444444-4444-4444-8444-444444444441", documentVersionId: "55555555-5555-4555-8555-555555555551", status: "Linked", createdAt: "2026-05-24T14:32:00.000Z" },
  { id: "66666666-6666-4666-8666-666666666662", conditionId: "33333333-3333-4333-8333-333333333332", documentId: "44444444-4444-4444-8444-444444444442", documentVersionId: "55555555-5555-4555-8555-555555555552", status: "Linked", createdAt: "2026-05-24T14:45:00.000Z" },
  { id: "66666666-6666-4666-8666-666666666663", conditionId: "33333333-3333-4333-8333-333333333333", documentId: "44444444-4444-4444-8444-444444444443", documentVersionId: "55555555-5555-4555-8555-555555555554", status: "Linked", createdAt: "2026-05-24T10:15:00.000Z" },
  { id: "66666666-6666-4666-8666-666666666664", conditionId: "33333333-3333-4333-8333-333333333332", documentId: "44444444-4444-4444-8444-444444444442", documentVersionId: "55555555-5555-4555-8555-555555555553", status: "Linked", createdAt: "2026-05-24T15:20:00.000Z" },
];

export const demoVersions: DocumentVersion[] = [
  { id: "55555555-5555-4555-8555-555555555551", documentId: "44444444-4444-4444-8444-444444444441", versionNumber: 1, fileName: "purchase-agreement.pdf", contentType: "application/pdf", fileSizeBytes: 184233, storageKey: "loans/11111111-1111-4111-8111-111111111111/documents/44444444-4444-4444-8444-444444444441/versions/55555555-5555-4555-8555-555555555551/purchase-agreement.pdf", uploadStatus: "Uploaded", reviewStatus: "Approved", reviewNotes: "All signatures present.", uploadedBy: "Taylor Borrower", uploadedAt: "2026-05-23T18:14:00.000Z", reviewedBy: "Avery Reviewer", reviewedAt: "2026-05-24T14:32:00.000Z" },
  { id: "55555555-5555-4555-8555-555555555552", documentId: "44444444-4444-4444-8444-444444444442", versionNumber: 1, fileName: "bank-statements.pdf", contentType: "application/pdf", fileSizeBytes: 812344, storageKey: "loans/11111111-1111-4111-8111-111111111111/documents/44444444-4444-4444-8444-444444444442/versions/55555555-5555-4555-8555-555555555552/bank-statements.pdf", uploadStatus: "Uploaded", reviewStatus: "Rejected", reviewNotes: "The second page is cropped. Please upload a clearer copy.", uploadedBy: "Taylor Borrower", uploadedAt: "2026-05-23T18:20:00.000Z", reviewedBy: "Avery Reviewer", reviewedAt: "2026-05-24T14:45:00.000Z" },
  { id: "55555555-5555-4555-8555-555555555553", documentId: "44444444-4444-4444-8444-444444444442", versionNumber: 2, fileName: "bank-statements-corrected.pdf", contentType: "application/pdf", fileSizeBytes: 825100, storageKey: "loans/11111111-1111-4111-8111-111111111111/documents/44444444-4444-4444-8444-444444444442/versions/55555555-5555-4555-8555-555555555553/bank-statements-corrected.pdf", uploadStatus: "Uploaded", reviewStatus: "Pending", reviewNotes: null, uploadedBy: "Taylor Borrower", uploadedAt: "2026-05-24T15:05:00.000Z", reviewedBy: null, reviewedAt: null },
  { id: "55555555-5555-4555-8555-555555555554", documentId: "44444444-4444-4444-8444-444444444443", versionNumber: 1, fileName: "insurance-certificate.pdf", contentType: "application/pdf", fileSizeBytes: 441120, storageKey: "loans/22222222-2222-4222-8222-222222222222/documents/44444444-4444-4444-8444-444444444443/versions/55555555-5555-4555-8555-555555555554/insurance-certificate.pdf", uploadStatus: "Uploaded", reviewStatus: "Pending", reviewNotes: null, uploadedBy: "Taylor Borrower", uploadedAt: "2026-05-24T10:15:00.000Z", reviewedBy: null, reviewedAt: null },
];

export const demoUploadSessions: UploadSession[] = [
  { id: "77777777-7777-4777-8777-777777777771", loanId: "11111111-1111-4111-8111-111111111111", tokenHash: "hash_demo_1", status: "Used", expiresAt: "2026-05-31T18:00:00.000Z", createdAt: "2026-05-24T18:00:00.000Z", usedAt: "2026-05-24T18:10:00.000Z", revokedAt: null },
  { id: "77777777-7777-4777-8777-777777777772", loanId: "22222222-2222-4222-8222-222222222222", tokenHash: "hash_demo_2", status: "Active", expiresAt: "2026-05-30T18:00:00.000Z", createdAt: "2026-05-24T18:00:00.000Z", usedAt: null, revokedAt: null },
  { id: "77777777-7777-4777-8777-777777777773", loanId: "22222222-2222-4222-8222-222222222222", tokenHash: "hash_demo_3", status: "Expired", expiresAt: "2026-05-24T12:00:00.000Z", createdAt: "2026-05-23T12:00:00.000Z", usedAt: null, revokedAt: null },
];

export const demoAuditLog: AuditLogEntry[] = [
  { id: "88888888-8888-4888-8888-888888888881", loanId: "11111111-1111-4111-8111-111111111111", conditionId: "33333333-3333-4333-8333-333333333331", documentId: "44444444-4444-4444-8444-444444444441", documentVersionId: "55555555-5555-4555-8555-555555555551", actorType: "InternalUser", actorName: "Avery Reviewer", action: "ConditionSatisfied", message: "Approved purchase agreement and satisfied condition.", metadataJson: "{\"reviewStatus\":\"Approved\"}", createdAt: "2026-05-24T14:32:00.000Z" },
  { id: "88888888-8888-4888-8888-888888888882", loanId: "11111111-1111-4111-8111-111111111111", conditionId: "33333333-3333-4333-8333-333333333332", documentId: "44444444-4444-4444-8444-444444444442", documentVersionId: "55555555-5555-4555-8555-555555555552", actorType: "InternalUser", actorName: "Avery Reviewer", action: "ConditionRejected", message: "Rejected first bank statement upload and requested a clearer copy.", metadataJson: "{\"reviewStatus\":\"Rejected\"}", createdAt: "2026-05-24T14:45:00.000Z" },
  { id: "88888888-8888-4888-8888-888888888883", loanId: "11111111-1111-4111-8111-111111111111", conditionId: "33333333-3333-4333-8333-333333333332", documentId: "44444444-4444-4444-8444-444444444442", documentVersionId: "55555555-5555-4555-8555-555555555553", actorType: "Borrower", actorName: "Taylor Borrower", action: "UploadReceived", message: "Borrower uploaded corrected bank statements.", metadataJson: "{\"fileName\":\"bank-statements-corrected.pdf\"}", createdAt: "2026-05-24T15:05:00.000Z" },
  { id: "88888888-8888-4888-8888-888888888884", loanId: "22222222-2222-4222-8222-222222222222", conditionId: "33333333-3333-4333-8333-333333333333", documentId: "44444444-4444-4444-8444-444444444443", documentVersionId: "55555555-5555-4555-8555-555555555554", actorType: "Borrower", actorName: "Taylor Borrower", action: "UploadReceived", message: "Borrower uploaded proof of insurance.", metadataJson: "{\"fileName\":\"insurance-certificate.pdf\"}", createdAt: "2026-05-24T10:15:00.000Z" },
];

export const demoNotifications: Notification[] = [
  { id: "99999999-9999-4999-8999-999999999991", recipient: "Taylor Borrower", templateKey: "condition-rejected", status: "Sent", payloadJson: "{\"conditionId\":\"33333333-3333-4333-8333-333333333332\"}", attemptCount: 1, createdAt: "2026-05-24T14:45:00.000Z", sentAt: "2026-05-24T14:45:05.000Z" },
  { id: "99999999-9999-4999-8999-999999999992", recipient: "Taylor Borrower", templateKey: "condition-uploaded", status: "Sent", payloadJson: "{\"conditionId\":\"33333333-3333-4333-8333-333333333332\"}", attemptCount: 1, createdAt: "2026-05-24T15:05:00.000Z", sentAt: "2026-05-24T15:05:05.000Z" },
  { id: "99999999-9999-4999-8999-999999999993", recipient: "Taylor Borrower", templateKey: "condition-uploaded", status: "Sent", payloadJson: "{\"conditionId\":\"33333333-3333-4333-8333-333333333333\"}", attemptCount: 1, createdAt: "2026-05-24T10:15:00.000Z", sentAt: "2026-05-24T10:15:05.000Z" },
];
