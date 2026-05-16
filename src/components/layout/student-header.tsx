import NotificationBell from "@/components/layout/notification-bell";

type StudentHeaderProps = {
  studentName?: string;
  grade?: number;
  classNum?: number;
};

export default function StudentHeader({
  studentName = "학생",
  grade,
  classNum,
}: StudentHeaderProps) {
  const firstLetter = studentName?.charAt(0) ?? "학";

  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">학생 포털</h2>
          <p className="text-sm text-slate-500">
            내 정보와 학사 기록을 확인합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-sm font-bold text-emerald-600">
              {firstLetter}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-slate-900">{studentName}</p>
              <p className="text-xs text-slate-400">
                {grade && classNum ? `${grade}학년 ${classNum}반` : "학생"}
              </p>
            </div>

            <span className="hidden text-slate-400 md:block">▾</span>
          </button>
        </div>
      </div>
    </header>
  );
}