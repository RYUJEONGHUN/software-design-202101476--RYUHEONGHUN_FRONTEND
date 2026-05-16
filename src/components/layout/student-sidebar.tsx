import { NavLink } from "react-router-dom";

const menus = [
  { label: "대시보드", to: "/student/dashboard" },
  { label: "성적", to: "/student/grades" },
  { label: "피드백/상담", to: "/student/records" },
];

export default function StudentSidebar() {
  return (
    <aside className="w-64 border-r border-slate-200 bg-white">
      <div className="px-5 py-6">
        <h1 className="text-3xl font-bold tracking-tight text-blue-600">
          ClassHub
        </h1>
        <p className="mt-2 text-sm text-slate-500">학생 포털 시스템</p>
      </div>

      <nav className="px-3 pb-6">
        <ul className="space-y-2">
          {menus.map((menu) => (
            <li key={menu.to}>
              <NavLink
                to={menu.to}
                className={({ isActive }) =>
                  [
                    "block rounded-2xl px-4 py-3 text-base font-medium transition",
                    isActive
                      ? "bg-blue-50 text-blue-600"
                      : "text-slate-700 hover:bg-slate-50",
                  ].join(" ")
                }
              >
                {menu.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}