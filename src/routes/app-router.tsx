import { Navigate, Route, Routes } from "react-router-dom";

import LoginPage from "@/pages/auth/login-page";
import LoginSuccessPage from "@/pages/auth/login-success-page";

import RoleRoute from "@/routes/role-route";

import AdminLayout from "@/components/layout/admin-layout";
import AppLayout from "@/components/layout/app-layout";
import ParentLayout from "@/components/layout/parent-layout";
import StudentLayout from "@/components/layout/student-layout";

import DashboardPage from "@/pages/teacher/dashboard/dashboard-page";
import StudentsPage from "@/pages/teacher/students/students-page";
import StudentDetailPage from "@/pages/teacher/students/student-detail-page";
import GradesPage from "@/pages/teacher/grades/grades-page";
import AttendancesPage from "@/pages/teacher/attendances/attendances-page";
import FeedbacksPage from "@/pages/teacher/feedbacks/feedbacks-page";
import ConsultationsPage from "@/pages/teacher/consultations/consultations-page";

import StudentDashboardPage from "@/pages/student/dashboard/student-dashboard-page";

import AdminDashboardPage from "@/pages/admin/dashboard/admin-dashboard-page";
import ParentDashboardPage from "@/pages/parent/dashboard/parent-dashboard-page";
import StudentRecordsPage from "@/pages/student/records/student-records-page";
import StudentGradesPage from "@/pages/student/grades/student-grades-page";


export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/login-success" element={<LoginSuccessPage />} />

      <Route element={<RoleRoute allow={["ROLE_TEACHER"]} />}>
        <Route path="/teacher" element={<AppLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="students/:id" element={<StudentDetailPage />} />
          <Route path="grades" element={<GradesPage />} />
          <Route path="attendances" element={<AttendancesPage />} />
          <Route path="feedbacks" element={<FeedbacksPage />} />
          <Route path="consultations" element={<ConsultationsPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allow={["ROLE_STUDENT"]} />}>
        <Route path="/student" element={<StudentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="grades" element={<StudentGradesPage />} />
          <Route path="records" element={<StudentRecordsPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allow={["ROLE_ADMIN"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
        </Route>
      </Route>

      <Route element={<RoleRoute allow={["ROLE_PARENT"]} />}>
        <Route path="/parent" element={<ParentLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<ParentDashboardPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
