import { api } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface GradeChartResponse {
  studentName: string;
  semester: string;
  myScores: Record<string, number>;
  classAverages: Record<string, number>;
  totalAverages: Record<string, number>;
}

export interface CreateGradeRequest {
  studentId: number;
  score: number;
  semester: string;
}

export async function getGradeChart(
  studentId: number,
  semester: string
): Promise<GradeChartResponse> {
  const response = await api.get<ApiResponse<GradeChartResponse>>(
    "/api/v1/grades/chart",
    {
      params: {
        studentId,
        semester,
      },
    }
  );

  return response.data.data;
}

export async function createGrade(payload: CreateGradeRequest): Promise<string> {
  const response = await api.post<ApiResponse<string>>("/api/v1/grades", payload);
  return response.data.message;
}