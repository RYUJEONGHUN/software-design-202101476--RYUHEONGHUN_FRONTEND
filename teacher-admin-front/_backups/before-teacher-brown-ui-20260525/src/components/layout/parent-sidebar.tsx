import { NavLink } from "react-router-dom";

const menus = [{ label: "자녀 현황", to: "/parent/dashboard" }];

export default function ParentSidebar() {
  return (
    <aside className="hidden w-64 border-r border-slate-200 bg-white md:flex md:flex-col">
      <div className="border-b border-slate-200 px-6 py-5">
        <h1 className="text-xl font-bold text-blue-700">ClassHub</h1>
        <p className="mt-1 text-sm text-slate-500">학부모 포털</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {menus.map((menu) => (
          <NavLink
            key={menu.to}
            to={menu.to}
            className={({ isActive }) =>
              `block rounded-xl px-4 py-3 text-sm font-medium transition ${
                isActive
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }`
            }
          >
            {menu.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
