import { useEffect, useState } from "react";
import TeacherDashboard from "@/components/dashboard/teacher-dashboard";
import { apiGet } from "@/lib/api";
import {
  ApiResponse,
  ScheduledConsultationDto,
  TeacherDashboardResponse,
} from "@/types/teacher";

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<TeacherDashboardResponse | null>(null);
  const [scheduledConsultations, setScheduledConsultations] = useState<
    ScheduledConsultationDto[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError("");

        const [dashboardRes, consultationsRes] = await Promise.all([
          apiGet<ApiResponse<TeacherDashboardResponse>>("/api/v1/teacher/me/dashboard"),
          apiGet<ApiResponse<ScheduledConsultationDto[]>>(
            "/api/v1/teacher/me/consultations/scheduled"
          ),
        ]);

        setDashboard(dashboardRes.data);
        setScheduledConsultations(consultationsRes.data ?? []);
      } catch (err) {
        console.error(err);
        setError("대시보드 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-9 w-40 animate-pulse rounded-xl bg-slate-200" />
          <div className="mt-2 h-5 w-72 animate-pulse rounded-xl bg-slate-100" />
        </div>

        <div className="h-64 animate-pulse rounded-3xl bg-white shadow-sm" />
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-3xl bg-white shadow-sm" />
          <div className="h-40 animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
          <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />
          <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
      </div>
    );
  }

  if (error || !dashboard) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600 shadow-sm">
        {error || "대시보드 정보를 불러올 수 없습니다."}
      </div>
    );
  }

  return (
    <TeacherDashboard
      dashboard={dashboard}
      scheduledConsultations={scheduledConsultations}
    />
  );
}