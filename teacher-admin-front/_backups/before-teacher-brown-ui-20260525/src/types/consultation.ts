export interface ConsultationItem {
  id: number;
  studentId: number;
  teacherId: number;
  consultationDate: string;
  content: string;
  nextPlan: string;
  isShared: boolean;
}