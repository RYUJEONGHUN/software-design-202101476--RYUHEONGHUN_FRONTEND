import { useEffect, useState } from "react";
import {
  downloadConsultationReport,
  type ReportFormat,
} from "@/api/report";
import { searchStudents, type StudentSearchItem } from "@/api/student";
import {
  createConsultation,
  searchConsultations,
  updateConsultation,
  type ConsultationItem,
} from "@/api/consultation";

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return value.slice(0, 10);
}

function toDateInputValue(value: string | null | undefined) {
  if (!value) return "";
  return value.slice(0, 10);
}

function formatDateTime(value: string) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function ConsultationsPage() {
  const [searchStudentId, setSearchStudentId] = useState("");
  const [studentName, setStudentName] = useState("");
  const [teacherName, setTeacherName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [keyword, setKeyword] = useState("");

  const [consultations, setConsultations] = useState<ConsultationItem[]>([]);
  const [consultationLoading, setConsultationLoading] = useState(false);
  const [consultationError, setConsultationError] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchGrade, setSearchGrade] = useState("");
  const [searchClassNum, setSearchClassNum] = useState("");

  const [studentResults, setStudentResults] = useState<StudentSearchItem[]>([]);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [studentSearchError, setStudentSearchError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<StudentSearchItem | null>(null);

  const [consultationDate, setConsultationDate] = useState(getToday());
  const [content, setContent] = useState("");
  const [nextPlanDate, setNextPlanDate] = useState("");

  const [createMessage, setCreateMessage] = useState("");
  const [createError, setCreateError] = useState("");

  const [expandedIds, setExpandedIds] = useState<number[]>([]);
  const [editingConsultation, setEditingConsultation] =
    useState<ConsultationItem | null>(null);
  const [editConsultationDate, setEditConsultationDate] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editNextPlanDate, setEditNextPlanDate] = useState("");
  const [editError, setEditError] = useState("");
  const [reportLoading, setReportLoading] = useState<ReportFormat | null>(null);
  const [reportError, setReportError] = useState("");

  const toggleExpanded = (id: number) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const fetchConsultations = async (override?: {
    studentId?: number;
    studentName?: string;
    teacherName?: string;
    startDate?: string;
    endDate?: string;
    keyword?: string;
  }) => {
    try {
      setConsultationLoading(true);
      setConsultationError("");

      const data = await searchConsultations({
          studentId:
            override && "studentId" in override
              ? override.studentId
              : searchStudentId
                ? Number(searchStudentId)
                : undefined,

          studentName:
            override && "studentName" in override
              ? override.studentName
              : studentName.trim() || undefined,

          teacherName:
            override && "teacherName" in override
              ? override.teacherName
              : teacherName.trim() || undefined,

          startDate:
            override && "startDate" in override
              ? override.startDate
              : startDate || undefined,

          endDate:
            override && "endDate" in override
              ? override.endDate
              : endDate || undefined,

          keyword:
            override && "keyword" in override
              ? override.keyword
              : keyword.trim() || undefined,
      });
      const sorted = [...data].sort(
        (a, b) =>
          new Date(b.consultationDate).getTime() -
          new Date(a.consultationDate).getTime()
      );

      setConsultations(sorted);
    } catch (err) {
      console.error(err);
      setConsultationError("상담 내역을 불러오지 못했습니다.");
      setConsultations([]);
    } finally {
      setConsultationLoading(false);
    }
  };

  useEffect(() => {
    fetchConsultations();
  }, []);

  const handleSearchConsultations = async () => {
    await fetchConsultations();
  };

  const handleResetConsultationFilters = async () => {
    setSearchStudentId("");
    setStudentName("");
    setTeacherName("");
    setStartDate("");
    setEndDate("");
    setKeyword("");

    await fetchConsultations({
      studentId: undefined,
      studentName: undefined,
      teacherName: undefined,
      startDate: undefined,
      endDate: undefined,
      keyword: undefined,
    });
  };

  const handleSearchStudents = async () => {
    try {
      setStudentSearchLoading(true);
      setStudentSearchError("");

      const data = await searchStudents({
        name: searchName.trim() || undefined,
        grade: searchGrade ? Number(searchGrade) : undefined,
        classNum: searchClassNum ? Number(searchClassNum) : undefined,
        page: 0,
        size: 10,
        sort: ["name,asc"],
      });

      setStudentResults(data.content);
    } catch (err) {
      console.error(err);
      setStudentSearchError("학생 검색에 실패했습니다.");
    } finally {
      setStudentSearchLoading(false);
    }
  };

  useEffect(() => {
    handleSearchStudents();
  }, []);

  const handleSelectStudent = async (student: StudentSearchItem) => {
    setSelectedStudent(student);
    setSearchStudentId(String(student.id));
    setStudentName(student.name);
    setCreateMessage("");
    setCreateError("");
    await fetchConsultations({
      studentId: student.id,
      studentName: student.name,
      teacherName: teacherName.trim() || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      keyword: keyword.trim() || undefined,
    });
  };

  const handleCreateConsultation = async () => {
    if (!selectedStudent) {
      setCreateError("먼저 학생을 선택하세요.");
      return;
    }

    if (!consultationDate) {
      setCreateError("상담일을 입력하세요.");
      return;
    }

    if (!content.trim()) {
      setCreateError("상담 내용을 입력하세요.");
      return;
    }

    try {
      setCreateError("");
      setCreateMessage("");

      const message = await createConsultation({
        studentId: selectedStudent.id,
        consultationDate,
        content: content.trim(),
        nextPlanDate: nextPlanDate || null,
      });

      setCreateMessage(message);
      setContent("");
      setNextPlanDate("");

      await fetchConsultations();
    } catch (err: any) {
      console.error(err);
      setCreateError(err?.response?.data?.message || "상담 등록에 실패했습니다.");
    }
  };

  const openEditModal = (consultation: ConsultationItem) => {
    setEditingConsultation(consultation);
    setEditConsultationDate(toDateInputValue(consultation.consultationDate));
    setEditContent(consultation.content);
    setEditNextPlanDate(toDateInputValue(consultation.nextPlanDate));
    setEditError("");
  };

  const handleUpdateConsultation = async () => {
    if (!editingConsultation) return;

    if (!editConsultationDate) {
      setEditError("상담일을 입력하세요.");
      return;
    }

    if (!editContent.trim()) {
      setEditError("상담 내용을 입력하세요.");
      return;
    }

    try {
      setEditError("");

      await updateConsultation(editingConsultation.id, {
        consultationDate: editConsultationDate,
        content: editContent.trim(),
        nextPlanDate: editNextPlanDate || null,
      });

      setEditingConsultation(null);
      await fetchConsultations();

      setConsultations((prev) =>
        prev.map((item) =>
          item.id === editingConsultation.id
            ? {
                ...item,
                consultationDate: editConsultationDate,
                content: editContent.trim(),
                nextPlanDate: editNextPlanDate || null,
              }
            : item
        )
      );
    } catch (err: any) {
      console.error(err);
      setEditError(err?.response?.data?.message || "상담 수정에 실패했습니다.");
    }
  };

  const resolveReportStudentId = async () => {
    if (searchStudentId) return Number(searchStudentId);

    const trimmedStudentName = studentName.trim();

    if (!trimmedStudentName) return null;

    if (selectedStudent?.name === trimmedStudentName) {
      return selectedStudent.id;
    }

    const data = await searchStudents({
      name: trimmedStudentName,
      page: 0,
      size: 10,
      sort: ["name,asc"],
    });
    const exactMatches = data.content.filter(
      (student) => student.name === trimmedStudentName
    );

    if (exactMatches.length === 1) {
      const [student] = exactMatches;

      setSelectedStudent(student);
      setSearchStudentId(String(student.id));
      return student.id;
    }

    return null;
  };

  const handleDownloadReport = async (format: ReportFormat) => {
    try {
      setReportLoading(format);
      setReportError("");

      const studentId = await resolveReportStudentId();

      if (!studentId) {
        setReportError("보고서를 다운로드할 학생을 학생 검색에서 선택하세요.");
        return;
      }

      await downloadConsultationReport({
        studentId,
        startDate,
        endDate,
        keyword,
        format,
      });
    } catch (err: any) {
      console.error(err);
      setReportError(
        err?.response?.data?.message || "상담 보고서 다운로드에 실패했습니다."
      );
    } finally {
      setReportLoading(null);
    }
  };

  const canTryDownloadReport = Boolean(searchStudentId || studentName.trim());

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">상담 관리</h1>
        <p className="mt-3 text-lg text-slate-500">
          학생 선택 후 상담 등록, 조건 검색으로 상담 내역 조회
        </p>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">상담 내역 검색</h2>
          <p className="mt-3 text-lg text-slate-500">
            학생명, 교사명, 기간, 키워드 조건으로 상담 내역을 조회할 수 있습니다.
          </p>
        </div>

        {searchStudentId && (
          <div className="mt-6 flex flex-wrap items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-700">
            <span className="font-semibold">선택 학생</span>
            <span>
              {studentName || selectedStudent?.name}
              {selectedStudent?.studentNumber
                ? ` (${selectedStudent.studentNumber})`
                : ""}
            </span>
            <button
              type="button"
              onClick={() => {
                setSearchStudentId("");
                setStudentName("");
              }}
              className="ml-auto rounded-xl bg-white px-3 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-100"
            >
              선택 해제
            </button>
          </div>
        )}

        <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
          <input
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="학생 이름"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            value={teacherName}
            onChange={(e) => setTeacherName(e.target.value)}
            placeholder="교사 이름"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="내용 키워드"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <button
            onClick={handleSearchConsultations}
            className="h-14 rounded-2xl bg-blue-600 px-6 text-lg font-semibold text-white hover:bg-blue-700"
          >
            상담 내역 조회
          </button>

          <button
            onClick={handleResetConsultationFilters}
            className="h-14 rounded-2xl bg-slate-100 px-6 text-lg font-semibold text-slate-700 hover:bg-slate-200"
          >
            조건 초기화
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
          <p className="text-sm text-slate-500">
            선택 학생의 상담 보고서를 현재 기간/키워드 조건으로 다운로드합니다.
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDownloadReport("EXCEL")}
              disabled={!canTryDownloadReport || reportLoading !== null}
              className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reportLoading === "EXCEL" ? "Excel 생성 중" : "Excel"}
            </button>
            <button
              type="button"
              onClick={() => handleDownloadReport("PDF")}
              disabled={!canTryDownloadReport || reportLoading !== null}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {reportLoading === "PDF" ? "PDF 생성 중" : "PDF"}
            </button>
          </div>
        </div>

        {reportError && (
          <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
            {reportError}
          </div>
        )}

        {consultationLoading ? (
          <div className="mt-8 text-sm text-slate-500">상담 내역을 불러오는 중...</div>
        ) : consultationError ? (
          <div className="mt-8 text-sm text-red-500">{consultationError}</div>
        ) : consultations.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-slate-100 px-5 py-8 text-center text-sm text-slate-400">
            조회된 상담 내역이 없습니다.
          </div>
        ) : (
          <div className="mt-8 space-y-3">
            {consultations.map((item) => {
              const expanded = expandedIds.includes(item.id);

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 px-5 py-4"
                >
                  <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        학생 {item.studentName}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        학번 {item.studentNumber}
                      </span>
                      <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        교사 {item.teacherName}
                      </span>
                    </div>

                    <div className="whitespace-nowrap text-sm text-slate-400">
                      등록일시 {formatDateTime(item.createdAt)}
                    </div>
                  </div>

                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span>
                      상담일{" "}
                      <strong className="font-semibold text-slate-800">
                        {formatDate(item.consultationDate)}
                      </strong>
                    </span>
                    <span>
                      다음 계획일{" "}
                      <strong className="font-semibold text-slate-800">
                        {formatDate(item.nextPlanDate)}
                      </strong>
                    </span>
                  </div>

                  <div className="mt-3 flex flex-col gap-3 rounded-xl bg-white px-4 py-3 md:flex-row md:items-end md:justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm leading-6 text-slate-700">
                      {expanded
                        ? item.content
                        : `${item.content.slice(0, 120)}${
                            item.content.length > 120 ? "..." : ""
                          }`}
                      </p>

                      {item.content.length > 120 && (
                        <button
                          onClick={() => toggleExpanded(item.id)}
                          className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {expanded ? "접기" : "더보기"}
                        </button>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => openEditModal(item)}
                      className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
                    >
                      수정
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">학생 검색</h2>
            <p className="mt-3 text-lg text-slate-500">
              상담 등록할 학생을 먼저 선택하세요.
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
          <input
            value={searchGrade}
            onChange={(e) => setSearchGrade(e.target.value)}
            placeholder="학년"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            value={searchClassNum}
            onChange={(e) => setSearchClassNum(e.target.value)}
            placeholder="반"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="이름 검색"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500 md:col-span-2"
          />
        </div>

        <button
          onClick={handleSearchStudents}
          className="mt-4 h-14 w-full rounded-2xl bg-blue-600 px-6 text-lg font-semibold text-white hover:bg-blue-700"
        >
          학생 조회
        </button>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-base font-semibold text-slate-600">
                  <th className="px-5 py-4">이름</th>
                  <th className="px-5 py-4">학번</th>
                  <th className="px-5 py-4">학년</th>
                  <th className="px-5 py-4">반</th>
                  <th className="px-5 py-4">선택</th>
                </tr>
              </thead>
              <tbody>
                {studentSearchLoading ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">
                      학생을 불러오는 중...
                    </td>
                  </tr>
                ) : studentSearchError ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-red-500">
                      {studentSearchError}
                    </td>
                  </tr>
                ) : studentResults.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  studentResults.map((student) => (
                    <tr key={student.id} className="border-t border-slate-100 text-base">
                      <td className="px-5 py-4">{student.name}</td>
                      <td className="px-5 py-4">{student.studentNumber}</td>
                      <td className="px-5 py-4">{student.grade}학년</td>
                      <td className="px-5 py-4">{student.classNum}반</td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                        >
                          선택
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-950">상담 등록</h2>
            <p className="mt-3 text-lg text-slate-500">
              선택한 학생에 대해 상담 내용을 등록합니다.
            </p>
          </div>

          <div className="mt-8 space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">선택 학생</label>
              <input
                value={
                  selectedStudent
                    ? `${selectedStudent.name} (${selectedStudent.studentNumber})`
                    : ""
                }
                disabled
                className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">상담일</label>
              <input
                type="date"
                value={consultationDate}
                onChange={(e) => setConsultationDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">상담 내용</label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
                placeholder="상담 내용을 입력하세요"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">
                다음 계획일
              </label>
              <input
                type="date"
                value={nextPlanDate}
                onChange={(e) => setNextPlanDate(e.target.value)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
              />
              <p className="mt-2 text-xs text-slate-400">
                비워두면 null로 저장됩니다.
              </p>
            </div>

            <button
              onClick={handleCreateConsultation}
              className="h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              상담 등록
            </button>

            {createMessage && (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {createMessage}
              </div>
            )}

            {createError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {createError}
              </div>
            )}
          </div>
        </section>
      </div>

      {editingConsultation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
          <div className="w-full max-w-xl rounded-[28px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold tracking-tight text-slate-950">
                  상담 수정
                </h3>
                <p className="mt-1 text-sm text-slate-500">
                  {editingConsultation.studentName} · {editingConsultation.studentNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setEditingConsultation(null)}
                className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                닫기
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    상담일
                  </label>
                  <input
                    type="date"
                    value={editConsultationDate}
                    onChange={(e) => setEditConsultationDate(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">
                    다음 계획일
                  </label>
                  <input
                    type="date"
                    value={editNextPlanDate}
                    onChange={(e) => setEditNextPlanDate(e.target.value)}
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">
                  상담 내용
                </label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={6}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm leading-6 outline-none focus:border-blue-500"
                />
              </div>

              {editError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {editError}
                </div>
              )}

              <button
                type="button"
                onClick={handleUpdateConsultation}
                className="h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                수정 저장
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
