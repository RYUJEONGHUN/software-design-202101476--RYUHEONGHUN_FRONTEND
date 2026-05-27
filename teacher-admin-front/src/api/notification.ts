import { api } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export type NotificationType =
  | "ATTENDANCE_UPDATED"
  | "GRADE_UPDATED"
  | "FEEDBACK_CREATED"
  | "CONSULTATION_UPDATED";

export interface NotificationItem {
  id: number;
  message: string;
  type: NotificationType | string;
  createdAt: string;
  isRead: boolean;
}

export async function getUnreadNotifications(): Promise<NotificationItem[]> {
  const response = await api.get<ApiResponse<NotificationItem[]>>(
    "/api/v1/notifications/unread"
  );

  return response.data.data;
}

export async function markNotificationAsRead(notificationId: number): Promise<string> {
  const response = await api.patch<ApiResponse<string>>(
    `/api/v1/notifications/${notificationId}/read`
  );

  return response.data.data;
}