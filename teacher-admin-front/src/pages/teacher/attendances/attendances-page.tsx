import { useEffect, useMemo, useState } from "react";
import {
  createBulkAttendance,
  createSingleAttendance,
  getAttendanceRate,
  getAttendanceReport,
  getUnmarkedStudents,
  updateAttendance,
  type AttendanceReportRecord,
  type AttendanceReportResponse,
  type AttendanceStatus,
  type UnmarkedStudentItem,
} from "@/api/attendance";
import { searchStudents, type StudentSearchItem } from "@/api/student";
import ModalFormShell from "@/components/common/modal-form-shell";
import StudentNameCell from "@/components/common/student-name-cell";

type EditableAttendanceRow = {
  id: number;
  classNum: number;
  grade: number;
  name: string;
  number: number;
  studentNumber: string;
  status: AttendanceStatus;
  note: string;
};

function getToday() {
  return new Date().toISOString().slice(0, 10);
}

function getCurrentYear() {
  return new Date().getFullYear();
}

function getCurrentMonth() {
  return new Date().getMonth() + 1;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  return value.slice(0, 10);
}

function statusLabel(status: AttendanceStatus) {
  switch (status) {
    case "PRESENT":
      return "출석";
    case "TARDY":
      return "지각";
    case "ABSENT":
      return "결석";
    case "EXCUSED":
      return "공결";
    default:
      return status;
  }
}

