import { useEffect, useState } from "react";
import {
  downloadFeedbackReport,
  type ReportFormat,
} from "@/api/report";
import { searchStudents, type StudentSearchItem } from "@/api/student";
import {
  createFeedback,
  getStudentFeedbacks,
  updateFeedback,
  type FeedbackCategory,
  type FeedbackItem,
  type FeedbackSearchCondition,
} from "@/api/feedback";

function categoryLabel(category: FeedbackCategory) {
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

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

export default function FeedbacksPage() {
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [classNum, setClassNum] = useState("");

  const [studentResults, setStudentResults] = useState<StudentSearchItem[]>([]);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [studentSearchError, setStudentSearchError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<StudentSearchItem | null>(null);

  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState("");
  const [filterCategory, setFilterCategory] = useState<FeedbackCategory | "">("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [filterKeyword, setFilterKeyword] = useState("");
  const [reportLoading, setReportLoading] = useState<ReportFormat | null>(null);
  const [reportError, setReportError] = useState("");

  const [createCategory, setCreateCategory] = useState<FeedbackCategory>("GRADE");
  const [createContent, setCreateContent] = useState("");
  const [createVisibleToParent, setCreateVisibleToParent] = useState(true);

  const [createMessage, setCreateMessage] = useState("");
  const [createError, setCreateError] = useState("");

  const [editingFeedback, setEditingFeedback] = useState<FeedbackItem | null>(null);
  const [editCategory, setEditCategory] = useState<FeedbackCategory>("GRADE");
  const [editContent, setEditContent] = useState("");
  const [editVisibleToParent, setEditVisibleToParent] = useState(true);

  const [editMessage, setEditMessage] = useState("");
  const [editError, setEditError] = useState("");

  const fetchStudents = async () => {
    try {
      setStudentSearchLoading(true);
      setStudentSearchError("");

      const data = await searchStudents({
        name: name.trim() || undefined,
        grade: grade ? Number(grade) : undefined,
        classNum: classNum ? Number(classNum) : undefined,
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
    fetchStudents();
  }, []);

  const handleSearchStudents = async () => {
    await fetchStudents();
  };

  const getFeedbackCondition = (): FeedbackSearchCondition => ({
    category: filterCategory || undefined,
    startDate: filterStartDate || undefined,
    endDate: filterEndDate || undefined,
    keyword: filterKeyword.trim() || undefined,
  });

  const fetchFeedbacks = async (
    studentId: number,
    condition: FeedbackSearchCondition = getFeedbackCondition()
  ) => {
  try {
    setFeedbackLoading(true);
    setFeedbackError("");

    const data = await getStudentFeedbacks(studentId, condition);

    const sorted = [...data].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    setFeedbacks(sorted);
  } catch (err) {
    console.error(err);
    setFeedbackError("피드백 목록을 불러오지 못했습니다.");
    setFeedbacks([]);
  } finally {
    setFeedbackLoading(false);
  }
 };

  const handleSearchFeedbacks = async () => {
    if (!selectedStudent) return;
    await fetchFeedbacks(selectedStudent.id);
  };

  const handleResetFeedbackFilters = async () => {
    const emptyCondition: FeedbackSearchCondition = {};

    setFilterCategory("");
    setFilterStartDate("");
    setFilterEndDate("");
    setFilterKeyword("");

    if (selectedStudent) {
      await fetchFeedbacks(selectedStudent.id, emptyCondition);
    }
  };

  const handleDownloadReport = async (format: ReportFormat) => {
    if (!selectedStudent) return;

    try {
      setReportLoading(format);
      setReportError("");

      await downloadFeedbackReport({
        studentId: selectedStudent.id,
        category: filterCategory,
        startDate: filterStartDate,
        endDate: filterEndDate,
        keyword: filterKeyword,
        format,
      });
    } catch (err: any) {
      console.error(err);
      setReportError(
        err?.response?.data?.message || "피드백 보고서 다운로드에 실패했습니다."
      );
    } finally {
      setReportLoading(null);
    }
  };

  const handleSelectStudent = async (student: StudentSearchItem) => {
    setSelectedStudent(student);
    setCreateMessage("");
    setCreateError("");
    setEditMessage("");
    setEditError("");
    await fetchFeedbacks(student.id);
  };

  const handleCreateFeedback = async () => {
    if (!selectedStudent) {
      setCreateError("먼저 학생을 선택하세요.");
      return;
    }

    if (!createContent.trim()) {
      setCreateError("피드백 내용을 입력하세요.");
      return;
    }

    try {
      setCreateError("");
      setCreateMessage("");

      const message = await createFeedback({
        studentId: selectedStudent.id,
        category: createCategory,
        content: createContent.trim(),
        visibleToParent: createVisibleToParent,
      });

      setCreateMessage(message);
      setCreateContent("");

      await fetchFeedbacks(selectedStudent.id);
    } catch (err: any) {
      console.error(err);
      setCreateError(err?.response?.data?.message || "피드백 등록에 실패했습니다.");
    }
  };

  const openEditModal = (feedback: FeedbackItem) => {
    setEditingFeedback(feedback);
    setEditCategory(feedback.category);
    setEditContent(feedback.content);
    setEditVisibleToParent(feedback.visibleToParent);
    setEditMessage("");
    setEditError("");
  };

  const handleUpdateFeedback = async () => {
    if (!editingFeedback || !selectedStudent) return;

    if (!editContent.trim()) {
      setEditError("피드백 내용을 입력하세요.");
      return;
    }

    try {
      setEditError("");
      setEditMessage("");

      const message = await updateFeedback(editingFeedback.id, {
        category: editCategory,
        content: editContent.trim(),
        visibleToParent: editVisibleToParent,
      });

      setEditMessage(message);
      setEditingFeedback(null);

      await fetchFeedbacks(selectedStudent.id);
    } catch (err: any) {
      console.error(err);
      setEditError(err?.response?.data?.message || "피드백 수정에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">피드백 관리</h1>
        <p className="mt-3 text-lg text-slate-500">
          학생 검색, 피드백 작성, 피드백 수정 및 전체 이력 조회
        </p>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">학생 검색</h2>
          <p className="mt-3 text-lg text-slate-500">
            학년, 반, 이름 조건으로 학생을 검색할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_220px]">
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="학년"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            value={classNum}
            onChange={(e) => setClassNum(e.target.value)}
            placeholder="반"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 검색"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearchStudents}
            className="h-14 rounded-2xl bg-blue-600 px-6 text-lg font-semibold text-white hover:bg-blue-700"
          >
            학생 조회
          </button>
        </div>

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
                    조건에 맞는 학생이 없습니다. 학년, 반, 이름을 다시 확인해보세요.
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">피드백 작성</h2>
          <p className="mt-2 text-base text-slate-500">
            선택한 학생에게 새 피드백을 작성합니다.
          </p>

          <div className="mt-6 space-y-4">
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
              <label className="mb-2 block text-sm font-medium text-slate-600">카테고리</label>
              <select
                value={createCategory}
                onChange={(e) => setCreateCategory(e.target.value as FeedbackCategory)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
              >
                <option value="GRADE">성적</option>
                <option value="BEHAVIOR">행동 발달</option>
                <option value="ATTENDANCE">출결</option>
                <option value="ATTITUDE">수업 태도</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">내용</label>
              <textarea
                value={createContent}
                onChange={(e) => setCreateContent(e.target.value)}
                rows={5}
                placeholder="피드백 내용을 입력하세요"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
              <input
                type="checkbox"
                checked={createVisibleToParent}
                onChange={(e) => setCreateVisibleToParent(e.target.checked)}
              />
              학부모에게 공개
            </label>

            <button
              onClick={handleCreateFeedback}
              className="h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              피드백 등록
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

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">피드백 이력</h2>
          <p className="mt-2 text-base text-slate-500">
            선택한 학생의 전체 피드백 이력을 확인합니다.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-2">
            <select
              value={filterCategory}
              onChange={(e) =>
                setFilterCategory(e.target.value as FeedbackCategory | "")
              }
              disabled={!selectedStudent}
              className="h-12 min-w-0 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
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
              onChange={(e) => setFilterStartDate(e.target.value)}
              disabled={!selectedStudent}
              className="h-12 min-w-0 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            />

            <input
              type="date"
              value={filterEndDate}
              onChange={(e) => setFilterEndDate(e.target.value)}
              disabled={!selectedStudent}
              className="h-12 min-w-0 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            />

            <input
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearchFeedbacks();
                }
              }}
              disabled={!selectedStudent}
              placeholder="내용 키워드"
              className="h-12 min-w-0 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:text-slate-400"
            />
          </div>

          <div className="mt-3 flex justify-end gap-2">
            <button
              type="button"
              onClick={handleResetFeedbackFilters}
              disabled={!selectedStudent || feedbackLoading}
              className="h-10 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              초기화
            </button>
            <button
              type="button"
              onClick={handleSearchFeedbacks}
              disabled={!selectedStudent || feedbackLoading}
              className="h-10 rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              필터 적용
            </button>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-slate-50 px-4 py-3">
            <p className="text-sm text-slate-500">
              현재 필터 조건으로 피드백 요약 보고서를 다운로드합니다.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleDownloadReport("EXCEL")}
                disabled={!selectedStudent || reportLoading !== null}
                className="h-10 rounded-xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {reportLoading === "EXCEL" ? "Excel 생성 중" : "Excel"}
              </button>
              <button
                type="button"
                onClick={() => handleDownloadReport("PDF")}
                disabled={!selectedStudent || reportLoading !== null}
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

          {!selectedStudent ? (
            <div className="mt-6 text-sm text-slate-400">먼저 학생을 선택하세요.</div>
          ) : feedbackLoading ? (
            <div className="mt-6 text-sm text-slate-500">피드백 목록을 불러오는 중...</div>
          ) : feedbackError ? (
            <div className="mt-6 text-sm text-red-500">{feedbackError}</div>
          ) : feedbacks.length === 0 ? (
            <div className="mt-6 text-sm text-slate-400">등록된 피드백이 없습니다.</div>
          ) : (
            <div className="mt-6 space-y-4">
              {feedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="rounded-2xl border border-slate-100 bg-slate-50 p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                        {categoryLabel(feedback.category)}
                      </span>
                      <span className="text-sm text-slate-500">
                        {feedback.teacherName}
                      </span>
                    </div>

                    <div className="text-sm text-slate-400">
                      {formatDateTime(feedback.createdAt)}
                    </div>
                  </div>

                  <p className="mt-3 text-sm leading-6 text-slate-700">{feedback.content}</p>

                  <div className="mt-4 flex items-center justify-between">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        feedback.visibleToParent
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {feedback.visibleToParent ? "학부모 공개" : "학부모 비공개"}
                    </span>

                    <button
                      onClick={() => openEditModal(feedback)}
                      className="rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                    >
                      수정
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {editingFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25 p-4">
          <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h3 className="text-2xl font-bold tracking-tight text-slate-950">피드백 수정</h3>
              <button
                onClick={() => setEditingFeedback(null)}
                className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
              >
                닫기
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">카테고리</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as FeedbackCategory)}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                >
                  <option value="GRADE">성적</option>
                  <option value="BEHAVIOR">행동 발달</option>
                  <option value="ATTENDANCE">출결</option>
                  <option value="ATTITUDE">수업 태도</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">내용</label>
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={5}
                  placeholder="피드백 내용을 입력하세요"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={editVisibleToParent}
                  onChange={(e) => setEditVisibleToParent(e.target.checked)}
                />
                학부모에게 공개
              </label>

              <button
                onClick={handleUpdateFeedback}
                className="h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                수정 저장
              </button>

              {editMessage && (
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {editMessage}
                </div>
              )}

              {editError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {editError}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
