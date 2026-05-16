import { useEffect, useMemo, useState } from "react";
import {
  getMyStudentDetail,
  type StudentDetailResponse,
} from "@/api/student";

function formatDate(value: string) {
  if (!value) return "-";
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
}

function sortSemestersDesc(semesters: string[]) {
  return [...semesters].sort((a, b) => {
    const [aYear, aTerm] = a.split("-").map(Number);
    const [bYear, bTerm] = b.split("-").map(Number);

    if (aYear !== bYear) return bYear - aYear;
    return bTerm - aTerm;
  });
}

export default function StudentDashboardPage() {
  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const [selectedSemester, setSelectedSemester] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudentDashboard = async () => {
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
        setError("학생 대시보드 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudentDashboard();
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
        <div className="h-8 w-40 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-44 animate-pulse rounded-3xl bg-white shadow-sm" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />
          <div className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />
        </div>
        <div className="h-80 animate-pulse rounded-3xl bg-white shadow-sm" />
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600 shadow-sm">
        {error || "학생 정보를 불러올 수 없습니다."}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          대시보드
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          내 정보와 최근 학사 기록을 확인합니다.
        </p>
      </div>

      <section className="overflow-hidden rounded-[32px] border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/40 p-7 shadow-sm">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center gap-5">
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/90 text-4xl font-bold text-emerald-600 shadow-sm ring-8 ring-white/50">
              {student.name?.charAt(0) ?? "학"}
            </div>

            <div>
              <div className="mb-3 inline-flex rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
                내 정보
              </div>

              <h2 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
                {student.name} 학생
              </h2>

              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 shadow-sm">
                  학번 {student.studentNumber}
                </span>
                <span className="rounded-full border border-white/70 bg-white/80 px-3 py-1 shadow-sm">
                  {student.grade}학년 {student.classNum}반
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-[24px] border border-emerald-100 bg-white/90 px-5 py-4 text-center shadow-sm">
              <p className="text-xs font-medium text-slate-500">출석률</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">
                {student.attendanceRate}%
              </p>
            </div>

            <div className="rounded-[24px] border border-blue-100 bg-white/90 px-5 py-4 text-center shadow-sm">
              <p className="text-xs font-medium text-slate-500">학기 평균</p>

              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-400"
              >
                {semesters.map((semester) => (
                  <option key={semester} value={semester}>
                    {semester}
                  </option>
                ))}
              </select>

              <p className="mt-3 text-3xl font-bold text-slate-900">
                {semesterAverage}점
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                성적
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                선택한 학기의 성적을 확인합니다.
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
                    <p className="mt-1 text-2xl font-bold text-slate-900">
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
        </div>

        <div className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-2xl font-bold tracking-tight text-slate-900">
              최근 피드백
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              최근 받은 피드백을 확인합니다.
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
      </section>

      <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5">
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">
            최근 상담
          </h3>
          <p className="mt-2 text-sm text-slate-500">
            최근 상담 내역을 확인합니다.
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
              상담 내역이 없습니다.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}