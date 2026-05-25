export const storageKeyForVersion = (loanId: string, documentId: string, versionId: string, fileName: string) =>
  `loans/${loanId}/documents/${documentId}/versions/${versionId}/${fileName}`;
