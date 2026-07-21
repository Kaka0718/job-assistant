import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Toaster } from "@/components/ui/sonner";

export default function AppShell() {
  return (
    <div className="flex h-screen overflow-hidden bg-bg">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-auto">
        <Outlet />
      </main>
      <Toaster position="top-right" richColors />
    </div>
  );
}