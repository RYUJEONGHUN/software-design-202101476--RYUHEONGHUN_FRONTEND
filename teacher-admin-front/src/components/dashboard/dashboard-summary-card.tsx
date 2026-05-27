import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

type DashboardSummaryCardProps = {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  to?: string;
  actionLabel?: string;
  tone?: "primary" | "soft" | "green" | "gold";
};

export default function DashboardSummaryCard({
  title,
  value,
  description,
  icon: Icon,
  to,
  actionLabel,
  tone = "primary",
}: DashboardSummaryCardProps) {
  const toneClass = {
    primary: "bg-[#f6eadb] text-[#a66a32]",
    soft: "bg-[#f3eadf] text-[#7a4a26]",
    green: "bg-emerald-50 text-emerald-700",
    gold: "bg-amber-50 text-amber-700",
  }[tone];

  const content = (
    <div className="h-full rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        {Icon ? (
          <div className={`flex h-11 w-11 items-center justify-center rounded-2xl ${toneClass}`}>
            <Icon className="h-5 w-5" />
          </div>
        ) : (
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-500" />
        )}
      </div>

      {description ? (
        <p className="text-sm leading-6 text-slate-400">{description}</p>
      ) : null}

      {actionLabel ? (
        <div className="mt-5 text-sm font-bold text-blue-600">{actionLabel}</div>
      ) : null}
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="block h-full">
        {content}
      </Link>
    );
  }

  return content;
}
