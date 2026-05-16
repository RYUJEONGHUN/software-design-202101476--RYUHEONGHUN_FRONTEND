import { api } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export type AttendanceStatus = "PRESENT" | "TARDY" | "ABSENT" | "EXCUSED";

export interface UnmarkedStudentItem {
  id: number; // studentId
  classNum: number;
  grade: number;
  name: string;
  number: number;
  studentNumber: string;
}

export interface CreateAttendanceRequest {
  studentId: number;
  status: AttendanceStatus;
  note?: string;
  date?: string;
}

export interface AttendanceReportRecord {
  attendanceId: number;
  date: string;
  note: string | null;
  status: AttendanceStatus;
}

export interface AttendanceReportResponse {
  presentCount: number;
  tardyCount: number;
  absentCount: number;
  excusedCount: number;
  attendanceRate: number;
  records: AttendanceReportRecord[];
}

export interface UpdateAttendanceRequest {
  status: AttendanceStatus;
  note?: string;
}

export async function getUnmarkedStudents(date: string): Promise<UnmarkedStudentItem[]> {
  const response = await api.get<ApiResponse<UnmarkedStudentItem[]>>(
    "/api/v1/attendances/unmarked",
    {
      params: { date },
    }
  );

  return response.data.data;
}

export async function createSingleAttendance(
  payload: CreateAttendanceRequest
): Promise<number> {
  const response = await api.post<ApiResponse<number>>(
    "/api/v1/attendances/single",
    payload
  );

  return response.data.data;
}

export async function createBulkAttendance(
  payload: CreateAttendanceRequest[]
): Promise<number[]> {
  const response = await api.post<ApiResponse<number[]>>(
    "/api/v1/attendances/bulk",
    payload
  );

  return response.data.data;
}

export async function getAttendanceRate(studentId: number): Promise<number> {
  const response = await api.get<ApiResponse<number>>(
    `/api/v1/attendances/rate/${studentId}`
  );

  return response.data.data;
}

export async function getAttendanceReport(
  studentId: number,
  year: number,
  month: number
): Promise<AttendanceReportResponse> {
  const response = await api.get<ApiResponse<AttendanceReportResponse>>(
    `/api/v1/attendances/report/${studentId}`,
    {
      params: { year, month },
    }
  );

  return response.data.data;
}

export async function updateAttendance(
  attendanceId: number,
  payload: UpdateAttendanceRequest
): Promise<string> {
  const response = await api.patch<ApiResponse<string>>(
    `/api/v1/attendances/update/${attendanceId}`,
    payload
  );

  return response.data.data;
}