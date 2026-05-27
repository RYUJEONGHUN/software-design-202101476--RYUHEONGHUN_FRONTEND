import { api } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export type AdminRole = "STUDENT" | "TEACHER" | "PARENT" | "ADMIN";

export interface RegisterUserRequest {
  username: string;
  name: string;
  phoneNumber: string;
}

export interface RegisterStudentRequest {
  studentNumber: string;
  grade: number;
  classNum: number;
  number: number;
}

export interface RegisterParentRequest {
  studentIds: number[];
}

export async function registerAdminUser(
  request: RegisterUserRequest
): Promise<string> {
  const response = await api.post<ApiResponse<string>>(
    "/api/v1/admin/users/register-user",
    request
  );

  return response.data.data;
}

export async function updateAdminUserRole(
  userId: number,
  role: AdminRole
): Promise<string> {
  const response = await api.patch<ApiResponse<string>>(
    `/api/v1/admin/users/${userId}/role`,
    { role }
  );

  return response.data.data;
}

export async function registerAdminStudent(
  userId: number,
  request: RegisterStudentRequest
): Promise<string> {
  const response = await api.post<ApiResponse<string>>(
    `/api/v1/admin/users/${userId}/register-student`,
    request
  );

  return response.data.data;
}

export async function registerAdminTeacher(
  userId: number,
  subject: string
): Promise<string> {
  const response = await api.post<ApiResponse<string>>(
    `/api/v1/admin/users/${userId}/register-teacher`,
    null,
    {
      params: {
        subject,
      },
    }
  );

  return response.data.data;
}

export async function registerAdminParent(
  userId: number,
  request: RegisterParentRequest
): Promise<string> {
  const response = await api.post<ApiResponse<string>>(
    `/api/v1/admin/users/${userId}/register-parent`,
    request
  );

  return response.data.data;
}
