import { api } from "./axios";

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
  subjectName: string;
  score: number;
  semester: string;
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

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

interface SearchStudentsParams {
  name?: string;
  grade?: number;
  classNum?: number;
  page?: number;
  size?: number;
  sort?: string[];
}

export async function searchStudents({
  name,
  grade,
  classNum,
  page = 0,
  size = 10,
  sort = ["name,asc"],
}: SearchStudentsParams): Promise<StudentSearchPage> {
  const response = await api.get<ApiResponse<StudentSearchPage>>(
    "/api/v1/students/search",
    {
      params: {
        grade: grade || undefined,
        classNum: classNum || undefined,
        name: name || undefined,
        page,
        size,
        sort,
      },
    }
  );

  return response.data.data;
}

export async function getStudentDetail(
  id: string | number
): Promise<StudentDetailResponse> {
  const response = await api.get<ApiResponse<StudentDetailResponse>>(
    `/api/v1/students/${id}`
  );

  return response.data.data;
}

export async function getMyStudentDetail(): Promise<StudentDetailResponse> {
  const response = await api.get<ApiResponse<StudentDetailResponse>>(
    "/api/v1/students/me"
  );

  return response.data.data;
}