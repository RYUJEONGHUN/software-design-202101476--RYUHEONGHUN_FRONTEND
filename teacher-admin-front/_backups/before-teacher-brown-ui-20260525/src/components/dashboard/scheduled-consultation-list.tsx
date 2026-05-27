import { ScheduledConsultationDto } from "@/types/teacher";

type Props = {
  items: ScheduledConsultationDto[];
};

export default function ScheduledConsultationList({ items }: Props) {
  return (
    <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900">
          예약 상담 목록
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          오늘 이후 예정된 상담 일정을 확인합니다.
        </p>
      </div>

      <div className="space-y-4">
        {items.length > 0 ? (
          items.map((item, index) => (
            <div
              key={`${item.studentName}-${item.nextPlanDate}-${index}`}
              className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-blue-200 hover:bg-blue-50/40 hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-base font-bold text-blue-600">
                  {item.studentName?.charAt(0) ?? "학"}
                </div>

                <div>
                  <p className="text-xs font-medium text-slate-400">학생</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {item.studentName}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-xs font-medium text-slate-400">예정일</p>
                <p className="mt-1 text-base font-semibold text-slate-700">
                  {item.nextPlanDate}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-slate-400">
            예정된 상담이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
}