export type ApiResponse<T> = {
  success: boolean;
  data: T;
  message: string;
};

export type TeacherDashboardResponse = {
  name: string;
  role: string;
  scheduledConsultationCount: number;
  subjectName: string;
  teacherIdNum: string;
};

export type ScheduledConsultationDto = {
  studentName: string;
  nextPlanDate: string;
};