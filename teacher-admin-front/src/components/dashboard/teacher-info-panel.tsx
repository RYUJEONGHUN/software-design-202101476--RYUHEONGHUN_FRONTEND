import { TeacherDashboardResponse } from "@/types/teacher";

type Props = {
  dashboard: TeacherDashboardResponse;
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3">
      <p className="text-xs font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-base font-semibold text-slate-900">{value}</p>
    </div>
  );
}

export default function TeacherInfoPanel({ dashboard }: Props) {
  return (
    <div className="space-y-6">
      <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          교사 정보
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          현재 로그인한 교사 기준 정보입니다.
        </p>

        <div className="mt-5 space-y-3">
          <InfoRow label="이름" value={dashboard.name} />
          <InfoRow label="교번" value={dashboard.teacherIdNum} />
          <InfoRow label="담당 과목" value={dashboard.subjectName} />
          <InfoRow label="권한" value={dashboard.role} />
        </div>
      </div>

      <div className="rounded-[24px] border border-blue-100 bg-gradient-to-br from-blue-50 to-indigo-50 p-6 shadow-sm">
        <h3 className="text-xl font-bold text-blue-900">오늘 업무 흐름</h3>
        <ul className="mt-4 space-y-2 text-sm leading-6 text-blue-800">
          <li>학생 목록에서 학생부와 성적을 먼저 확인하세요.</li>
          <li>상담 예정 학생은 상담 관리에서 바로 수정할 수 있습니다.</li>
          <li>보고서가 필요하면 성적, 피드백, 상담 화면의 다운로드 버튼을 사용하세요.</li>
        </ul>
      </div>
    </div>
  );
}
