type StudentNameCellProps = {
  name: string;
};

export default function StudentNameCell({ name }: StudentNameCellProps) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-sm font-bold text-blue-700">
        {name.charAt(0) || "학"}
      </span>
      <span className="font-semibold text-slate-900">{name}</span>
    </div>
  );
}
