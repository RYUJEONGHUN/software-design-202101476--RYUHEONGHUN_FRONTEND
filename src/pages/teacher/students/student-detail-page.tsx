import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentDetail, type StudentDetailResponse } from "@/api/student";

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      if (!id) return;

      try {
        setLoading(true);
        setError("");
        const data = await getStudentDetail(id);
        setStudent(data);
      } catch (err) {
        console.error(err);
        setError("학생부 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) {
    return <div className="text-sm text-slate-500">학생부 정보를 불러오는 중...</div>;
  }

  if (error) {
    return <div className="text-sm text-red-500">{error}</div>;
  }

  if (!student) {
    return <div className="text-sm text-slate-500">학생 정보가 없습니다.</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-950">학생부 조회</h1>
        <p className="mt-2 text-base text-slate-500">
          학생 기본 정보와 최근 상담/피드백, 성적 요약을 확인합니다.
        </p>
      </div>

      <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm md:p-7">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-4xl font-extrabold tracking-tight text-slate-950">
              {student.name}
            </h2>
            <p className="mt-3 text-lg text-slate-500">
              {student.grade}학년 {student.classNum}반 · 학번 {student.studentNumber}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 px-5 py-3 text-blue-700">
            <div className="text-sm font-medium">출석률</div>
            <div className="text-2xl font-bold">{student.attendanceRate}%</div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold tracking-tight text-slate-950">과목별 점수</h3>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-base font-semibold text-slate-600">
                  <th className="px-5 py-4">과목명</th>
                  <th className="px-5 py-4">학기</th>
                  <th className="px-5 py-4">점수</th>
                </tr>
              </thead>
              <tbody>
                {student.subjectScores.map((subject, index) => (
                  <tr
                    key={`${subject.subjectName}-${subject.semester}-${index}`}
                    className="border-t border-slate-100 text-base"
                  >
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {subject.subjectName}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {subject.semester}
                    </td>
                    <td className="px-5 py-4 text-slate-700">
                      {subject.score}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-2xl font-bold tracking-tight text-slate-950">최근 피드백</h3>
          <div className="mt-6 space-y-4">
            {student.recentFeedbacks.length === 0 ? (
              <div className="rounded-2xl bg-slate-50 px-5 py-4 text-sm text-slate-500">
                최근 피드백이 없습니다.
              </div>
            ) : (
              student.recentFeedbacks.map((feedback) => (
                <div key={feedback.id} className="rounded-2xl bg-slate-50 px-5 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="font-semibold text-slate-900">{feedback.teacherName}</div>
                    <div className="text-sm text-slate-400">{feedback.createdAt}</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700">{feedback.content}</p>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm xl:col-span-2">
          <h3 className="text-2xl font-bold tracking-tight text-slate-950">최근 상담</h3>
          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-100">
            <table className="min-w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-base font-semibold text-slate-600">
                  <th className="px-5 py-4">상담일</th>
                  <th className="px-5 py-4">교사</th>
                  <th className="px-5 py-4">내용</th>
                </tr>
              </thead>
              <tbody>
                {student.recentConsultations.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-5 py-8 text-center text-sm text-slate-500">
                      최근 상담 내역이 없습니다.
                    </td>
                  </tr>
                ) : (
                  student.recentConsultations.map((consultation) => (
                    <tr key={consultation.id} className="border-t border-slate-100 text-base">
                      <td className="px-5 py-4 text-slate-700">
                        {consultation.consultationDate}
                      </td>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {consultation.teacherName}
                      </td>
                      <td className="px-5 py-4 text-slate-700">{consultation.content}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}