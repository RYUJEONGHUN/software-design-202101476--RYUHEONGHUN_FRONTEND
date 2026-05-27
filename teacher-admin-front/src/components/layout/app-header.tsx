import NotificationBell from "@/components/layout/notification-bell";
import { logout } from "@/lib/logout";
import { getAccessToken, getEmailFromToken } from "@/lib/auth";

type AppHeaderProps = {
  title?: string;
  description?: string;
  userName?: string;
  subjectName?: string;
  showNotifications?: boolean;
};

export default function AppHeader({
  title = "교사용 관리자",
  description = "학생 정보와 학사 데이터를 관리합니다.",
  userName = "사용자",
  subjectName = "담당 정보",
  showNotifications = true,
}: AppHeaderProps) {
  const token = getAccessToken();
  const email = token ? getEmailFromToken(token) : null;
  const firstLetter = userName?.charAt(0) ?? "교";

  return (
    <header className="sticky top-0 z-10 border-b border-[#eadfce] bg-[#fffdf8]/90 backdrop-blur">
      <div className="flex items-center justify-between px-4 py-4 md:px-6">
        <div>
          <h2 className="text-lg font-bold text-[#2b2119]">{title}</h2>
          <p className="text-sm text-[#7a6b5d]">{description}</p>
        </div>

        <div className="flex items-center gap-3">
          {showNotifications && <NotificationBell />}

          <div className="flex items-center gap-3 rounded-2xl border border-[#eadfce] bg-white px-3 py-2 shadow-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fbf3e8] text-sm font-bold text-[#a66a32]">
              {firstLetter}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-semibold text-[#2b2119]">{userName}</p>
              <p className="text-xs text-[#8b7b6a]">
                {subjectName}
                {email ? ` · ${email}` : ""}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="rounded-xl bg-[#f3eadf] px-3 py-2 text-xs font-semibold text-[#6b4424] transition hover:bg-[#ead8c4]"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