export default function AttendancesPage() {
  const [date, setDate] = useState(getToday());
  const [year, setYear] = useState(String(getCurrentYear()));
  const [month, setMonth] = useState(String(getCurrentMonth()));

  const [unmarkedStudents, setUnmarkedStudents] = useState<UnmarkedStudentItem[]>([]);
  const [bulkRows, setBulkRows] = useState<EditableAttendanceRow[]>([]);

  const [unmarkedLoading, setUnmarkedLoading] = useState(true);
  const [unmarkedError, setUnmarkedError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<UnmarkedStudentItem | null>(null);

  const [singleStatus, setSingleStatus] = useState<AttendanceStatus>("PRESENT");
  const [singleNote, setSingleNote] = useState("");

  const [attendanceRate, setAttendanceRate] = useState<number | null>(null);
  const [report, setReport] = useState<AttendanceReportResponse | null>(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState("");

  const [editingRecord, setEditingRecord] = useState<AttendanceReportRecord | null>(null);
  const [editStatus, setEditStatus] = useState<AttendanceStatus>("PRESENT");
  const [editNote, setEditNote] = useState("");

  const [singleMessage, setSingleMessage] = useState("");
  const [singleError, setSingleError] = useState("");
  const [bulkMessage, setBulkMessage] = useState("");
  const [bulkError, setBulkError] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [reportErrorMessage, setReportErrorMessage] = useState("");

  const [studentKeyword, setStudentKeyword] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [studentClassNum, setStudentClassNum] = useState("");
  const [studentResults, setStudentResults] = useState<StudentSearchItem[]>([]);
  const [studentSearchLoading, setStudentSearchLoading] = useState(false);
  const [studentSearchError, setStudentSearchError] = useState("");

  const monthOptions = useMemo(
    () => Array.from({ length: 12 }, (_, i) => String(i + 1)),
    []
  );

  const fetchUnmarkedStudents = async () => {
    try {
      setUnmarkedLoading(true);
      setUnmarkedError("");

      const data = await getUnmarkedStudents(date);
      setUnmarkedStudents(data);
      setBulkRows(
        data.map((student) => ({
          ...student,
          status: "PRESENT" as AttendanceStatus,
          note: "",
        }))
      );
    } catch (err) {
      console.error(err);
      setUnmarkedError("미출석자 명단을 불러오지 못했습니다.");
    } finally {
      setUnmarkedLoading(false);
    }
  };

  useEffect(() => {
    fetchUnmarkedStudents();
  }, []);

  const fetchSelectedStudentAttendance = async (student: UnmarkedStudentItem) => {
    try {
      setReportLoading(true);
      setReportError("");
      setReportErrorMessage("");

      const [rate, reportData] = await Promise.all([
        getAttendanceRate(student.id),
        getAttendanceReport(student.id, Number(year), Number(month)),
      ]);

      setAttendanceRate(rate);
      setReport(reportData);
    } catch (err: any) {
      console.error(err);
      setAttendanceRate(null);
      setReport(null);
      const msg = err?.response?.data?.message || "학생 출석 정보를 불러오지 못했습니다.";
      setReportError(msg);
      setReportErrorMessage(msg);
    } finally {
      setReportLoading(false);
    }
  };

  const handleSearchUnmarked = async () => {
    setSingleMessage("");
    setSingleError("");
    setBulkMessage("");
    setBulkError("");
    await fetchUnmarkedStudents();
  };

  const handleSelectStudent = async (student: UnmarkedStudentItem) => {
    setSelectedStudent(student);
    setSingleMessage("");
    setSingleError("");
    setSingleStatus("PRESENT");
    setSingleNote("");
    await fetchSelectedStudentAttendance(student);
  };

  const handleSingleCreate = async () => {
    if (!selectedStudent) {
      setSingleError("먼저 학생을 선택하세요.");
      return;
    }

    try {
      setSingleError("");
      setSingleMessage("");

      const attendanceId = await createSingleAttendance({
        studentId: selectedStudent.id,
        status: singleStatus,
        note: singleNote,
        date,
      });

      setSingleMessage(`출석 등록 완료 (attendanceId: ${attendanceId})`);
      setSingleNote("");

      await fetchUnmarkedStudents();
      await fetchSelectedStudentAttendance(selectedStudent);
    } catch (err: any) {
      console.error(err);
      setSingleError(err?.response?.data?.message || "단건 출석 등록에 실패했습니다.");
    }
  };

  const handleBulkRowStatusChange = (id: number, status: AttendanceStatus) => {
    setBulkRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, status } : row))
    );
  };

  const handleBulkRowNoteChange = (id: number, note: string) => {
    setBulkRows((prev) =>
      prev.map((row) => (row.id === id ? { ...row, note } : row))
    );
  };

  const applyStatusToAll = (status: AttendanceStatus) => {
    setBulkRows((prev) => prev.map((row) => ({ ...row, status })));
  };

  const handleBulkCreate = async () => {
    if (bulkRows.length === 0) {
      setBulkError("일괄 처리할 학생이 없습니다.");
      return;
    }

    try {
      setBulkError("");
      setBulkMessage("");

      const attendanceIds = await createBulkAttendance(
        bulkRows.map((row) => ({
          studentId: row.id,
          status: row.status,
          note: row.note,
          date,
        }))
      );

      setBulkMessage(`일괄 출석 처리 완료 (${attendanceIds.length}건 생성)`);
      await fetchUnmarkedStudents();

      if (selectedStudent) {
        await fetchSelectedStudentAttendance(selectedStudent);
      }
    } catch (err: any) {
      console.error(err);
      setBulkError(err?.response?.data?.message || "일괄 출석 처리에 실패했습니다.");
    }
  };

  const handleSearchStudentsForAttendance = async () => {
    try {
      setStudentSearchLoading(true);
      setStudentSearchError("");

      const data = await searchStudents({
        name: studentKeyword.trim() || undefined,
        grade: studentGrade ? Number(studentGrade) : undefined,
        classNum: studentClassNum ? Number(studentClassNum) : undefined,
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

  const handleSelectStudentForReport = async (student: StudentSearchItem) => {
    const converted: UnmarkedStudentItem = {
      id: student.id,
      name: student.name,
      studentNumber: student.studentNumber,
      grade: student.grade,
      classNum: student.classNum,
      number: 0,
    };

    setSelectedStudent(converted);
    setReportMessage("");
    setReportErrorMessage("");
    await fetchSelectedStudentAttendance(converted);
  };

  const handleSearchReport = async () => {
    if (!selectedStudent) {
      setReportErrorMessage("먼저 학생을 선택하세요.");
      return;
    }

    setReportMessage("");
    setReportErrorMessage("");
    await fetchSelectedStudentAttendance(selectedStudent);
  };

  const openEditModal = (record: AttendanceReportRecord) => {
    setEditingRecord(record);
    setEditStatus(record.status);
    setEditNote(record.note ?? "");
    setReportMessage("");
    setReportErrorMessage("");
  };

  const handleUpdateAttendance = async () => {
    if (!editingRecord) return;

    try {
      setReportErrorMessage("");
      setReportMessage("");

      const resultMessage = await updateAttendance(editingRecord.attendanceId, {
        status: editStatus,
        note: editNote,
      });

      setReportMessage(resultMessage);
      setEditingRecord(null);

      if (selectedStudent) {
        await fetchSelectedStudentAttendance(selectedStudent);
      }
    } catch (err: any) {
      console.error(err);
      setReportErrorMessage(err?.response?.data?.message || "출석 수정에 실패했습니다.");
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">출석 관리</h1>
        <p className="mt-3 text-lg text-slate-500">
          날짜별 미출석자 조회, 단건/일괄 출석 처리, 학생별 출석 기록 관리
        </p>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">미출석자 명단 조회</h2>
          <p className="mt-3 text-lg text-slate-500">
            특정 날짜에 아직 출석 체크되지 않은 학생 목록을 조회합니다.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_220px]">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />

          <button
            onClick={handleSearchUnmarked}
            className="h-14 rounded-2xl bg-blue-600 px-6 text-lg font-semibold text-white hover:bg-blue-700"
          >
            조회
          </button>
        </div>

        <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100">
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-base font-semibold text-slate-600">
                  <th className="px-6 py-5">이름</th>
                  <th className="px-6 py-5">학번</th>
                  <th className="px-6 py-5">학년</th>
                  <th className="px-6 py-5">반</th>
                  <th className="px-6 py-5">번호</th>
                  <th className="px-6 py-5">선택</th>
                </tr>
              </thead>
              <tbody>
                {unmarkedLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                      미출석자 명단을 불러오는 중...
                    </td>
                  </tr>
                ) : unmarkedError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-red-500">
                      {unmarkedError}
                    </td>
                  </tr>
                ) : unmarkedStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                      해당 날짜에 미출석자가 없습니다.
                    </td>
                  </tr>
                ) : (
                  unmarkedStudents.map((student) => (
                    <tr key={student.id} className="border-t border-slate-100 text-sm">
                      <td className="px-6 py-5 whitespace-nowrap">
                        <StudentNameCell name={student.name} />
                      </td>
                      <td className="px-6 py-5 text-slate-700">{student.studentNumber}</td>
                      <td className="px-6 py-5 text-slate-700 whitespace-nowrap">{student.grade}학년</td>
                      <td className="px-6 py-5 text-slate-700 whitespace-nowrap">{student.classNum}반</td>
                      <td className="px-6 py-5 text-slate-700">{student.number}</td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className="h-9 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200"
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
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">단건 출석 등록</h2>
          <p className="mt-2 text-base text-slate-500">
            선택한 학생 1명에 대해 출석 정보를 등록합니다.
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
              <label className="mb-2 block text-sm font-medium text-slate-600">상태</label>
              <select
                value={singleStatus}
                onChange={(e) => setSingleStatus(e.target.value as AttendanceStatus)}
                className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
              >
                <option value="PRESENT">출석</option>
                <option value="TARDY">지각</option>
                <option value="ABSENT">결석</option>
                <option value="EXCUSED">공결</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-600">비고</label>
              <textarea
                value={singleNote}
                onChange={(e) => setSingleNote(e.target.value)}
                rows={4}
                placeholder="비고를 입력하세요"
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
              />
            </div>

            <button
              onClick={handleSingleCreate}
              className="h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
            >
              단건 출석 등록
            </button>

            {singleMessage && (
              <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {singleMessage}
              </div>
            )}

            {singleError && (
              <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                {singleError}
              </div>
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-950">일괄 출석 처리</h2>
              <p className="mt-2 max-w-xl text-base leading-7 text-slate-500">
                각 학생의 출석 상태와 비고를 개별 설정한 뒤 한 번에 저장합니다.
              </p>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <button
                onClick={() => applyStatusToAll("PRESENT")}
                className="h-10 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                전체 출석
              </button>
              <button
                onClick={() => applyStatusToAll("TARDY")}
                className="h-10 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                전체 지각
              </button>
              <button
                onClick={() => applyStatusToAll("ABSENT")}
                className="h-10 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                전체 결석
              </button>
              <button
                onClick={() => applyStatusToAll("EXCUSED")}
                className="h-10 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
              >
                전체 공결
              </button>
            </div>
          </div>

          {bulkRows.length === 0 ? (
            <div className="mt-6 text-sm text-slate-400">일괄 처리할 학생이 없습니다.</div>
          ) : (
            <>
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
                <div className="max-h-[420px] overflow-auto">
                  <table className="min-w-full">
                    <thead className="bg-slate-50">
                      <tr className="text-left text-sm font-semibold text-slate-600">
                        <th className="px-4 py-4">이름</th>
                        <th className="px-4 py-4">학번</th>
                        <th className="px-4 py-4">학년</th>
                        <th className="px-4 py-4">반</th>
                        <th className="px-4 py-4">상태</th>
                        <th className="px-4 py-4">비고</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bulkRows.map((row) => (
                        <tr key={row.id} className="border-t border-slate-100 align-top">
                          <td className="px-4 py-4 text-sm font-medium text-slate-900 whitespace-nowrap">
                            {row.name}
                          </td>
                          <td className="px-4 py-4 text-slate-700">{row.studentNumber}</td>
                          <td className="px-4 py-4 text-sm text-slate-700 whitespace-nowrap">
                            {row.grade}학년
                          </td>
                          <td className="px-4 py-4 text-sm text-slate-700 whitespace-nowrap">
                            {row.classNum}반
                          </td>
                          <td className="px-4 py-4">
                            <select
                              value={row.status}
                              onChange={(e) =>
                                handleBulkRowStatusChange(
                                  row.id,
                                  e.target.value as AttendanceStatus
                                )
                              }
                              className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                            >
                              <option value="PRESENT">출석</option>
                              <option value="TARDY">지각</option>
                              <option value="ABSENT">결석</option>
                              <option value="EXCUSED">공결</option>
                            </select>
                          </td>
                          <td className="px-4 py-4">
                            <input
                              value={row.note}
                              onChange={(e) => handleBulkRowNoteChange(row.id, e.target.value)}
                              placeholder="비고 입력"
                              className="h-10 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-500"
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <button
                onClick={handleBulkCreate}
                className="mt-6 h-12 w-full rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
              >
                일괄 출석 저장
              </button>

              {bulkMessage && (
                <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  {bulkMessage}
                </div>
              )}

              {bulkError && (
                <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {bulkError}
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">학생별 출석 통계 조회</h2>
          <p className="mt-3 text-lg text-slate-500">
            미출석 여부와 상관없이 학생을 검색해 출석 통계를 조회할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_220px]">
          <input
            value={studentGrade}
            onChange={(e) => setStudentGrade(e.target.value)}
            placeholder="학년"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            value={studentClassNum}
            onChange={(e) => setStudentClassNum(e.target.value)}
            placeholder="반"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <input
            value={studentKeyword}
            onChange={(e) => setStudentKeyword(e.target.value)}
            placeholder="이름 검색"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          />
          <button
            onClick={handleSearchStudentsForAttendance}
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
                <th className="px-5 py-4">조회</th>
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
                    <td className="px-5 py-4">
                      <StudentNameCell name={student.name} />
                    </td>
                    <td className="px-5 py-4">{student.studentNumber}</td>
                    <td className="px-5 py-4">{student.grade}학년</td>
                    <td className="px-5 py-4">{student.classNum}반</td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => handleSelectStudentForReport(student)}
                        className="h-9 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-200"
                      >
                        조회
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {selectedStudent && (
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-950">
                {selectedStudent.name}
              </h2>
              <p className="mt-2 text-lg text-slate-500">
                {selectedStudent.grade}학년 {selectedStudent.classNum}반 · 학번 {selectedStudent.studentNumber}
              </p>
            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-3 text-blue-700">
              <div className="text-sm font-medium">출석률</div>
              <div className="text-2xl font-bold">
                {attendanceRate !== null ? `${attendanceRate}%` : "-"}
              </div>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_220px]">
            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              placeholder="년도"
              className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
            />

            <select
              value={month}
              onChange={(e) => setMonth(e.target.value)}
              className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
            >
              {monthOptions.map((value) => (
                <option key={value} value={value}>
                  {value}월
                </option>
              ))}
            </select>

            <button
              onClick={handleSearchReport}
              className="h-14 rounded-2xl bg-blue-600 px-6 text-lg font-semibold text-white hover:bg-blue-700"
            >
              통계 조회
            </button>
          </div>

          {reportMessage && (
            <div className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {reportMessage}
            </div>
          )}

          {reportErrorMessage && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {reportErrorMessage}
            </div>
          )}

          {reportLoading ? (
            <div className="mt-8 text-sm text-slate-500">월간 출석 통계를 불러오는 중...</div>
          ) : reportError ? (
            <div className="mt-8 text-sm text-red-500">{reportError}</div>
          ) : report ? (
            <>
              <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-5">
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-sm text-slate-500">출석</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{report.presentCount}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-sm text-slate-500">지각</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{report.tardyCount}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-sm text-slate-500">결석</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{report.absentCount}</div>
                </div>
                <div className="rounded-2xl bg-slate-50 p-5">
                  <div className="text-sm text-slate-500">공결</div>
                  <div className="mt-2 text-2xl font-bold text-slate-900">{report.excusedCount}</div>
                </div>
                <div className="rounded-2xl bg-blue-50 p-5">
                  <div className="text-sm text-blue-600">출석률</div>
                  <div className="mt-2 text-2xl font-bold text-blue-700">{report.attendanceRate}%</div>
                </div>
              </div>

              <div className="mt-8 overflow-hidden rounded-2xl border border-slate-100">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-base font-semibold text-slate-600">
                      <th className="px-5 py-4">날짜</th>
                      <th className="px-5 py-4">상태</th>
                      <th className="px-5 py-4">비고</th>
                      <th className="px-5 py-4">수정</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.records.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-5 py-8 text-center text-sm text-slate-400">
                          해당 월의 출석 기록이 없습니다.
                        </td>
                      </tr>
                    ) : (
                      report.records.map((record) => (
                        <tr key={record.attendanceId} className="border-t border-slate-100 text-base">
                          <td className="px-5 py-4 text-slate-700">{record.date}</td>
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {statusLabel(record.status)}
                          </td>
                          <td className="px-5 py-4 text-slate-700">{record.note || "-"}</td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() => openEditModal(record)}
                              className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-200"
                            >
                              수정
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </section>
      )}

      {editingRecord && (
        <ModalFormShell
          title="출석 기록 수정"
          description={`${formatDate(editingRecord.date)} 출석 상태와 비고를 수정합니다.`}
          onClose={() => setEditingRecord(null)}
        >
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">상태</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as AttendanceStatus)}
                  className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                >
                  <option value="PRESENT">출석</option>
                  <option value="TARDY">지각</option>
                  <option value="ABSENT">결석</option>
                  <option value="EXCUSED">공결</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-600">비고</label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  rows={4}
                  placeholder="비고를 입력하세요"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-blue-500"
                />
              </div>

              <button
                onClick={handleUpdateAttendance}
                className="h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
              >
                수정 저장
              </button>
            </div>
        </ModalFormShell>
      )}
    </div>
  );
}
