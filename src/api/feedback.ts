import { api } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export type FeedbackCategory =
  | "GRADE"
  | "BEHAVIOR"
  | "ATTENDANCE"
  | "ATTITUDE";

export interface FeedbackItem {
  id: number;
  category: FeedbackCategory;
  content: string;
  createdAt: string;
  studentName: string;
  teacherName: string;
  visibleToParent: boolean;
}

export interface CreateFeedbackRequest {
  studentId: number;
  category: FeedbackCategory;
  content: string;
  visibleToParent: boolean;
}

export interface UpdateFeedbackRequest {
  category: FeedbackCategory;
  content: string;
  visibleToParent: boolean;
}

export async function createFeedback(
  payload: CreateFeedbackRequest
): Promise<string> {
  const response = await api.post<ApiResponse<string>>(
    "/api/v1/feedbacks",
    payload
  );

  return response.data.data;
}

export async function updateFeedback(
  feedbackId: number,
  payload: UpdateFeedbackRequest
): Promise<string> {
  const response = await api.patch<ApiResponse<string>>(
    `/api/v1/feedbacks/${feedbackId}`,
    payload
  );

  return response.data.data;
}

export async function getStudentFeedbacks(
  studentId: number
): Promise<FeedbackItem[]> {
  const response = await api.get<ApiResponse<FeedbackItem[]>>(
    `/api/v1/feedbacks/student/${studentId}/all`
  );

  return response.data.data;
}