import { Route, Routes } from "react-router-dom";
import { AppShellLayout } from "./components/AppShellLayout";
import { DocumentDetailPage } from "./pages/DocumentDetailPage";
import { ConditionDetailPage } from "./pages/ConditionDetailPage";
import { DashboardPage } from "./pages/DashboardPage";
import { LoanDetailPage } from "./pages/LoanDetailPage";
import { LoansPage } from "./pages/LoansPage";
import { UploadSessionPage } from "./pages/UploadSessionPage";

export function App() {
  return (
    <AppShellLayout>
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/loans/:loanId" element={<LoanDetailPage />} />
        <Route path="/documents/:documentId" element={<DocumentDetailPage />} />
        <Route
          path="/conditions/:conditionId"
          element={<ConditionDetailPage />}
        />
        <Route path="/upload/:sessionId" element={<UploadSessionPage />} />
      </Routes>
    </AppShellLayout>
  );
}
