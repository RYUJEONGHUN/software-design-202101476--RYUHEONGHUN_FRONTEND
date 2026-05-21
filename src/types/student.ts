export interface StudentSummary {
  id: number;
  name: string;
  gradeLevel: number;
  classNum: number;
  studentNumber: string;
  attendanceRate: number;
}

export interface StudentSearchItem {
  id: number;
  name: string;
  studentNumber: string;
  grade: number;
  classNum: number;
  absenceCount: number;
  attendanceCount: number;
  averageScore: number;
  lastConsultationContent: string;
}

export interface StudentSearchPage {
  content: StudentSearchItem[];
  empty: boolean;
  first: boolean;
  last: boolean;
  number: number;
  numberOfElements: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface RecentConsultation {
  id: number;
  teacherName: string;
  content: string;
  consultationDate: string;
}

export interface RecentFeedback {
  id: number;
  teacherName: string;
  content: string;
  createdAt: string;
}

export interface SubjectScore {
  gradeId: number;
  subjectName: string;
  score: number;
  letterGrade?: string;
  semester: string;
  classAverage?: number;
  totalAverage?: number;
}

export interface StudentDetailResponse {
  attendanceRate: number;
  classNum: number;
  grade: number;
  id: number;
  name: string;
  recentConsultations: RecentConsultation[];
  recentFeedbacks: RecentFeedback[];
  studentNumber: string;
  subjectScores: SubjectScore[];
}

export interface StudentRecord {
  id: number;
  studentId: number;
  schoolYear: number;
  semester: string;
  specialNote: string;
  behaviorNote: string;
  careerHope: string;
  healthNote: string;
}

export interface SaveStudentRecordRequest {
  schoolYear: number;
  semester: string;
  specialNote: string;
  behaviorNote: string;
  careerHope: string;
  healthNote: string;
}
