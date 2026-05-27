import { NavLink } from "react-router-dom";
import { BarChart3, LayoutDashboard, LogOut, MessageSquareText } from "lucide-react";
import NotificationBell from "@/components/layout/notification-bell";
import { logout } from "@/lib/logout";

type StudentHeaderProps = {
  studentName?: string;
  grade?: number;
  classNum?: number;
};

const mobileMenus = [
  { label: "대시보드", to: "/student/dashboard", icon: LayoutDashboard },
  { label: "성적", to: "/student/grades", icon: BarChart3 },
  { label: "피드백", to: "/student/records", icon: MessageSquareText },
];

export default function StudentHeader({
  studentName = "학생",
  grade,
  classNum,
}: StudentHeaderProps) {
  const firstLetter = studentName?.charAt(0) ?? "학";

  return (
    <header className="student-header sticky top-0 z-10">
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-7">
        <div className="min-w-0">
          <p className="student-header-eyebrow text-xs font-bold uppercase tracking-[0.22em]">
            Student Portal
          </p>
          <h2 className="mt-1 truncate text-lg font-bold text-slate-900">
            내 학습 현황을 확인해보세요
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <NotificationBell />

          <div className="student-profile-card flex items-center gap-3 rounded-2xl px-3 py-2">
            <div className="student-avatar flex h-9 w-9 items-center justify-center rounded-full text-sm font-black">
              {firstLetter}
            </div>

            <div className="hidden text-left md:block">
              <p className="text-sm font-bold text-slate-900">{studentName}</p>
              <p className="text-xs text-slate-500">
                {grade && classNum ? `${grade}학년 ${classNum}반` : "학생"}
              </p>
            </div>

            <button
              type="button"
              onClick={logout}
              className="student-logout-button inline-flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-bold transition"
            >
              <LogOut className="h-3.5 w-3.5" />
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <nav className="student-mobile-nav flex gap-2 overflow-x-auto px-4 py-3 lg:hidden">
        {mobileMenus.map((menu) => {
          const Icon = menu.icon;

          return (
            <NavLink
              key={menu.to}
              to={menu.to}
              className={({ isActive }) =>
                [
                  "inline-flex h-10 shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-bold",
                  isActive
                    ? "student-mobile-link-active"
                    : "student-mobile-link",
                ].join(" ")
              }
            >
              <Icon className="h-4 w-4" />
              {menu.label}
            </NavLink>
          );
        })}
      </nav>
    </header>
  );
}
