import { NavLink } from "react-router-dom";

const menus = [
  { label: "대시보드", icon: "⌂", to: "/teacher/dashboard" },
  { label: "학생 관리", icon: "♙", to: "/teacher/students" },
  { label: "성적 관리", icon: "▣", to: "/teacher/grades" },
  { label: "출석 관리", icon: "◷", to: "/teacher/attendances" },
  { label: "피드백 관리", icon: "✎", to: "/teacher/feedbacks" },
  { label: "상담 관리", icon: "☏", to: "/teacher/consultations" },
];

export default function AppSidebar() {
  return (
    <aside className="hidden w-64 border-r border-[#4a3122] bg-[#3a2418] text-[#f8efe2] md:flex md:flex-col">
      <div className="border-b border-white/10 px-6 py-6">
        <h1 className="text-xl font-extrabold tracking-tight text-white">ClassHub</h1>
        <p className="mt-1 text-xs text-[#d8c6b4]">교사용 학생 관리 시스템</p>
      </div>

      <nav className="flex-1 space-y-1.5 px-3 py-5">
        {menus.map((menu) => (
          <NavLink
            key={menu.to}
            to={menu.to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                isActive
                  ? "bg-[#a66a32] text-white shadow-sm shadow-black/10"
                  : "text-[#d8c6b4] hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/10 text-xs">
              {menu.icon}
            </span>
            <span>{menu.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="m-4 rounded-2xl border border-white/10 bg-white/8 p-4 text-xs leading-6 text-[#eadfce]">
        <p className="font-bold text-white">오늘도 멋진 수업 되세요!</p>
        <p className="mt-1 text-[#cdb9a5]">학생 기록과 상담을 차분하게 관리해요.</p>
      </div>
    </aside>
  );
}
