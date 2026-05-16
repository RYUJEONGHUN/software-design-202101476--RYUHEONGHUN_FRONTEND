import NotificationBell from "@/components/layout/notification-bell";

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">교사용 관리자</h2>
          <p className="text-sm text-slate-500">
            학생 정보와 학사 데이터를 관리합니다.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            placeholder="학생 검색"
            className="hidden rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400 md:block"
          />

          <NotificationBell />

          <button className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
            + 새로 등록
          </button>
        </div>
      </div>
    </header>
  );
}