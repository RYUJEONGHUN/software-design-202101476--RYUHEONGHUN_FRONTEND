import { TeacherDashboardResponse } from "@/types/teacher";

type Props = {
  dashboard: TeacherDashboardResponse;
};

export default function TeacherProfileCard({ dashboard }: Props) {
  const firstLetter = dashboard.name?.charAt(0) ?? "교";

  return (
    <section className="overflow-hidden rounded-[32px] border border-blue-100 bg-gradient-to-br from-white via-blue-50/40 to-indigo-50/60 p-7 shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/90 text-4xl font-bold text-blue-600 shadow-sm ring-8 ring-white/50">
            {firstLetter}
          </div>

          <div>
            <div className="mb-3 inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              내 정보
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              {dashboard.name} 선생님
            </h2>

            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
              <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 shadow-sm">
                교번 {dashboard.teacherIdNum}
              </span>
              <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 shadow-sm">
                담당 과목 {dashboard.subjectName}
              </span>
              <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 shadow-sm">
                역할 {dashboard.role}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-blue-100 bg-white/90 px-6 py-5 text-right shadow-sm">
          <p className="text-xs font-medium text-slate-500">예정 상담</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            {dashboard.scheduledConsultationCount}건
          </p>
        </div>
      </div>

      <div className="mt-7 rounded-[24px] border border-white/70 bg-white/70 px-5 py-4 text-slate-700 shadow-sm backdrop-blur-sm">
        오늘도 학급 관리를 시작해보세요.
      </div>
    </section>
  );
}