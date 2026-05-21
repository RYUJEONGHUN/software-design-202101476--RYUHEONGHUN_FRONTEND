import { Outlet } from "react-router-dom";
import AppHeader from "@/components/layout/app-header";
import ParentSidebar from "@/components/layout/parent-sidebar";
import { getAccessToken, getEmailFromToken } from "@/lib/auth";

export default function ParentLayout() {
  const token = getAccessToken();
  const email = token ? getEmailFromToken(token) : null;
  const userName = email?.split("@")[0] || "학부모";

  return (
    <div className="flex min-h-screen bg-slate-50">
      <ParentSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader
          title="학부모 포털"
          description="자녀의 성적, 피드백, 알림을 확인합니다."
          userName={userName}
          subjectName="학부모"
        />
        <main className="min-h-screen flex-1 bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
