import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  FileDown,
  MessageSquareText,
  Target,
  TrendingUp,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useStudentContext } from "@/components/layout/student-layout";
import studentStudyBanner from "@/assets/student-study-banner.svg";

function formatDate(value: string) {
  if (!value) return "-";
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
}

function formatScore(value: number) {
  return `${Number.isInteger(value) ? value : value.toFixed(1)}점`;
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
  const { student, loading, error } = useStudentContext();
  const [selectedSemester, setSelectedSemester] = useState("");

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

  const topScore = useMemo(() => {
    if (semesterScores.length === 0) return null;
    return [...semesterScores].sort((a, b) => b.score - a.score)[0];
  }, [semesterScores]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="student-skeleton h-56" />
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="student-skeleton h-80" />
          <div className="student-skeleton h-80" />
          <div className="student-skeleton h-80" />
        </div>
      </div>
    );
  }

  if (error || !student) {
    return <div className="student-error">{error || "학생 정보를 불러올 수 없습니다."}</div>;
  }

  return (
    <div className="space-y-5">
      <section className="student-hero">
        <img
          src={studentStudyBanner}
          alt=""
          aria-hidden="true"
          className="student-hero-illustration"
        />

        <div>
          <p className="student-eyebrow">Dashboard</p>
          <h1 className="mt-4 text-3xl font-black tracking-tight text-white md:text-4xl">
            안녕하세요, {student.name} 학생!
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
            오늘의 학습 현황과 최근 기록을 한눈에 확인해보세요.
          </p>

          <div className="mt-5 flex flex-wrap gap-2 text-sm font-semibold text-slate-300">
            <span className="student-chip">학번 {student.studentNumber}</span>
            <span className="student-chip">
              {student.grade}학년 {student.classNum}반
            </span>
            <span className="student-chip">{selectedSemester || "학기 없음"}</span>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="student-stat-card student-stat-card-primary">
          <div className="student-stat-icon">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <p>학기 평균</p>
            <strong>{formatScore(semesterAverage)}</strong>
          </div>
        </div>
        <div className="student-stat-card">
          <div className="student-stat-icon">
            <CalendarDays className="h-4 w-4" />
          </div>
          <div>
            <p>출석률</p>
            <strong>{student.attendanceRate}%</strong>
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
      </section>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="student-panel">
          <div className="student-panel-header">
            <div>
              <h2>이번 학기 요약</h2>
              <p>평균 점수와 과목별 흐름을 확인합니다.</p>
            </div>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="student-select"
            >
              {semesters.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-[180px_1fr]">
            <div className="student-average-ring">
              <div
                className="student-ring"
                style={{ "--value": `${Math.min(100, semesterAverage)}%` } as CSSProperties}
              >
                <div>
                  <strong>{formatScore(semesterAverage)}</strong>
                  <span>학기 평균</span>
                </div>
              </div>
              {topScore && (
                <p className="mt-4 text-center text-xs font-bold text-slate-500">
                  최고 과목 {topScore.subjectName} {topScore.score}점
                </p>
              )}
            </div>

            <div className="space-y-3">
              {semesterScores.length > 0 ? (
                semesterScores.map((item, index) => (
                  <div key={`${item.subjectName}-${index}`} className="student-score-row">
                    <div className="student-score-icon">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-slate-100">
                        {item.subjectName}
                      </p>
                      <p className="text-xs text-slate-500">{item.semester}</p>
                    </div>
                    <div className="flex min-w-[120px] items-center gap-3">
                      <div className="student-score-track">
                        <div
                          className="student-score-fill"
                          style={{ width: `${Math.min(100, Math.max(0, item.score))}%` }}
                        />
                      </div>
                      <strong className="w-12 text-right text-sm text-white">
                        {item.score}점
                      </strong>
                    </div>
                  </div>
                ))
              ) : (
                <div className="student-empty student-empty-card">
                  <BookOpen className="h-5 w-5" />
                  <div>
                    <strong>해당 학기 성적이 없습니다.</strong>
                    <span>다른 학기를 선택하거나 성적 등록 후 다시 확인해보세요.</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Link to="/student/grades" className="student-panel-link">
            성적 자세히 보기 <ArrowRight className="h-4 w-4" />
          </Link>
        </section>

        <section className="student-panel">
          <div className="student-panel-header">
            <div>
              <h2>추천 바로가기</h2>
              <p>자주 확인하는 메뉴를 빠르게 열 수 있습니다.</p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 xl:grid-cols-1">
            <Link to="/student/grades" className="student-action-card">
              <div className="student-score-icon">
                <Target className="h-4 w-4" />
              </div>
              <div>
                <p>성적 확인</p>
                <span>학기별 점수와 보고서</span>
              </div>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>

            <Link to="/student/records" className="student-action-card">
              <div className="student-score-icon">
                <MessageSquareText className="h-4 w-4" />
              </div>
              <div>
                <p>피드백 확인</p>
                <span>선생님이 남긴 기록</span>
              </div>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>

            <Link to="/student/grades" className="student-action-card">
              <div className="student-score-icon">
                <FileDown className="h-4 w-4" />
              </div>
              <div>
                <p>보고서 다운로드</p>
                <span>Excel 또는 PDF 저장</span>
              </div>
              <ArrowRight className="ml-auto h-4 w-4" />
            </Link>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
        <section className="student-panel">
          <div className="student-panel-header">
            <div>
              <h2>최근 피드백</h2>
              <p>선생님이 남긴 최근 피드백입니다.</p>
            </div>
            <Link to="/student/records" className="student-more-link">더보기</Link>
          </div>

          <div className="mt-5 space-y-3">
            {student.recentFeedbacks.length > 0 ? (
              student.recentFeedbacks.slice(0, 3).map((item) => (
                <div key={item.id} className="student-record-card">
                  <div className="student-record-icon">
                    <MessageSquareText className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="student-mini-chip">피드백</span>
                        <p className="truncate text-sm font-bold text-slate-100">
                          {item.teacherName} 선생님
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-400">{item.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="student-empty student-empty-card">
                <MessageSquareText className="h-5 w-5" />
                <div>
                  <strong>최근 피드백이 없습니다.</strong>
                  <span>새 피드백이 등록되면 이곳에 표시됩니다.</span>
                </div>
              </div>
            )}
          </div>
        </section>

        <section className="student-panel">
          <div className="student-panel-header">
            <div>
              <h2>최근 상담</h2>
              <p>최근 상담 내역을 확인합니다.</p>
            </div>
            <Link to="/student/records" className="student-more-link">더보기</Link>
          </div>

          <div className="mt-5 space-y-3">
            {student.recentConsultations.length > 0 ? (
              student.recentConsultations.slice(0, 3).map((item) => (
                <div key={item.id} className="student-record-card">
                  <div className="student-record-icon student-record-icon-green">
                    <CalendarDays className="h-4 w-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2">
                        <span className="student-mini-chip student-mini-chip-green">상담</span>
                        <p className="truncate text-sm font-bold text-slate-100">
                          {item.teacherName} 선생님
                        </p>
                      </div>
                      <span className="shrink-0 text-xs text-slate-500">
                        {formatDate(item.consultationDate)}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-sm text-slate-400">{item.content}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="student-empty student-empty-card">
                <CalendarDays className="h-5 w-5" />
                <div>
                  <strong>최근 상담 내역이 없습니다.</strong>
                  <span>상담이 진행되면 날짜와 내용이 정리됩니다.</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="student-panel">
        <div className="student-summary-strip">
          <div className="student-score-icon">
            <TrendingUp className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-100">학습 요약</h2>
            <p className="mt-1 text-sm text-slate-400">
              현재 학기 기준 평균 {formatScore(semesterAverage)}, 과목 {semesterScores.length}개를 수강 중입니다.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
