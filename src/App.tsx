import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";
import {
  SignedIn,
  SignedOut,
  RedirectToSignIn,
  useAuth,
} from "@clerk/clerk-react";
import { useEffect } from "react";
import { setAuthToken, authApi } from "./services/api";

import DashboardPage from "./pages/dashboard-page";
import CalendarPage from "./pages/calendar-page";
import TemplatesPage from "./pages/templates-page";
import EditorPage from "./pages/editor-page";
import ContractsPage from "./pages/contracts-page";
import ContractDetailPage from "./pages/contract-detail-page";
import CreateContractPage from "./pages/create-contract-page";
import NotificationsPage from "./pages/notifications-page";
import SignInPage from "./pages/sign-in-page";
import SignUpPage from "./pages/sign-up-page";

function AuthenticatedApp() {
  const { getToken } = useAuth();

  useEffect(() => {
    setAuthToken(getToken);
    // Sync user on first load
    authApi.syncUser().catch(() => {});
  }, [getToken]);

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/editor/:contractId" element={<EditorPage />} />
      <Route path="/contracts" element={<ContractsPage />} />
      <Route path="/contracts/new" element={<CreateContractPage />} />
      <Route path="/contracts/:id" element={<ContractDetailPage />} />
      <Route path="/notifications" element={<NotificationsPage />} /> 
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <>
      <SignedIn>
        <AuthenticatedApp />
      </SignedIn>
      <SignedOut>
        <Routes>
          <Route path="/sign-in" element={<SignInPage />} />
          <Route path="/sign-up" element={<SignUpPage />} />
          <Route path="*" element={<RedirectToSignIn />} />
        </Routes>
      </SignedOut>
    </>
  );
}
