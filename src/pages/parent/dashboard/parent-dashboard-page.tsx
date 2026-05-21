import { useEffect, useMemo, useState } from "react";
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  getChildFeedbacks,
  getMyChildren,
  type ParentChild,
} from "@/api/parent";
import {
  getGradeChart,
  type GradeChartResponse,
} from "@/api/grade";
import type {
  FeedbackCategory,
  FeedbackItem,
  FeedbackSearchCondition,
} from "@/api/feedback";

function categoryLabel(category: FeedbackCategory | string) {
  switch (category) {
    case "GRADE":
      return "성적";
    case "BEHAVIOR":
      return "행동 발달";
    case "ATTENDANCE":
      return "출결";
    case "ATTITUDE":
      return "수업 태도";
    default:
      return category;
  }
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
}

type ChartRow = {
  subject: string;
  score: number;
  classAverage: number;
  totalAverage: number;
};

export default function ParentDashboardPage() {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);
  const [semester, setSemester] = useState("2026-1");
  const [childrenLoading, setChildrenLoading] = useState(true);
  const [childrenError, setChildrenError] = useState("");

  const [gradeChart, setGradeChart] = useState<GradeChartResponse | null>(null);
  const [gradeLoading, setGradeLoading] = useState(false);
  const [gradeError, setGradeError] = useState("");

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");

  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | "">("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");

  const selectedChild = useMemo(
    () => children.find((child) => child.id === selectedChildId) ?? null,
    [children, selectedChildId]
  );

  const chartRows = useMemo<ChartRow[]>(() => {
    if (!gradeChart) return [];

    return gradeChart.scores.map((score) => ({
      subject: score.subjectName,
      score: score.score,
      classAverage: score.classAverage,
      totalAverage: score.totalAverage,
    }));
  }, [gradeChart]);

  const feedbackCondition = (): FeedbackSearchCondition => ({
    category: filterCategory || undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
    keyword: filterKeyword.trim() || undefined,
  });

  const fetchChildren = async () => {
    try {
      setChildrenLoading(true);
      setChildrenError("");

      const data = await getMyChildren();
      setChildren(data);
      setSelectedChildId(data[0]?.id ?? null);
    } catch (err) {
      console.error(err);
      setChildrenError("자녀 목록을 불러오지 못했습니다.");
    } finally {
      setChildrenLoading(false);
    }
  };

  const fetchGradeChart = async (studentId: number, semesterValue: string) => {
    try {
      setGradeLoading(true);
      setGradeError("");
      setGradeChart(null);

      const data = await getGradeChart(studentId, semesterValue);
      setGradeChart(data);
    } catch (err) {
      console.error(err);
      setGradeError("성적 정보를 불러오지 못했습니다.");
    } finally {
      setGradeLoading(false);
    }
  };

  const fetchFeedbacks = async (
    studentId: number,
    condition: FeedbackSearchCondition = feedbackCondition()
  ) => {
    try {
      setFeedbackLoading(true);
      setFeedbackError("");

      const data = await getChildFeedbacks(studentId, condition);
      setFeedbacks(
        [...data].sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
      );
    } catch (err) {
      console.error(err);
      setFeedbackError("피드백을 불러오지 못했습니다.");
      setFeedbacks([]);
    } finally {
      setFeedbackLoading(false);
    }
  };

  useEffect(() => {
    fetchChildren();
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;

    fetchGradeChart(selectedChildId, semester);
    fetchFeedbacks(selectedChildId);
  }, [selectedChildId, semester]);

  const handleResetFeedbackFilters = async () => {
    setFilterCategory("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterKeyword("");

    if (selectedChildId) {
      await fetchFeedbacks(selectedChildId, {});
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          자녀 현황
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          자녀의 성적과 학부모 공개 피드백을 확인합니다.
        </p>
      </div>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              내 자녀
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              조회할 자녀를 선택하세요.
            </p>
          </div>

          <select
            value={semester}
            onChange={(event) => setSemester(event.target.value)}
            className="h-12 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-blue-400"
          >
            <option value="2026-1">2026-1</option>
            <option value="2026-2">2026-2</option>
          </select>
        </div>

        {childrenLoading ? (
          <div className="rounded-2xl bg-slate-50 px-5 py-10 text-center text-sm text-slate-400">
            자녀 목록을 불러오는 중...
          </div>
        ) : childrenError ? (
          <div className="rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-600">
            {childrenError}
          </div>
        ) : children.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-10 text-center text-sm text-slate-400">
            등록된 자녀가 없습니다.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {children.map((child) => {
              const active = child.id === selectedChildId;

              return (
                <button
                  key={child.id}
                  type="button"
                  onClick={() => setSelectedChildId(child.id)}
                  className={`rounded-[24px] border px-5 py-4 text-left transition ${
                    active
                      ? "border-blue-200 bg-blue-50 text-blue-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <p className="text-lg font-bold">{child.name}</p>
                  <p className="mt-2 text-sm">
                    {child.grade}학년 {child.classNum}반 · 학번{" "}
                    {child.studentNumber}
                  </p>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {selectedChild && (
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                  성적 조회
                </h2>
                <p className="mt-2 text-sm text-slate-500">
                  {selectedChild.name} 학생의 {semester} 성적입니다.
                </p>
              </div>

              {gradeChart && (
                <div className="flex gap-2">
                  <div className="rounded-2xl bg-blue-50 px-4 py-3 text-blue-700">
                    <p className="text-xs font-medium">평균</p>
                    <p className="text-xl font-bold">{gradeChart.averageScore}점</p>
                  </div>
                  <div className="rounded-2xl bg-slate-50 px-4 py-3 text-slate-700">
                    <p className="text-xs font-medium">종합 등급</p>
                    <p className="text-xl font-bold">{gradeChart.overallGrade}</p>
                  </div>
                </div>
              )}
            </div>

            {gradeLoading ? (
              <div className="text-sm text-slate-500">성적을 불러오는 중...</div>
            ) : gradeError ? (
              <div className="text-sm text-red-500">{gradeError}</div>
            ) : chartRows.length === 0 ? (
              <div className="text-sm text-slate-400">성적 데이터가 없습니다.</div>
            ) : (
              <>
                <div className="h-[360px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={chartRows}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="점수"
                        dataKey="score"
                        stroke="#2563eb"
                        fill="#2563eb"
                        fillOpacity={0.32}
                      />
                      <Radar
                        name="반 평균"
                        dataKey="classAverage"
                        stroke="#16a34a"
                        fill="#16a34a"
                        fillOpacity={0.18}
                      />
                      <Radar
                        name="전체 평균"
                        dataKey="totalAverage"
                        stroke="#ea580c"
                        fill="#ea580c"
                        fillOpacity={0.14}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>

                <div className="mt-4 overflow-hidden rounded-2xl border border-slate-100">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-left text-slate-500">
                      <tr>
                        <th className="px-4 py-3">과목</th>
                        <th className="px-4 py-3">점수</th>
                        <th className="px-4 py-3">반 평균</th>
                        <th className="px-4 py-3">전체 평균</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gradeChart?.scores.map((score) => (
                        <tr key={score.gradeId} className="border-t border-slate-100">
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {score.subjectName}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {score.score}점 · {score.letterGrade}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {score.classAverage}
                          </td>
                          <td className="px-4 py-3 text-slate-700">
                            {score.totalAverage}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </section>

          <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                피드백 조회
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                학부모에게 공개된 피드백을 확인합니다.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
              <select
                value={filterCategory}
                onChange={(event) =>
                  setFilterCategory(event.target.value as FeedbackCategory | "")
                }
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
              >
                <option value="">전체 카테고리</option>
                <option value="GRADE">성적</option>
                <option value="BEHAVIOR">행동 발달</option>
                <option value="ATTENDANCE">출결</option>
                <option value="ATTITUDE">수업 태도</option>
              </select>
              <input
                type="date"
                value={filterStartDate}
                onChange={(event) => setFilterStartDate(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
              />
              <input
                type="date"
                value={filterEndDate}
                onChange={(event) => setFilterEndDate(event.target.value)}
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
              />
              <input
                value={filterKeyword}
                onChange={(event) => setFilterKeyword(event.target.value)}
                placeholder="내용 키워드"
                className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"
              />
            </div>

            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() =>
                  selectedChildId && fetchFeedbacks(selectedChildId)
                }
                disabled={feedbackLoading}
                className="h-10 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
              >
                필터 적용
              </button>
              <button
                type="button"
                onClick={handleResetFeedbackFilters}
                disabled={feedbackLoading}
                className="h-10 rounded-xl bg-slate-100 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:opacity-60"
              >
                초기화
              </button>
            </div>

            <div className="mt-5 space-y-3">
              {feedbackLoading ? (
                <div className="text-sm text-slate-500">피드백을 불러오는 중...</div>
              ) : feedbackError ? (
                <div className="text-sm text-red-500">{feedbackError}</div>
              ) : feedbacks.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-400">
                  공개된 피드백이 없습니다.
                </div>
              ) : (
                feedbacks.map((feedback) => (
                  <div
                    key={feedback.id}
                    className="rounded-2xl border border-slate-100 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                          {categoryLabel(feedback.category)}
                        </span>
                        <span className="text-sm text-slate-500">
                          {feedback.teacherName}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400">
                        {formatDateTime(feedback.createdAt)}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">
                      {feedback.content}
                    </p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
