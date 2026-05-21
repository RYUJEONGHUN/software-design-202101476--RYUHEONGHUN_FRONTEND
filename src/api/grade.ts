import { api } from "./axios";

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

export interface GradeUpdateRequest {
  score: number;
}

export interface GradeScore {
  gradeId: number;
  subjectName: string;
  score: number;
  letterGrade: string;
  semester: string;
  classAverage: number;
  totalAverage: number;
}

export interface GradeChartResponse {
  studentName: string;
  semester: string;
  totalScore: number;
  averageScore: number;
  overallGrade: string;
  scores: GradeScore[];
}

export interface CreateGradeRequest {
  studentId: number;
  semester: string;
  score: number;
}

export type GradeReportFormat = "EXCEL" | "PDF";

function getReportFileName(
  disposition: string | undefined,
  studentId: number,
  semester: string,
  format: GradeReportFormat
) {
  const fallbackExtension = format === "PDF" ? "pdf" : "xlsx";
  const fallback = `grade-report-${studentId}-${semester}.${fallbackExtension}`;

  if (!disposition) return fallback;

  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1].replace(/"/g, ""));
  }

  const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1] ?? fallback;
}

export async function downloadGradeReport(
  studentId: number,
  semester: string,
  format: GradeReportFormat
): Promise<void> {
  const response = await api.get<Blob>("/api/v1/reports/grades", {
    params: {
      studentId,
      semester,
      format,
    },
    responseType: "blob",
  });

  const fileName = getReportFileName(
    response.headers["content-disposition"],
    studentId,
    semester,
    format
  );
  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

export async function getGradeChart(
  studentId: number,
  semester: string
): Promise<GradeChartResponse> {
  const response = await api.get<ApiResponse<GradeChartResponse>>(
    "/api/v1/grades/chart",
    {
      params: {
        studentId,
        semester,
      },
    }
  );

  return response.data.data;
}

export async function createGrade(
  request: CreateGradeRequest
): Promise<string> {
  const response = await api.post<ApiResponse<string>>(
    "/api/v1/grades",
    request
  );

  return response.data.message;
}

export async function updateGrade(
  gradeId: number,
  request: GradeUpdateRequest
): Promise<string> {
  const response = await api.patch<ApiResponse<string>>(
    `/api/v1/grades/${gradeId}`,
    request
  );

  return response.data.data;
}
