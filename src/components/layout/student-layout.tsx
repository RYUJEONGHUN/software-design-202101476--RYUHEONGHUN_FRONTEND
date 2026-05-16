import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import StudentSidebar from "@/components/layout/student-sidebar";
import StudentHeader from "@/components/layout/student-header";
import { getMyStudentDetail, type StudentDetailResponse } from "@/api/student";

export default function StudentLayout() {
  const [student, setStudent] = useState<StudentDetailResponse | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        const data = await getMyStudentDetail();
        setStudent(data);
      } catch (error) {
        console.error("학생 레이아웃 정보 조회 실패", error);
      }
    };

    fetchStudent();
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <StudentSidebar />

      <div className="flex min-h-screen flex-1 flex-col">
        <StudentHeader
          studentName={student?.name}
          grade={student?.grade}
          classNum={student?.classNum}
        />
        <main className="min-h-screen flex-1 bg-slate-50 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}