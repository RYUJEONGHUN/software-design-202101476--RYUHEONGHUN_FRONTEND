import { api } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface CreateConsultationRequest {
  studentId: number;
  consultationDate: string;
  content: string;
  nextPlanDate?: string | null;
}

export interface ConsultationSearchCondition {
  studentName?: string;
  teacherName?: string;
  startDate?: string;
  endDate?: string;
  keyword?: string;
}

export interface ConsultationItem {
  id: number;
  consultationDate: string;
  content: string;
  createdAt: string;
  nextPlanDate: string | null;
  studentName: string;
  studentNumber: string;
  teacherName: string;
}

export async function createConsultation(
  payload: CreateConsultationRequest
): Promise<string> {
  const response = await api.post<ApiResponse<string>>(
    "/api/v1/consultations",
    payload
  );

  return response.data.data;
}

export async function searchConsultations(
  condition: ConsultationSearchCondition
): Promise<ConsultationItem[]> {
  const response = await api.get<ApiResponse<ConsultationItem[]>>(
    "/api/v1/consultations/search",
    {
      params: condition,
    }
  );

  return response.data.data;
}