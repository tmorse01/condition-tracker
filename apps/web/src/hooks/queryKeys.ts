export const queryKeys = {
  loans: ["loans"] as const,
  loan: (loanId: string) => ["loan", loanId] as const,
  condition: (conditionId: string) => ["condition", conditionId] as const,
  document: (documentId: string) => ["document", documentId] as const,
  uploadSessionValidation: (sessionId: string, token: string) => ["upload-session-validation", sessionId, token] as const,
};
