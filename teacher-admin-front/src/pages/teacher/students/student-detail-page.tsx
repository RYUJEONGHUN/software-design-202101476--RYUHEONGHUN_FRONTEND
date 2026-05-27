import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getStudentDetail } from "@/api/student";
import StudentDetailGradeSection from "@/components/students/student-detail-grade-section";
import StudentRecordSection from "@/components/students/student-record-section";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StudentDetailResponse } from "@/types/student";
import { BookOpen, ClipboardList, MessageSquareText, UserRoundCheck } from "lucide-react";

function formatDate(value: string) {
  if (!value) return "-";
  return value.length >= 10 ? value.slice(0, 10) : value;
}

function formatDateTime(value: string) {
  if (!value) return "-";
  return value.replace("T", " ").slice(0, 16);
}

export default function StudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudentDetail = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError("");

      const data = await getStudentDetail(id);
      setStudent(data);
    } catch (err) {
      console.error(err);
      setError("학생 정보를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 animate-pulse rounded-[32px] bg-white shadow-sm" />
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="h-80 animate-pulse rounded-[32px] bg-white shadow-sm" />
          <div className="h-80 animate-pulse rounded-[32px] bg-white shadow-sm" />
        </div>
        <div className="h-72 animate-pulse rounded-[32px] bg-white shadow-sm" />
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
          학생 상세
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          학생 기본 정보와 학생부, 최근 상담/피드백, 성적 요약을 확인합니다.
        </p>
      </div>

      <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-2xl font-extrabold text-blue-600">
              {student.name.charAt(0)}
            </div>

            <div>
              <h2 className="text-4xl font-bold tracking-tight text-slate-900">
                {student.name}
              </h2>
              <div className="mt-3 flex flex-wrap gap-2 text-sm font-semibold text-slate-600">
                <span className="rounded-full bg-slate-50 px-3 py-1">
                  {student.grade}학년 {student.classNum}반
                </span>
                <span className="rounded-full bg-slate-50 px-3 py-1">
                  학번 {student.studentNumber}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-2xl bg-blue-50 px-6 py-4 text-center">
            <p className="text-sm font-semibold text-blue-600">출석률</p>
            <p className="mt-1 text-3xl font-bold text-blue-700">
              {student.attendanceRate}%
            </p>
          </div>
        </div>
      </section>

      <Tabs defaultValue="grades" className="space-y-5">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-2 rounded-none bg-transparent p-0">
          <TabsTrigger className="h-10 flex-none rounded-xl border border-slate-200 bg-white px-5 shadow-sm data-active:border-blue-200 data-active:bg-blue-50 data-active:text-blue-700" value="grades">
            <BookOpen className="h-4 w-4" />
            성적
          </TabsTrigger>
          <TabsTrigger className="h-10 flex-none rounded-xl border border-slate-200 bg-white px-5 shadow-sm data-active:border-blue-200 data-active:bg-blue-50 data-active:text-blue-700" value="record">
            <ClipboardList className="h-4 w-4" />
            학생부
          </TabsTrigger>
          <TabsTrigger className="h-10 flex-none rounded-xl border border-slate-200 bg-white px-5 shadow-sm data-active:border-blue-200 data-active:bg-blue-50 data-active:text-blue-700" value="feedback">
            <MessageSquareText className="h-4 w-4" />
            피드백
          </TabsTrigger>
          <TabsTrigger className="h-10 flex-none rounded-xl border border-slate-200 bg-white px-5 shadow-sm data-active:border-blue-200 data-active:bg-blue-50 data-active:text-blue-700" value="consultations">
            <UserRoundCheck className="h-4 w-4" />
            상담
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grades">
          <StudentDetailGradeSection
            student={student}
            onRefresh={fetchStudentDetail}
          />
        </TabsContent>

        <TabsContent value="record">
          <StudentRecordSection studentId={student.id} />
        </TabsContent>

        <TabsContent value="feedback">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                최근 피드백
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                학생에게 등록된 최근 피드백을 확인합니다.
              </p>
            </div>

            <div className="space-y-3">
              {student.recentFeedbacks.length > 0 ? (
                student.recentFeedbacks.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="rounded-full bg-blue-50 px-3 py-1 text-sm font-bold text-blue-700">
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
                <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-5 py-12 text-center text-slate-400">
                  피드백이 없습니다.
                </div>
              )}
            </div>
          </section>
        </TabsContent>

        <TabsContent value="consultations">
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h3 className="text-2xl font-bold tracking-tight text-slate-900">
                최근 상담
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                최근 상담 이력과 내용을 확인합니다.
              </p>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <table className="w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr className="text-left text-sm font-semibold text-slate-500">
                    <th className="px-5 py-4">상담일</th>
                    <th className="px-5 py-4">교사</th>
                    <th className="px-5 py-4">내용</th>
                  </tr>
                </thead>

                <tbody>
                  {student.recentConsultations.length > 0 ? (
                    student.recentConsultations.map((item) => (
                      <tr
                        key={item.id}
                        className="border-t border-slate-100 text-sm text-slate-700"
                      >
                        <td className="px-5 py-4">
                          {formatDate(item.consultationDate)}
                        </td>
                        <td className="px-5 py-4 font-semibold text-slate-900">
                          {item.teacherName}
                        </td>
                        <td className="px-5 py-4">{item.content}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={3}
                        className="px-5 py-10 text-center text-sm text-slate-400"
                      >
                        상담 내역이 없습니다.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </TabsContent>
      </Tabs>
    </div>
  );
}
