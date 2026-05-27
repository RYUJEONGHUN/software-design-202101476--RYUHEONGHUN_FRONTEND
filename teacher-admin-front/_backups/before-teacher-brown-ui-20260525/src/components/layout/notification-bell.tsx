import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/hooks/use-notifications";

function formatDateTime(value: string) {
  if (!value) return "-";
  return value.length >= 16 ? value.slice(0, 16) : value;
}

function typeLabel(type: string) {
  switch (type) {
    case "ATTENDANCE_UPDATED":
      return "출석";
    case "GRADE_UPDATED":
      return "성적";
    case "FEEDBACK_CREATED":
      return "피드백";
    case "CONSULTATION_UPDATED":
      return "상담";
    default:
      return "알림";
  }
}

function typeBadgeClass(type: string) {
  switch (type) {
    case "ATTENDANCE_UPDATED":
      return "bg-emerald-50 text-emerald-700";
    case "GRADE_UPDATED":
      return "bg-blue-50 text-blue-700";
    case "FEEDBACK_CREATED":
      return "bg-violet-50 text-violet-700";
    case "CONSULTATION_UPDATED":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  const {
    notifications,
    unreadCount,
    loading,
    error,
    handleMarkAsRead,
    handleMarkAllAsReadLocal,
  } = useNotifications();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-100"
      >
        <Bell className="h-5 w-5 text-slate-700" />

        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-amber-400 px-1 text-[11px] font-bold text-white shadow-sm">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-14 z-50 w-[360px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">알림</h3>
              <p className="mt-0.5 text-xs text-slate-400">
                읽지 않은 알림 {unreadCount}개
              </p>
            </div>

            <button
              onClick={handleMarkAllAsReadLocal}
              className="text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              모두 읽음
            </button>
          </div>

          <div className="max-h-[420px] overflow-y-auto">
            {loading ? (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                알림을 불러오는 중...
              </div>
            ) : error ? (
              <div className="px-4 py-10 text-center text-sm text-red-500">
                {error}
              </div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-10 text-center text-sm text-slate-400">
                알림이 없습니다.
              </div>
            ) : (
              notifications.map((item) => (
                <button
                  key={item.id}
                  onClick={() => handleMarkAsRead(item.id)}
                  className={`w-full border-b border-slate-100 px-4 py-4 text-left transition hover:bg-slate-50 ${
                    !item.isRead ? "bg-blue-50/40" : "bg-white"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${typeBadgeClass(
                            item.type
                          )}`}
                        >
                          {typeLabel(item.type)}
                        </span>
                      </div>

                      <p className="mt-2 break-words text-sm leading-6 text-slate-700">
                        {item.message}
                      </p>

                      <p className="mt-2 text-xs text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>

                    {!item.isRead && (
                      <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-blue-500" />
                    )}
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}