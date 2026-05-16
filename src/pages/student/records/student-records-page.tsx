import { useEffect, useState } from "react";
import {
  getMyStudentDetail,
  type StudentDetailResponse,
} from "@/api/student";

type RecordTab = "feedback" | "consultation";

function formatDate(value: string) {
  if (!value) return "-";
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
}

export default function StudentRecordsPage() {
  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const [selectedTab, setSelectedTab] = useState<RecordTab>("feedback");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyStudentDetail();
        setStudent(data);
      } catch (err) {
        console.error(err);
        setError("기록 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-16 animate-pulse rounded-3xl bg-white shadow-sm" />
        <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600 shadow-sm">
        {error || "기록 정보를 불러올 수 없습니다."}
      </div>
    );
  }

  const isFeedback = selectedTab === "feedback";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          피드백/상담
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          최근 받은 피드백과 상담 기록을 확인합니다.
        </p>
      </div>

      <section className="rounded-[32px] border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSelectedTab("feedback")}
            className={[
              "rounded-2xl px-5 py-3 text-sm font-semibold transition",
              isFeedback
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            피드백
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("consultation")}
            className={[
              "rounded-2xl px-5 py-3 text-sm font-semibold transition",
              !isFeedback
                ? "bg-blue-600 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            상담
          </button>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        {isFeedback ? (
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                최근 피드백
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                선생님이 남긴 최근 피드백입니다.
              </p>
            </div>

            <div className="space-y-3">
              {student.recentFeedbacks.length > 0 ? (
                student.recentFeedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-base font-semibold text-slate-900">
                        {item.teacherName}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatDateTime(item.createdAt)}
                      </p>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {item.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-slate-400">
                  받은 피드백이 없습니다.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-5">
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                최근 상담
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                선생님과의 최근 상담 기록입니다.
              </p>
            </div>

            <div className="space-y-3">
              {student.recentConsultations.length > 0 ? (
                student.recentConsultations.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-4">
                      <p className="text-base font-semibold text-slate-900">
                        {item.teacherName}
                      </p>
                      <p className="text-sm text-slate-400">
                        {formatDate(item.consultationDate)}
                      </p>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {item.content}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-slate-400">
                  상담 기록이 없습니다.
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}