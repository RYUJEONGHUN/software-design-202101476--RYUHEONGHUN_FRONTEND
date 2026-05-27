export interface NotificationItem {
  id: number;
  receiverId: number;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}