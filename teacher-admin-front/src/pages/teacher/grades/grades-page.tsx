import { useEffect, useMemo, useState } from "react";
import { searchStudents, type StudentSearchItem } from "@/api/student";
import {
  createGrade,
  downloadGradeReport,
  getGradeChart,
  type GradeChartResponse,
  type GradeReportFormat,
} from "@/api/grade";
import {
  Bar,
  BarChart,
  CartesianGrid,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StudentNameCell from "@/components/common/student-name-cell";

type ChartRow = {
  gradeId: number;
  subject: string;
  myScore: number;
  letterGrade: string;
  classAverage: number;
  totalAverage: number;
};

type ChartView = "radar" | "bar";

function formatScore(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "-";
  return `${Number.isInteger(value) ? value : value.toFixed(1)}점`;
}

export default function GradesPage() {
  const [grade, setGrade] = useState("");
  const [classNum, setClassNum] = useState("");
  const [name, setName] = useState("");
  const [semester, setSemester] = useState("2026-1");
  const [subjectFilter, setSubjectFilter] = useState("전체");

  const [students, setStudents] = useState<StudentSearchItem[]>([]);
  const [studentLoading, setStudentLoading] = useState(true);
  const [studentError, setStudentError] = useState("");

  const [selectedStudent, setSelectedStudent] = useState<StudentSearchItem | null>(null);

  const [chartData, setChartData] = useState<GradeChartResponse | null>(null);
  const [chartView, setChartView] = useState<ChartView>("radar");
  const [chartLoading, setChartLoading] = useState(false);
  const [chartError, setChartError] = useState("");

  const [newScore, setNewScore] = useState("");
  const [saveMessage, setSaveMessage] = useState("");
  const [saveError, setSaveError] = useState("");
  const [reportLoading, setReportLoading] = useState<GradeReportFormat | null>(null);
  const [reportError, setReportError] = useState("");

  const fetchStudents = async () => {
    try {
      setStudentLoading(true);
      setStudentError("");

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
      setStudentError("학생 목록을 불러오지 못했습니다.");
    } finally {
      setStudentLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchChart = async (studentId: number, semesterValue: string) => {
    try {
      setChartLoading(true);
      setChartError("");
      setChartData(null);

      const data = await getGradeChart(studentId, semesterValue);
      setChartData(data);
      setSubjectFilter("전체");
    } catch (err) {
      console.error(err);
      setChartError("성적 차트 정보를 불러오지 못했습니다.");
    } finally {
      setChartLoading(false);
    }
  };

  const handleSelectStudent = async (student: StudentSearchItem) => {
    setSelectedStudent(student);
    setSaveMessage("");
    setSaveError("");
    await fetchChart(student.id, semester);
  };

  const handleSemesterChange = async (value: string) => {
    setSemester(value);
    if (selectedStudent) {
      await fetchChart(selectedStudent.id, value);
    }
  };

  const handleCreateGrade = async () => {
    if (!selectedStudent) {
      setSaveError("먼저 학생을 선택하세요.");
      return;
    }

    if (!newScore) {
      setSaveError("점수를 입력하세요.");
      return;
    }

    try {
      setSaveError("");
      setSaveMessage("");

      const message = await createGrade({
        studentId: selectedStudent.id,
        score: Number(newScore),
        semester,
      });

      setSaveMessage(message);
      setNewScore("");
      await fetchChart(selectedStudent.id, semester);
    } catch (err: any) {
      console.error(err);
      const message =
        err?.response?.data?.message || "성적 등록에 실패했습니다.";
      setSaveError(message);
    }
  };

  const handleDownloadReport = async (format: GradeReportFormat) => {
    if (!selectedStudent) return;

    try {
      setReportLoading(format);
      setReportError("");
      await downloadGradeReport(selectedStudent.id, semester, format);
    } catch (err: any) {
      console.error(err);
      setReportError(
        err?.response?.data?.message || "성적 보고서 다운로드에 실패했습니다."
      );
    } finally {
      setReportLoading(null);
    }
  };

  const allRows = useMemo<ChartRow[]>(() => {
    if (!chartData) return [];

    return chartData.scores.map((score) => ({
      gradeId: score.gradeId,
      subject: score.subjectName,
      myScore: score.score,
      letterGrade: score.letterGrade,
      classAverage: score.classAverage,
      totalAverage: score.totalAverage,
    }));
  }, [chartData]);

  const subjectOptions = useMemo(() => {
    if (!allRows.length) return ["전체"];
    return ["전체", ...allRows.map((row) => row.subject)];
  }, [allRows]);

  const filteredRows = useMemo(() => {
    if (subjectFilter === "전체") return allRows;
    return allRows.filter((row) => row.subject === subjectFilter);
  }, [allRows, subjectFilter]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-950">성적 관리</h1>
        <p className="mt-3 text-lg text-slate-500">
          학생 성적 조회, 과목별 비교, 성적 등록
        </p>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">학생 검색</h2>
          <p className="mt-3 text-lg text-slate-500">
            학년, 반, 이름 조건으로 학생을 검색할 수 있습니다.
          </p>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr_1fr_1fr_220px]">
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
          <select
            value={semester}
            onChange={(e) => handleSemesterChange(e.target.value)}
            className="h-14 rounded-2xl border border-slate-200 px-5 text-base outline-none focus:border-blue-500"
          >
            <option value="2026-1">2026-1</option>
            <option value="2026-2">2026-2</option>
          </select>

          <button
            onClick={fetchStudents}
            className="h-14 rounded-2xl bg-blue-600 px-6 text-lg font-semibold text-white hover:bg-blue-700"
          >
            검색
          </button>
        </div>
      </section>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-950">학생 목록</h2>
          <p className="mt-3 text-lg text-slate-500">성적을 조회할 학생을 선택하세요.</p>
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
                  <th className="px-6 py-5">평균 점수</th>
                  <th className="px-6 py-5">성적</th>
                </tr>
              </thead>
              <tbody>
                {studentLoading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                      학생 목록을 불러오는 중...
                    </td>
                  </tr>
                ) : studentError ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-red-500">
                      {studentError}
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400">
                      검색 결과가 없습니다.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const isSelected = selectedStudent?.id === student.id;

                    return (
                    <tr
                      key={student.id}
                      className={`border-t border-slate-100 text-sm ${
                        isSelected ? "bg-blue-50/70" : ""
                      }`}
                    >
                      <td className="px-6 py-5">
                        <StudentNameCell name={student.name} />
                      </td>
                      <td className="px-6 py-5 text-slate-700">{student.studentNumber}</td>
                      <td className="px-6 py-5 text-slate-700">{student.grade}학년</td>
                      <td className="px-6 py-5 text-slate-700">{student.classNum}반</td>
                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-bold text-slate-700">
                          {formatScore(student.averageScore)}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <button
                          onClick={() => handleSelectStudent(student)}
                          className={`h-9 rounded-xl px-4 text-sm font-semibold transition ${
                            isSelected
                              ? "bg-blue-600 text-white hover:bg-blue-700"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {isSelected ? "선택됨" : "성적 조회"}
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
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

            <div className="flex flex-wrap gap-3">
              {chartData && (
                <>
                  <div className="rounded-2xl bg-emerald-50 px-5 py-3 text-emerald-700">
                    <div className="text-sm font-medium">평균</div>
                    <div className="text-2xl font-bold">
                      {formatScore(chartData.averageScore)}
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 px-5 py-3 text-slate-700">
                    <div className="text-sm font-medium">종합 등급</div>
                    <div className="text-2xl font-bold">
                      {chartData.overallGrade}
                    </div>
                  </div>
                </>
              )}

              <div className="rounded-2xl bg-blue-50 px-5 py-3 text-blue-700">
                <div className="text-sm font-medium">선택 학기</div>
                <div className="text-2xl font-bold">{semester}</div>
              </div>

              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="h-14 rounded-2xl border border-slate-200 px-4 text-base outline-none focus:border-blue-500"
              >
                {subjectOptions.map((subject) => (
                  <option key={subject} value={subject}>
                    {subject}
                  </option>
                ))}
              </select>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => handleDownloadReport("EXCEL")}
                  disabled={reportLoading !== null || chartLoading}
                  className="h-14 rounded-2xl bg-emerald-600 px-4 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reportLoading === "EXCEL" ? "Excel 생성 중" : "Excel"}
                </button>
                <button
                  type="button"
                  onClick={() => handleDownloadReport("PDF")}
                  disabled={reportLoading !== null || chartLoading}
                  className="h-14 rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {reportLoading === "PDF" ? "PDF 생성 중" : "PDF"}
                </button>
              </div>
            </div>
          </div>

          {reportError && (
            <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
              {reportError}
            </div>
          )}

          <div className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="rounded-2xl border border-slate-100 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-slate-950">성적 차트</h3>
                  <p className="mt-2 text-base text-slate-500">
                    {chartView === "radar"
                      ? "내 점수, 반 평균, 전체 평균을 다각형 차트로 비교합니다."
                      : "과목별 점수 차이를 막대 차트로 나란히 비교합니다."}
                  </p>
                </div>

                <div className="grid w-full grid-cols-2 rounded-2xl bg-stone-100 p-1 sm:w-auto">
                  <button
                    type="button"
                    onClick={() => setChartView("radar")}
                    className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${
                      chartView === "radar"
                        ? "bg-[#8a5529] text-white shadow-sm"
                        : "text-stone-600 hover:bg-white/70"
                    }`}
                  >
                    다각형
                  </button>
                  <button
                    type="button"
                    onClick={() => setChartView("bar")}
                    className={`h-10 rounded-xl px-4 text-sm font-semibold transition ${
                      chartView === "bar"
                        ? "bg-[#8a5529] text-white shadow-sm"
                        : "text-stone-600 hover:bg-white/70"
                    }`}
                  >
                    막대
                  </button>
                </div>
              </div>

              {chartLoading ? (
                <div className="mt-6 text-sm text-slate-500">차트 데이터를 불러오는 중...</div>
              ) : chartError ? (
                <div className="mt-6 text-sm text-red-500">{chartError}</div>
              ) : !filteredRows.length ? (
                <div className="mt-6 text-sm text-slate-400">표시할 성적 데이터가 없습니다.</div>
              ) : (
                <div className="mt-6 h-[420px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartView === "radar" ? (
                      <RadarChart data={filteredRows} outerRadius="70%">
                        <PolarGrid stroke="#ead8bf" />
                        <PolarAngleAxis
                          dataKey="subject"
                          tick={{ fill: "#3b2414", fontSize: 14, fontWeight: 700 }}
                        />
                        <PolarRadiusAxis
                          domain={[0, 100]}
                          tick={{ fill: "#8c715c", fontSize: 11 }}
                          axisLine={false}
                        />

                        <Radar
                          name="내 점수"
                          dataKey="myScore"
                          stroke="#3b2414"
                          fill="transparent"
                          fillOpacity={0}
                          strokeWidth={3}
                          legendType="circle"
                          dot={{ r: 4, fill: "#3b2414", strokeWidth: 0 }}
                        />

                        <Radar
                          name="반 평균"
                          dataKey="classAverage"
                          stroke="#a78bfa"
                          fill="transparent"
                          fillOpacity={0}
                          strokeDasharray="7 5"
                          strokeWidth={3}
                          legendType="rect"
                          dot={{ r: 4, fill: "#a78bfa", strokeWidth: 0 }}
                        />

                        <Radar
                          name="전체 평균"
                          dataKey="totalAverage"
                          stroke="#c99732"
                          fill="transparent"
                          fillOpacity={0}
                          strokeDasharray="4 4"
                          strokeWidth={3}
                          legendType="diamond"
                          dot={{ r: 4, fill: "#c99732", strokeWidth: 0 }}
                        />

                        <Legend
                          iconSize={10}
                          wrapperStyle={{ fontSize: "13px", paddingTop: "12px" }}
                        />
                        <Tooltip />
                      </RadarChart>
                    ) : (
                      <BarChart data={filteredRows} margin={{ top: 16, right: 16, bottom: 8, left: 0 }}>
                        <CartesianGrid stroke="#eadfce" strokeDasharray="3 3" vertical={false} />
                        <XAxis
                          dataKey="subject"
                          tick={{ fill: "#6f5d4a", fontSize: 12, fontWeight: 700 }}
                          axisLine={{ stroke: "#d8c7ae" }}
                          tickLine={false}
                        />
                        <YAxis
                          domain={[0, 100]}
                          tick={{ fill: "#8b7a68", fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip
                          cursor={{ fill: "rgba(138, 85, 41, 0.08)" }}
                          contentStyle={{
                            border: "1px solid #eadfce",
                            borderRadius: "14px",
                            boxShadow: "0 14px 34px rgba(81, 50, 25, 0.12)",
                          }}
                        />
                        <Legend wrapperStyle={{ fontSize: "14px", paddingTop: "12px" }} />
                        <Bar
                          name="내 점수"
                          dataKey="myScore"
                          fill="#1d4ed8"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={36}
                        />
                        <Bar
                          name="반 평균"
                          dataKey="classAverage"
                          fill="#7c3aed"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={36}
                        />
                        <Bar
                          name="전체 평균"
                          dataKey="totalAverage"
                          fill="#f97316"
                          radius={[8, 8, 0, 0]}
                          maxBarSize={36}
                        />
                      </BarChart>
                    )}
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-slate-100 p-5">
              <h3 className="text-2xl font-bold tracking-tight text-slate-950">성적 입력</h3>
              <p className="mt-2 text-base text-slate-500">
                선택한 학생과 학기에 대한 점수를 등록합니다.
              </p>

              <div className="mt-6 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">학생 ID</label>
                  <input
                    value={selectedStudent.id}
                    disabled
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">학기</label>
                  <input
                    value={semester}
                    disabled
                    className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm text-slate-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-600">점수</label>
                  <input
                    type="number"
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                    placeholder="점수를 입력하세요"
                    className="h-12 w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  onClick={handleCreateGrade}
                  className="h-12 w-full rounded-xl bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  성적 등록
                </button>

                {saveMessage && (
                  <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                    {saveMessage}
                  </div>
                )}

                {saveError && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                    {saveError}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-slate-100 p-5">
            <h3 className="text-2xl font-bold tracking-tight text-slate-950">과목별 비교표</h3>
            <p className="mt-2 text-base text-slate-500">
              선택한 과목 또는 전체 과목의 점수를 표로 확인합니다.
            </p>

            {!filteredRows.length ? (
              <div className="mt-6 text-sm text-slate-400">표시할 데이터가 없습니다.</div>
            ) : (
              <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
                <table className="min-w-full">
                  <thead className="bg-slate-50">
                    <tr className="text-left text-base font-semibold text-slate-600">
                      <th className="px-5 py-4">과목</th>
                      <th className="px-5 py-4">내 점수</th>
                      <th className="px-5 py-4">등급</th>
                      <th className="px-5 py-4">반 평균</th>
                      <th className="px-5 py-4">전체 평균</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((row) => (
                      <tr key={row.gradeId} className="border-t border-slate-100 text-base">
                        <td className="px-5 py-4 font-medium text-slate-900">{row.subject}</td>
                        <td className="px-5 py-4 text-slate-700">{formatScore(row.myScore)}</td>
                        <td className="px-5 py-4 font-semibold text-slate-700">{row.letterGrade}</td>
                        <td className="px-5 py-4 text-slate-700">{formatScore(row.classAverage)}</td>
                        <td className="px-5 py-4 text-slate-700">{formatScore(row.totalAverage)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
