type DashboardSummaryCardProps = {
  title: string;
  value: string;
  description?: string;
};

export default function DashboardSummaryCard({
  title,
  value,
  description,
}: DashboardSummaryCardProps) {
  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
      <div className="mb-3 flex items-center gap-2">
        <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
        <p className="text-sm font-medium text-slate-500">{title}</p>
      </div>

      <p className="text-5xl font-bold tracking-tight text-slate-900">{value}</p>

      {description ? (
        <p className="mt-3 text-sm leading-6 text-slate-400">{description}</p>
      ) : null}
    </div>
  );
}