import { api } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface TeacherDashboardResponse {
  name: string;
  role: string;
  scheduledConsultationCount: number;
  subjectName: string;
  teacherIdNum: string;
}

export interface ScheduledConsultationItem {
  studentName: string;
  nextPlanDate: string;
}

export async function getTeacherDashboard(): Promise<TeacherDashboardResponse> {
  const response = await api.get<ApiResponse<TeacherDashboardResponse>>(
    "/api/v1/teacher/me/dashboard"
  );

  return response.data.data;
}

export async function getScheduledConsultations(): Promise<ScheduledConsultationItem[]> {
  const response = await api.get<ApiResponse<ScheduledConsultationItem[]>>(
    "/api/v1/teacher/me/consultations/scheduled"
  );

  return response.data.data;
}