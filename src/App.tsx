import { Navigate, Route, Routes } from "react-router-dom";
import DashboardPage from "./pages/dashboard-page";
import CalendarPage from "./pages/calendar-page";
import TemplatesPage from "./pages/templates-page";
import EditorPage from "./pages/editor-page";
import ContractsPage from "./pages/contracts-page";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/templates" element={<TemplatesPage />} />
      <Route path="/editor" element={<EditorPage />} />
      <Route path="/contracts" element={<ContractsPage />} />
    </Routes>
  );
}