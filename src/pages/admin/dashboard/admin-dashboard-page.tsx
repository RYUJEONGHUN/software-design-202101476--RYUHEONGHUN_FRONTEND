import { useState } from "react";
import {
  registerAdminParent,
  registerAdminStudent,
  registerAdminTeacher,
  registerAdminUser,
  updateAdminUserRole,
  type AdminRole,
} from "@/api/admin";
import { downloadGradeReport } from "@/api/grade";
import {
  downloadConsultationReport,
  downloadFeedbackReport,
  type ReportFormat,
} from "@/api/report";
import {
  getStudentDetail,
  searchStudents,
  type StudentDetailResponse,
  type StudentSearchItem,
} from "@/api/student";

type Message = {
  type: "success" | "error";
  text: string;
};

function messageClass(type: Message["type"]) {
  return type === "success"
    ? "bg-emerald-50 text-emerald-700"
    : "bg-red-50 text-red-700";
}

function parseIdList(value: string) {
  return value
    .split(",")
    .map((item) => Number(item.trim()))
    .filter((item) => Number.isFinite(item));
}

export default function AdminDashboardPage() {
  const [userForm, setUserForm] = useState({
    username: "",
    name: "",
    phoneNumber: "",
  });
  const [roleUserId, setRoleUserId] = useState("");
  const [role, setRole] = useState<AdminRole>("STUDENT");

  const [studentUserId, setStudentUserId] = useState("");
  const [studentForm, setStudentForm] = useState({
    studentNumber: "",
    grade: "",
    classNum: "",
    number: "",
  });

  const [teacherUserId, setTeacherUserId] = useState("");
  const [teacherSubject, setTeacherSubject] = useState("");

  const [parentUserId, setParentUserId] = useState("");
  const [parentStudentIds, setParentStudentIds] = useState("");

  const [searchName, setSearchName] = useState("");
  const [searchGrade, setSearchGrade] = useState("");
  const [searchClassNum, setSearchClassNum] = useState("");
  const [students, setStudents] = useState<StudentSearchItem[]>([]);
  const [selectedStudent, setSelectedStudent] =
    useState<StudentDetailResponse | null>(null);

  const [reportStudentId, setReportStudentId] = useState("");
  const [reportSemester, setReportSemester] = useState("2026-1");
  const [reportCategory, setReportCategory] = useState("");
  const [reportStartDate, setReportStartDate] = useState("");
  const [reportEndDate, setReportEndDate] = useState("");
  const [reportKeyword, setReportKeyword] = useState("");

  const [message, setMessage] = useState<Message | null>(null);
  const [loadingKey, setLoadingKey] = useState("");

  const runAction = async (key: string, action: () => Promise<string | void>) => {
    try {
      setLoadingKey(key);
      setMessage(null);

      const result = await action();
      setMessage({
        type: "success",
        text: result || "처리되었습니다.",
      });
    } catch (err: any) {
      console.error(err);
      setMessage({
        type: "error",
        text: err?.response?.data?.message || "처리에 실패했습니다.",
      });
    } finally {
      setLoadingKey("");
    }
  };

  const handleRegisterUser = () =>
    runAction("registerUser", async () =>
      registerAdminUser({
        username: userForm.username.trim(),
        name: userForm.name.trim(),
        phoneNumber: userForm.phoneNumber.trim(),
      })
    );

  const handleUpdateRole = () =>
    runAction("updateRole", async () =>
      updateAdminUserRole(Number(roleUserId), role)
    );

  const handleRegisterStudent = () =>
    runAction("registerStudent", async () =>
      registerAdminStudent(Number(studentUserId), {
        studentNumber: studentForm.studentNumber.trim(),
        grade: Number(studentForm.grade),
        classNum: Number(studentForm.classNum),
        number: Number(studentForm.number),
      })
    );

  const handleRegisterTeacher = () =>
    runAction("registerTeacher", async () =>
      registerAdminTeacher(Number(teacherUserId), teacherSubject.trim())
    );

  const handleRegisterParent = () =>
    runAction("registerParent", async () =>
      registerAdminParent(Number(parentUserId), {
        studentIds: parseIdList(parentStudentIds),
      })
    );

  const handleSearchStudents = () =>
    runAction("searchStudents", async () => {
      const data = await searchStudents({
        name: searchName.trim() || undefined,
        grade: searchGrade ? Number(searchGrade) : undefined,
        classNum: searchClassNum ? Number(searchClassNum) : undefined,
        page: 0,
        size: 10,
      });
      setStudents(data.content);
      return "학생 목록을 조회했습니다.";
    });

  const handleSelectStudent = (student: StudentSearchItem) =>
    runAction("selectStudent", async () => {
      const detail = await getStudentDetail(student.id);
      setSelectedStudent(detail);
      setReportStudentId(String(student.id));
      return "학생 상세를 조회했습니다.";
    });

  const handleDownload = (kind: "grade" | "feedback" | "consultation", format: ReportFormat) =>
    runAction(`${kind}-${format}`, async () => {
      const studentId = Number(reportStudentId);

      if (!studentId) {
        throw new Error("보고서를 다운로드할 학생 ID를 입력하세요.");
      }

      if (kind === "grade") {
        await downloadGradeReport(studentId, reportSemester, format);
      }

      if (kind === "feedback") {
        await downloadFeedbackReport({
          studentId,
          category: reportCategory as any,
          startDate: reportStartDate,
          endDate: reportEndDate,
          keyword: reportKeyword,
          format,
        });
      }

      if (kind === "consultation") {
        await downloadConsultationReport({
          studentId,
          startDate: reportStartDate,
          endDate: reportEndDate,
          keyword: reportKeyword,
          format,
        });
      }

      return "보고서 다운로드를 시작했습니다.";
    });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          관리자 콘솔
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          사용자 등록, 역할 지정, 학생/교사/학부모 상세 등록과 보고서를 관리합니다.
        </p>
      </div>

      {message && (
        <div className={`rounded-2xl px-5 py-4 text-sm ${messageClass(message.type)}`}>
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">유저 등록</h2>
          <p className="mt-2 text-sm text-slate-500">
            테스트용 유저의 기본 정보를 등록합니다.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3">
            <input
              value={userForm.username}
              onChange={(event) =>
                setUserForm((prev) => ({ ...prev, username: event.target.value }))
              }
              placeholder="이메일"
              className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
            />
            <input
              value={userForm.name}
              onChange={(event) =>
                setUserForm((prev) => ({ ...prev, name: event.target.value }))
              }
              placeholder="이름"
              className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
            />
            <input
              value={userForm.phoneNumber}
              onChange={(event) =>
                setUserForm((prev) => ({ ...prev, phoneNumber: event.target.value }))
              }
              placeholder="전화번호"
              className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
            />
            <button
              type="button"
              onClick={handleRegisterUser}
              disabled={loadingKey === "registerUser"}
              className="h-12 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60"
            >
              유저 등록
            </button>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">역할 변경</h2>
          <p className="mt-2 text-sm text-slate-500">
            일반 유저의 권한을 변경합니다.
          </p>

          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_180px]">
            <input
              type="number"
              value={roleUserId}
              onChange={(event) => setRoleUserId(event.target.value)}
              placeholder="대상 유저 ID"
              className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
            />
            <select
              value={role}
              onChange={(event) => setRole(event.target.value as AdminRole)}
              className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400"
            >
              <option value="STUDENT">학생</option>
              <option value="TEACHER">교사</option>
              <option value="PARENT">학부모</option>
              <option value="ADMIN">관리자</option>
            </select>
            <button
              type="button"
              onClick={handleUpdateRole}
              disabled={loadingKey === "updateRole"}
              className="h-12 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 md:col-span-2"
            >
              역할 변경
            </button>
          </div>
        </section>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">역할 상세 등록</h2>
        <p className="mt-2 text-sm text-slate-500">
          대상 유저 ID를 기준으로 학생, 교사, 학부모 상세 정보를 등록합니다.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">학생 등록</h3>
            <div className="mt-4 space-y-3">
              <input className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" type="number" value={studentUserId} onChange={(e) => setStudentUserId(e.target.value)} placeholder="유저 ID" />
              <input className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" value={studentForm.studentNumber} onChange={(e) => setStudentForm((p) => ({ ...p, studentNumber: e.target.value }))} placeholder="학번" />
              <div className="grid grid-cols-3 gap-2">
                <input className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" type="number" value={studentForm.grade} onChange={(e) => setStudentForm((p) => ({ ...p, grade: e.target.value }))} placeholder="학년" />
                <input className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" type="number" value={studentForm.classNum} onChange={(e) => setStudentForm((p) => ({ ...p, classNum: e.target.value }))} placeholder="반" />
                <input className="h-11 rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" type="number" value={studentForm.number} onChange={(e) => setStudentForm((p) => ({ ...p, number: e.target.value }))} placeholder="번호" />
              </div>
              <button type="button" onClick={handleRegisterStudent} disabled={loadingKey === "registerStudent"} className="h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                학생 등록
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">교사 등록</h3>
            <div className="mt-4 space-y-3">
              <input className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" type="number" value={teacherUserId} onChange={(e) => setTeacherUserId(e.target.value)} placeholder="유저 ID" />
              <input className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" value={teacherSubject} onChange={(e) => setTeacherSubject(e.target.value)} placeholder="담당 과목명" />
              <button type="button" onClick={handleRegisterTeacher} disabled={loadingKey === "registerTeacher"} className="h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                교사 등록
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">학부모 등록</h3>
            <div className="mt-4 space-y-3">
              <input className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" type="number" value={parentUserId} onChange={(e) => setParentUserId(e.target.value)} placeholder="유저 ID" />
              <input className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-blue-400" value={parentStudentIds} onChange={(e) => setParentStudentIds(e.target.value)} placeholder="자녀 학생 ID들, 예: 22,24" />
              <button type="button" onClick={handleRegisterParent} disabled={loadingKey === "registerParent"} className="h-11 w-full rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
                학부모 등록
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">학생 검색/조회</h2>
        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_1fr_160px]">
          <input value={searchName} onChange={(e) => setSearchName(e.target.value)} placeholder="이름" className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" />
          <input type="number" value={searchGrade} onChange={(e) => setSearchGrade(e.target.value)} placeholder="학년" className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" />
          <input type="number" value={searchClassNum} onChange={(e) => setSearchClassNum(e.target.value)} placeholder="반" className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" />
          <button type="button" onClick={handleSearchStudents} disabled={loadingKey === "searchStudents"} className="h-12 rounded-xl bg-blue-600 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60">
            검색
          </button>
        </div>

        <div className="mt-5 overflow-hidden rounded-2xl border border-slate-100">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-slate-500">
              <tr>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">학번</th>
                <th className="px-4 py-3">학년/반</th>
                <th className="px-4 py-3">평균</th>
                <th className="px-4 py-3">조회</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                    검색 결과가 없습니다.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-t border-slate-100">
                    <td className="px-4 py-3 font-semibold text-slate-900">{student.name}</td>
                    <td className="px-4 py-3 text-slate-700">{student.studentNumber}</td>
                    <td className="px-4 py-3 text-slate-700">{student.grade}학년 {student.classNum}반</td>
                    <td className="px-4 py-3 text-slate-700">{student.averageScore}</td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => handleSelectStudent(student)} className="rounded-xl bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200">
                        상세
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {selectedStudent && (
          <div className="mt-5 rounded-2xl bg-slate-50 p-4">
            <h3 className="font-bold text-slate-900">
              {selectedStudent.name} · {selectedStudent.studentNumber}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {selectedStudent.grade}학년 {selectedStudent.classNum}반 · 출석률{" "}
              {selectedStudent.attendanceRate}%
            </p>
            <p className="mt-2 text-sm text-slate-500">
              최근 상담 {selectedStudent.recentConsultations.length}건 · 피드백{" "}
              {selectedStudent.recentFeedbacks.length}건 · 성적{" "}
              {selectedStudent.subjectScores.length}건
            </p>
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-900">보고서 다운로드</h2>
        <p className="mt-2 text-sm text-slate-500">
          학생 ID 기준으로 성적, 피드백, 상담 보고서를 다운로드합니다.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <input type="number" value={reportStudentId} onChange={(e) => setReportStudentId(e.target.value)} placeholder="학생 ID" className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" />
          <input value={reportSemester} onChange={(e) => setReportSemester(e.target.value)} placeholder="성적 학기, 예: 2026-1" className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" />
          <select value={reportCategory} onChange={(e) => setReportCategory(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400">
            <option value="">피드백 전체 카테고리</option>
            <option value="GRADE">성적</option>
            <option value="BEHAVIOR">행동 발달</option>
            <option value="ATTENDANCE">출결</option>
            <option value="ATTITUDE">수업 태도</option>
          </select>
          <input type="date" value={reportStartDate} onChange={(e) => setReportStartDate(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" />
          <input type="date" value={reportEndDate} onChange={(e) => setReportEndDate(e.target.value)} className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" />
          <input value={reportKeyword} onChange={(e) => setReportKeyword(e.target.value)} placeholder="피드백/상담 키워드" className="h-12 rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-400" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
          <ReportButtons title="성적" onDownload={(format) => handleDownload("grade", format)} loadingKey={loadingKey} kind="grade" />
          <ReportButtons title="피드백" onDownload={(format) => handleDownload("feedback", format)} loadingKey={loadingKey} kind="feedback" />
          <ReportButtons title="상담" onDownload={(format) => handleDownload("consultation", format)} loadingKey={loadingKey} kind="consultation" />
        </div>
      </section>
    </div>
  );
}

type ReportButtonsProps = {
  title: string;
  kind: string;
  loadingKey: string;
  onDownload: (format: ReportFormat) => void;
};

function ReportButtons({
  title,
  kind,
  loadingKey,
  onDownload,
}: ReportButtonsProps) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="font-semibold text-slate-900">{title}</p>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onDownload("EXCEL")}
          disabled={loadingKey === `${kind}-EXCEL`}
          className="h-10 rounded-xl bg-emerald-600 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Excel
        </button>
        <button
          type="button"
          onClick={() => onDownload("PDF")}
          disabled={loadingKey === `${kind}-PDF`}
          className="h-10 rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          PDF
        </button>
      </div>
    </div>
  );
}
