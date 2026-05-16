export interface AttendanceItem {
  id: number;
  studentId: number;
  attendanceDate: string;
  status: string;
  note?: string;
}