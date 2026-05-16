import { Outlet } from "react-router-dom";
import AppSidebar from "./app-sidebar";
import AppHeader from "./app-header";

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex min-h-screen">
        <AppSidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <AppHeader />
          <main className="min-h-screen flex-1 bg-slate-50 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}