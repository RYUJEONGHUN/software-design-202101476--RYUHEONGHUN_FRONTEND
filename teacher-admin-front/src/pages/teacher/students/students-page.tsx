import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { searchStudents, type StudentSearchItem } from "@/api/student";
import StudentNameCell from "@/components/common/student-name-cell";

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${Number.isInteger(value) ? value : value.toFixed(1)}점`;
}

export default function StudentsPage() {
  const navigate = useNavigate();

  const [grade, setGrade] = useState("");
  const [classNum, setClassNum] = useState("");
  const [name, setName] = useState("");

  const [students, setStudents] = useState<StudentSearchItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await searchStudents({
        name: name.trim() || undefined,
        grade: grade ? Number(grade) : undefined,
        classNum: classNum ? Number(classNum) : undefined,
        page: 0,
        size: 10,
        sort: ["name,asc"],
      });

      setStudents(data.content);
    } catch (err) {
      console.error(err);
      setError("학생 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">학생 관리</h1>
        <p className="mt-3 text-lg text-slate-500">학생 목록 조회 및 학생부 상세 정보 확인</p>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">학생 목록</h2>
          <p className="mt-3 text-lg text-slate-500">
            학년, 반, 이름 조건으로 학생을 검색할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_220px]">
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="학년"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none placeholder:text-slate-400 focus:border-blue-500"
          />

          <input
            value={classNum}
            onChange={(e) => setClassNum(e.target.value)}
            placeholder="반"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none placeholder:text-slate-400 focus:border-blue-500"
          />

          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름 검색"
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none placeholder:text-slate-400 focus:border-blue-500"
          />

          <button
            onClick={fetchStudents}
            className="h-14 rounded-2xl bg-blue-600 px-6 text-lg font-semibold text-white transition hover:bg-blue-700"
          >
            검색
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
                  <th className="px-6 py-5">결석</th>
                  <th className="px-6 py-5">출석</th>
                  <th className="px-6 py-5">평균 점수</th>
                  <th className="px-6 py-5">최근 상담</th>
                  <th className="px-6 py-5">학생부</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-sm text-slate-500">
                      학생 목록을 불러오는 중...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-sm text-red-500">
                      {error}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-6 py-10 text-center text-sm text-slate-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => (
                    <tr key={student.id} className="border-t border-slate-100 text-sm">
                      <td className="px-6 py-5">
                        <StudentNameCell name={student.name} />
                      </td>
                      <td className="px-6 py-5 text-slate-700">{student.studentNumber}</td>
                      <td className="px-6 py-5 text-slate-700">{student.grade}학년</td>
                      <td className="px-6 py-5 text-slate-700">{student.classNum}반</td>
                      <td className="px-6 py-5 text-slate-700">{student.absenceCount}</td>
                      <td className="px-6 py-5 text-slate-700">{student.attendanceCount}</td>
                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                          {formatScore(student.averageScore)}
                        </span>
                      </td>
                      <td className="max-w-[260px] px-6 py-5 text-slate-700">
                        <span className="line-clamp-1">
                          {student.lastConsultationContent || "상담 내역 없음"}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => navigate(`/teacher/students/${student.id}`)}
                          className="h-9 rounded-xl bg-slate-100 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
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
        </div>
      </section>
    </div>
  );
}
