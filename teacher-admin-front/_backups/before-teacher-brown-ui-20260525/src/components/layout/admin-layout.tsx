import { Outlet } from "react-router-dom";
import AdminSidebar from "@/components/layout/admin-sidebar";
import AppHeader from "@/components/layout/app-header";
import { getAccessToken, getEmailFromToken } from "@/lib/auth";

export default function AdminLayout() {
  const token = getAccessToken();
  const email = token ? getEmailFromToken(token) : null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader
          title="관리자 콘솔"
          description="사용자 역할, 학생 정보, 보고서를 관리합니다."
          userName={email?.split("@")[0] || "관리자"}
          subjectName="관리자"
          showNotifications={false}
        />
        <main className="min-h-screen flex-1 bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
