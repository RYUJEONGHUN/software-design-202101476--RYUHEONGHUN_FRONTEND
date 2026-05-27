import TeacherProfileCard from "@/components/dashboard/teacher-profile-card";
import DashboardSummaryCard from "@/components/dashboard/dashboard-summary-card";
import ScheduledConsultationList from "@/components/dashboard/scheduled-consultation-list";
import TeacherInfoPanel from "@/components/dashboard/teacher-info-panel";
import { ScheduledConsultationDto, TeacherDashboardResponse } from "@/types/teacher";
import { BookOpen, CalendarCheck, MessageSquareText, UsersRound } from "lucide-react";

type Props = {
  dashboard: TeacherDashboardResponse;
  scheduledConsultations: ScheduledConsultationDto[];
};

export default function TeacherDashboard({
  dashboard,
  scheduledConsultations,
}: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          대시보드
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          로그인한 교사 정보와 예정 상담 현황을 확인합니다.
        </p>
      </div>

      <TeacherProfileCard dashboard={dashboard} />

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <DashboardSummaryCard
          title="담당 과목"
          value={dashboard.subjectName}
          description="현재 로그인한 교사의 담당 과목입니다."
          icon={BookOpen}
          tone="primary"
        />
        <DashboardSummaryCard
          title="예정 상담"
          value={`${dashboard.scheduledConsultationCount}건`}
          description="오늘 이후 예정된 상담 일정 수입니다."
          icon={CalendarCheck}
          to="/teacher/consultations"
          actionLabel="상담 관리로 이동"
          tone="gold"
        />
        <DashboardSummaryCard
          title="학생 관리"
          value="학생 목록"
          description="학생 조회와 학생부 기록을 확인합니다."
          icon={UsersRound}
          to="/teacher/students"
          actionLabel="학생 관리로 이동"
          tone="soft"
        />
        <DashboardSummaryCard
          title="피드백"
          value="기록 관리"
          description="학생별 피드백 작성과 이력을 관리합니다."
          icon={MessageSquareText}
          to="/teacher/feedbacks"
          actionLabel="피드백 관리로 이동"
          tone="green"
        />
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[2fr_1fr]">
        <ScheduledConsultationList items={scheduledConsultations} />
        <TeacherInfoPanel dashboard={dashboard} />
      </section>
    </div>
  );
}
