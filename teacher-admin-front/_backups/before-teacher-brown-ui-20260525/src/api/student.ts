import { api } from "./axios";
import type {
  StudentSearchItem,
  StudentSearchPage,
  RecentConsultation,
  RecentFeedback,
  SubjectScore,
  StudentDetailResponse,
  StudentRecord,
  SaveStudentRecordRequest,
} from "@/types/student";

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

export async function getStudentRecords(
  studentId: string | number
): Promise<StudentRecord[]> {
  const response = await api.get<ApiResponse<StudentRecord[]>>(
    `/api/v1/students/${studentId}/records`
  );

  return response.data.data;
}

export async function saveStudentRecord(
  studentId: string | number,
  request: SaveStudentRecordRequest
): Promise<StudentRecord> {
  const response = await api.patch<ApiResponse<StudentRecord>>(
    `/api/v1/students/${studentId}/records`,
    request
  );

  return response.data.data;
}

export type {
  StudentSearchItem,
  StudentSearchPage,
  RecentConsultation,
  RecentFeedback,
  SubjectScore,
  StudentDetailResponse,
  StudentRecord,
  SaveStudentRecordRequest,
};
