export interface FeedbackItem {
  id: number;
  studentId: number;
  teacherId: number;
  category: string;
  content: string;
  isVisibleToParent: boolean;
}