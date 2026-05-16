import { useEffect, useMemo, useState } from "react";
import {
  getMyStudentDetail,
  type StudentDetailResponse,
} from "@/api/student";

function sortSemestersDesc(semesters: string[]) {
  return [...semesters].sort((a, b) => {
    const [aYear, aTerm] = a.split("-").map(Number);
    const [bYear, bTerm] = b.split("-").map(Number);

    if (aYear !== bYear) return bYear - aYear;
    return bTerm - aTerm;
  });
}

export default function StudentGradesPage() {
  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getMyStudentDetail();
        setStudent(data);

        const semesterList = sortSemestersDesc(
          [...new Set(data.subjectScores.map((item) => item.semester))]
        );
        setSelectedSemester(semesterList[0] ?? "");
      } catch (err) {
        console.error(err);
        setError("성적 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const semesters = useMemo(() => {
    if (!student) return [];
    return sortSemestersDesc(
      [...new Set(student.subjectScores.map((item) => item.semester))]
    );
  }, [student]);

  const semesterScores = useMemo(() => {
    if (!student || !selectedSemester) return [];
    return student.subjectScores.filter(
      (item) => item.semester === selectedSemester
    );
  }, [student, selectedSemester]);

  const semesterAverage = useMemo(() => {
    if (semesterScores.length === 0) return 0;
    const total = semesterScores.reduce((sum, item) => sum + item.score, 0);
    return Math.round((total / semesterScores.length) * 10) / 10;
  }, [semesterScores]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-32 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-24 animate-pulse rounded-3xl bg-white shadow-sm" />
        <div className="h-96 animate-pulse rounded-3xl bg-white shadow-sm" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600 shadow-sm">
        {error || "성적 정보를 불러올 수 없습니다."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          성적
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          학기별 성적과 평균 점수를 확인합니다.
        </p>
      </div>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1.2fr_1fr_1fr]">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-600">
              학기 선택
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-400"
            >
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-[24px] border border-blue-100 bg-blue-50/40 px-5 py-4">
            <p className="text-sm text-slate-500">학기 평균</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {semesterAverage}점
            </p>
          </div>

          <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/40 px-5 py-4">
            <p className="text-sm text-slate-500">과목 수</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {semesterScores.length}개
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              과목별 성적
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              선택한 학기의 과목별 점수를 확인합니다.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
            {selectedSemester || "-"}
          </span>
        </div>

        <div className="space-y-3">
          {semesterScores.length > 0 ? (
            semesterScores.map((item, index) => (
              <div
                key={`${item.subjectName}-${item.semester}-${index}`}
                className="flex items-center justify-between rounded-[24px] border border-slate-200 bg-white px-5 py-4 shadow-sm"
              >
                <div>
                  <p className="text-xs font-medium text-slate-400">과목</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {item.subjectName}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">{item.semester}</p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-medium text-slate-400">점수</p>
                  <p className="mt-1 text-3xl font-bold text-slate-900">
                    {item.score}점
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-[24px] border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-slate-400">
              해당 학기 성적이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}