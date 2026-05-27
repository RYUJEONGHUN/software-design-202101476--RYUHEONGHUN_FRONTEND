import { TeacherDashboardResponse } from "@/types/teacher";
import teacherDeskBanner from "@/assets/teacher-desk-banner.jpg";

type Props = {
  dashboard: TeacherDashboardResponse;
};

export default function TeacherProfileCard({ dashboard }: Props) {
  const firstLetter = dashboard.name?.charAt(0) ?? "교";

  return (
    <section className="relative overflow-hidden rounded-[32px] border border-blue-100 bg-[#fff8ed] p-7 shadow-sm">
      <img
        src={teacherDeskBanner}
        alt=""
        className="pointer-events-none absolute inset-y-0 right-0 hidden h-full w-[56%] object-cover object-center opacity-90 lg:block"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#fff8ed] via-[#fff8ed]/95 to-[#fff8ed]/20" />

      <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/90 text-3xl font-bold text-blue-600 shadow-sm ring-1 ring-white/70">
            {firstLetter}
          </div>

          <div>
            <div className="mb-3 inline-flex rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
              내 정보
            </div>

            <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
              안녕하세요, {dashboard.name} 선생님!
            </h2>
            <p className="mt-2 text-sm font-medium text-slate-500">
              오늘도 학생들의 소중한 하루를 만들어가요.
            </p>

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

        <div className="rounded-[24px] border border-blue-100 bg-white/90 px-6 py-5 text-right shadow-sm backdrop-blur-sm">
          <p className="text-xs font-medium text-slate-500">예정 상담</p>
          <p className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            {dashboard.scheduledConsultationCount}건
          </p>
        </div>
      </div>

    </section>
  );
}
