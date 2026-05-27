import { Outlet, useOutletContext } from "react-router-dom";
import { useEffect, useState } from "react";
import StudentSidebar from "@/components/layout/student-sidebar";
import StudentHeader from "@/components/layout/student-header";
import { getMyStudentDetail, type StudentDetailResponse } from "@/api/student";

type StudentOutletContext = {
  student: StudentDetailResponse | null;
  loading: boolean;
  error: string;
};

export function useStudentContext() {
  return useOutletContext<StudentOutletContext>();
}

export default function StudentLayout() {
  const [student, setStudent] = useState<StudentDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyStudentDetail();
        setStudent(data);
      } catch (error) {
        console.error("학생 레이아웃 정보 조회 실패", error);
        setError("학생 정보를 불러오지 못했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, []);

  return (
    <div className="student-shell flex min-h-screen bg-[#f4fbf6] text-slate-900">
      <StudentSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <StudentHeader
          studentName={student?.name}
          grade={student?.grade}
          classNum={student?.classNum}
        />
        <main className="min-h-screen flex-1 p-5 md:p-7">
          <Outlet context={{ student, loading, error } satisfies StudentOutletContext} />
        </main>
      </div>
    </div>
  );
}
