import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import AppHeader from "@/components/layout/app-header";
import AppSidebar from "@/components/layout/app-sidebar";
import { apiGet } from "@/lib/api";

type TeacherDashboardResponse = {
  name: string;
  teacherIdNum: string;
  subjectName: string;
  role: string;
  scheduledConsultationCount: number;
};

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

export default function AppLayout() {
  const [teacher, setTeacher] = useState<TeacherDashboardResponse | null>(null);

  useEffect(() => {
    const fetchTeacher = async () => {
      try {
        const response =
          await apiGet<ApiResponse<TeacherDashboardResponse>>(
            "/api/v1/teacher/me/dashboard"
          );
        setTeacher(response.data);
      } catch (error) {
        console.error("교사 헤더 정보 조회 실패", error);
      }
    };

    fetchTeacher();
  }, []);

  return (
    <div className="teacher-shell flex min-h-screen bg-[#f8f3ec] text-[#2b2119]">
      <AppSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader
          title="교사용 관리자"
          description="학생 정보와 학사 데이터를 관리합니다."
          userName={teacher?.name ?? "교사"}
          subjectName={teacher?.subjectName ?? "담당 과목"}
        />
        <main className="min-h-screen flex-1 bg-[#f8f3ec] p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
