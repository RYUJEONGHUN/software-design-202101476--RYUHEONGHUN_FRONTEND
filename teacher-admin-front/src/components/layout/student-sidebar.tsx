import { NavLink } from "react-router-dom";
import { BarChart3, LayoutDashboard, MessageSquareText, Sparkles } from "lucide-react";

const menus = [
  { label: "대시보드", to: "/student/dashboard", icon: LayoutDashboard },
  { label: "성적", to: "/student/grades", icon: BarChart3 },
  { label: "피드백/상담", to: "/student/records", icon: MessageSquareText },
];

export default function StudentSidebar() {
  return (
    <aside className="student-sidebar hidden w-64 shrink-0 px-4 py-6 lg:block">
      <div className="px-2">
        <h1 className="student-sidebar-logo text-3xl font-black tracking-tight">
          ClassHub
        </h1>
        <p className="student-sidebar-subtitle mt-2 text-xs font-medium">학생 포털</p>
      </div>

      <nav className="mt-9">
        <ul className="space-y-2">
          {menus.map((menu) => {
            const Icon = menu.icon;

            return (
              <li key={menu.to}>
                <NavLink
                  to={menu.to}
                  className={({ isActive }) =>
                    [
                      "student-sidebar-link flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      isActive ? "student-sidebar-link-active" : "",
                    ].join(" ")
                  }
                >
                  <Icon className="h-4 w-4" />
                  {menu.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="student-sidebar-note mt-24 rounded-3xl p-4">
        <div className="student-sidebar-note-icon flex h-12 w-12 items-center justify-center rounded-2xl">
          <Sparkles className="h-6 w-6" />
        </div>
        <p className="mt-4 text-sm font-bold text-slate-900">오늘도 수고했어요!</p>
        <p className="mt-2 text-xs leading-5 text-slate-500">
          성적과 기록을 한눈에 확인하고 다음 목표를 잡아보세요.
        </p>
      </div>
    </aside>
  );
}
