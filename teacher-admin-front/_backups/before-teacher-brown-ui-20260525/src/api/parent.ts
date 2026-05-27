import { api } from "./axios";
import type {
  FeedbackCategory,
  FeedbackItem,
  FeedbackSearchCondition,
} from "@/api/feedback";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface ParentChild {
  id: number;
  name: string;
  studentNumber: string;
  grade: number;
  classNum: number;
  number: number;
}

export async function getMyChildren(): Promise<ParentChild[]> {
  const response = await api.get<ApiResponse<ParentChild[]>>(
    "/api/v1/users/my-children"
  );

  return response.data.data;
}

export async function getChildFeedbacks(
  studentId: number,
  condition: FeedbackSearchCondition = {}
): Promise<FeedbackItem[]> {
  const response = await api.get<ApiResponse<FeedbackItem[]>>(
    `/api/v1/feedbacks/student/${studentId}`,
    {
      params: {
        category: (condition.category as FeedbackCategory | undefined) || undefined,
        startDate: condition.startDate || undefined,
        endDate: condition.endDate || undefined,
        keyword: condition.keyword?.trim() || undefined,
      },
    }
  );

  return response.data.data;
}
