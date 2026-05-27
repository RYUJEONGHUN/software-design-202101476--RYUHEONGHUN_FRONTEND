import { useEffect, useMemo, useState } from "react";
import { BookOpen, FileSpreadsheet, FileText } from "lucide-react";
import { downloadGradeReport, type GradeReportFormat } from "@/api/grade";
import { useStudentContext } from "@/components/layout/student-layout";

function sortSemestersDesc(semesters: string[]) {
  return [...semesters].sort((a, b) => {
    const [aYear, aTerm] = a.split("-").map(Number);
    const [bYear, bTerm] = b.split("-").map(Number);

    if (aYear !== bYear) return bYear - aYear;
    return bTerm - aTerm;
  });
}

function formatScore(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}점`;
}

function getGradeTone(letterGrade?: string | null) {
  const normalized = letterGrade?.charAt(0).toUpperCase();

  if (normalized === "A") return "student-grade-card-a";
  if (normalized === "B") return "student-grade-card-b";
  if (normalized === "C") return "student-grade-card-c";
  if (normalized === "D") return "student-grade-card-d";
  return "student-grade-card-f";
}

export default function StudentGradesPage() {
  const { student, loading, error } = useStudentContext();
  const [selectedSemester, setSelectedSemester] = useState("");
  const [reportLoading, setReportLoading] = useState<GradeReportFormat | null>(null);
  const [reportError, setReportError] = useState("");

  useEffect(() => {
    if (!student) return;

    const semesterList = sortSemestersDesc(
      [...new Set(student.subjectScores.map((item) => item.semester))]
    );

    setSelectedSemester((current) =>
      current && semesterList.includes(current) ? current : semesterList[0] ?? ""
    );
  }, [student]);

  const semesters = useMemo(() => {
    if (!student) return [];
    return sortSemestersDesc(
      [...new Set(student.subjectScores.map((item) => item.semester))]
    );
  }, [student]);

  const semesterScores = useMemo(() => {
    if (!student || !selectedSemester) return [];
    return student.subjectScores.filter((item) => item.semester === selectedSemester);
  }, [student, selectedSemester]);

  const semesterAverage = useMemo(() => {
    if (semesterScores.length === 0) return 0;
    const total = semesterScores.reduce((sum, item) => sum + item.score, 0);
    return Math.round((total / semesterScores.length) * 10) / 10;
  }, [semesterScores]);

  const handleDownloadReport = async (format: GradeReportFormat) => {
    if (!student || !selectedSemester) return;

    try {
      setReportLoading(format);
      setReportError("");
      await downloadGradeReport(student.id, selectedSemester, format);
    } catch (err: any) {
      console.error(err);
      setReportError(
        err?.response?.data?.message || "성적 보고서 다운로드에 실패했습니다."
      );
    } finally {
      setReportLoading(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="student-skeleton h-24" />
        <div className="student-skeleton h-96" />
      </div>
    );
  }

  if (error || !student) {
    return <div className="student-error">{error || "성적 정보를 불러올 수 없습니다."}</div>;
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="student-eyebrow">Grades</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-white">성적</h1>
        <p className="mt-2 text-sm text-slate-400">
          학기별 성적과 평균 점수를 확인합니다.
        </p>
      </div>

      <section className="student-panel">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-300">
              학기 선택
            </label>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="student-select h-12 w-full"
            >
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          <div className="student-stat-card student-stat-card-primary">
            <div className="student-stat-icon">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p>학기 평균</p>
              <strong>{formatScore(semesterAverage)}</strong>
            </div>
          </div>

          <div className="student-stat-card">
            <div className="student-stat-icon">
              <BookOpen className="h-4 w-4" />
            </div>
            <div>
              <p>과목 수</p>
              <strong>{semesterScores.length}개</strong>
            </div>
          </div>

          <div className="student-report-card">
            <div>
              <p className="text-xs font-extrabold text-slate-500">보고서 다운로드</p>
              <strong className="mt-1 block text-sm font-black text-slate-900">
                {selectedSemester || "-"}
              </strong>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleDownloadReport("EXCEL")}
                disabled={!selectedSemester || reportLoading !== null}
                className="student-download-button student-download-excel"
              >
                <FileSpreadsheet className="h-4 w-4" />
                {reportLoading === "EXCEL" ? "생성 중" : "Excel"}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReport("PDF")}
                disabled={!selectedSemester || reportLoading !== null}
                className="student-download-button student-download-pdf"
              >
                <FileText className="h-4 w-4" />
                {reportLoading === "PDF" ? "생성 중" : "PDF"}
              </button>
            </div>
          </div>
        </div>

        {reportError && <div className="student-error mt-4">{reportError}</div>}
      </section>

      <section className="student-panel">
        <div className="student-panel-header">
          <div>
            <h2>과목별 성적</h2>
            <p>선택한 학기의 과목별 점수와 등급입니다.</p>
          </div>
          <span className="student-chip">{selectedSemester || "-"}</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {semesterScores.length > 0 ? (
            semesterScores.map((item, index) => {
              const score = Math.min(100, Math.max(0, item.score));
              const gradeTone = getGradeTone(item.letterGrade);

              return (
                <div
                  key={`${item.subjectName}-${item.semester}-${index}`}
                  className={`student-grade-card ${gradeTone}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="student-score-icon">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <span className="student-chip">{item.semester}</span>
                  </div>

                  <h3 className="mt-5 text-lg font-black text-white">{item.subjectName}</h3>

                  <div className="mt-5 flex items-end justify-between gap-4">
                    <div>
                      <p className="text-4xl font-black text-white">{item.score}</p>
                      <p className="text-xs font-bold text-slate-500">/100</p>
                    </div>
                    <p className="student-letter-badge">
                      {item.letterGrade ?? "-"}
                    </p>
                  </div>

                  <div className="student-score-track mt-5">
                    <div
                      className="student-score-fill"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="student-empty student-empty-card md:col-span-2 xl:col-span-4">
              <BookOpen className="h-5 w-5" />
              <div>
                <strong>해당 학기 성적이 없습니다.</strong>
                <span>학기 선택을 변경하거나 성적 등록 후 다시 확인해보세요.</span>
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
