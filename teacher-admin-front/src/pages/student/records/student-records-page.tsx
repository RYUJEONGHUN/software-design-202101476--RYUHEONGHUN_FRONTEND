import { useState } from "react";
import { CalendarDays, MessageSquareText } from "lucide-react";
import { useStudentContext } from "@/components/layout/student-layout";

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
  const { student, loading, error } = useStudentContext();
  const [selectedTab, setSelectedTab] = useState<RecordTab>("feedback");

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="student-skeleton h-20" />
        <div className="student-skeleton h-96" />
      </div>
    );
  }

  if (error || !student) {
    return <div className="student-error">{error || "기록 정보를 불러올 수 없습니다."}</div>;
  }

  const isFeedback = selectedTab === "feedback";

  return (
    <div className="space-y-5">
      <div>
        <p className="student-eyebrow">Feedback & Consultation</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">
          피드백/상담
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          선생님의 피드백과 상담 기록을 확인합니다.
        </p>
      </div>

      <section className="student-panel">
        <div className="student-tab-switch">
          <button
            type="button"
            onClick={() => setSelectedTab("feedback")}
            className={[
              "student-tab-button",
              isFeedback ? "student-tab-button-active" : "",
            ].join(" ")}
          >
            피드백
          </button>

          <button
            type="button"
            onClick={() => setSelectedTab("consultation")}
            className={[
              "student-tab-button",
              !isFeedback ? "student-tab-button-active" : "",
            ].join(" ")}
          >
            상담
          </button>
        </div>
      </section>

      <section className="student-panel">
        {isFeedback ? (
          <div>
            <div className="student-panel-header">
              <div>
                <h2>최근 피드백</h2>
                <p>선생님이 남긴 최근 피드백입니다.</p>
              </div>
              <span className="student-chip">{student.recentFeedbacks.length}건</span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {student.recentFeedbacks.length > 0 ? (
                student.recentFeedbacks.map((item) => (
                  <div key={item.id} className="student-record-card student-record-card-large">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="student-record-icon">
                            <MessageSquareText className="h-4 w-4" />
                          </div>
                          <span className="student-chip">피드백</span>
                          <p className="font-bold text-slate-100">{item.teacherName} 선생님</p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDateTime(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{item.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="student-empty student-empty-card lg:col-span-2">
                  <MessageSquareText className="h-5 w-5" />
                  <div>
                    <strong>받은 피드백이 없습니다.</strong>
                    <span>선생님이 피드백을 등록하면 이곳에서 확인할 수 있습니다.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div>
            <div className="student-panel-header">
              <div>
                <h2>최근 상담</h2>
                <p>선생님과의 최근 상담 기록입니다.</p>
              </div>
              <span className="student-chip">{student.recentConsultations.length}건</span>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
              {student.recentConsultations.length > 0 ? (
                student.recentConsultations.map((item) => (
                  <div key={item.id} className="student-record-card student-record-card-large">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="student-record-icon student-record-icon-green">
                            <CalendarDays className="h-4 w-4" />
                          </div>
                          <span className="student-chip">상담</span>
                          <p className="font-bold text-slate-100">{item.teacherName} 선생님</p>
                        </div>
                        <span className="text-xs text-slate-500">
                          {formatDate(item.consultationDate)}
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-slate-300">{item.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="student-empty student-empty-card lg:col-span-2">
                  <CalendarDays className="h-5 w-5" />
                  <div>
                    <strong>상담 기록이 없습니다.</strong>
                    <span>상담 기록이 등록되면 날짜와 내용이 함께 표시됩니다.</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
