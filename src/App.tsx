import { Routes, Route } from "react-router-dom";
import AppShell from "@/components/layout/AppShell";
import Dashboard from "@/pages/Dashboard";
import PositionListPage from "@/pages/PositionListPage";
import PositionDetailPage from "@/pages/PositionDetailPage";
import GreetingPage from "@/pages/GreetingPage";
import ApplicationListPage from "@/pages/ApplicationListPage";
import ApplicationDetailPage from "@/pages/ApplicationDetailPage";
import ProfilePage from "@/pages/ProfilePage";
import SettingsPage from "@/pages/SettingsPage";
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/positions" element={<PositionListPage />} />
        <Route path="/positions/new" element={<PositionDetailPage />} />
        <Route path="/positions/:id" element={<PositionDetailPage />} />
        <Route path="/greeting" element={<GreetingPage />} />
        <Route path="/applications" element={<ApplicationListPage />} />
        <Route path="/applications/:id" element={<ApplicationDetailPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}