import { api } from "./axios";
import type { FeedbackCategory } from "@/api/feedback";

export type ReportFormat = "EXCEL" | "PDF";

type FeedbackReportParams = {
  studentId: number;
  category?: FeedbackCategory | "";
  startDate?: string;
  endDate?: string;
  keyword?: string;
  format: ReportFormat;
};

type ConsultationReportParams = {
  studentId: number;
  startDate?: string;
  endDate?: string;
  keyword?: string;
  format: ReportFormat;
};

function getReportFileName(
  disposition: string | undefined,
  fallbackBaseName: string,
  format: ReportFormat
) {
  const fallbackExtension = format === "PDF" ? "pdf" : "xlsx";
  const fallback = `${fallbackBaseName}.${fallbackExtension}`;

  if (!disposition) return fallback;

  const encodedMatch = disposition.match(/filename\*=UTF-8''([^;]+)/i);
  if (encodedMatch?.[1]) {
    return decodeURIComponent(encodedMatch[1].replace(/"/g, ""));
  }

  const plainMatch = disposition.match(/filename="?([^"]+)"?/i);
  return plainMatch?.[1] ?? fallback;
}

async function downloadReport(
  url: string,
  params: Record<string, string | number | undefined>,
  fallbackBaseName: string,
  format: ReportFormat
) {
  const response = await api.get<Blob>(url, {
    params,
    responseType: "blob",
  });

  const fileName = getReportFileName(
    response.headers["content-disposition"],
    fallbackBaseName,
    format
  );
  const blob = new Blob([response.data], {
    type: response.headers["content-type"],
  });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
}

export async function downloadFeedbackReport({
  studentId,
  category,
  startDate,
  endDate,
  keyword,
  format,
}: FeedbackReportParams) {
  await downloadReport(
    "/api/v1/reports/feedbacks",
    {
      studentId,
      category: category || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      keyword: keyword?.trim() || undefined,
      format,
    },
    `feedback-report-${studentId}`,
    format
  );
}

export async function downloadConsultationReport({
  studentId,
  startDate,
  endDate,
  keyword,
  format,
}: ConsultationReportParams) {
  await downloadReport(
    "/api/v1/reports/consultations",
    {
      studentId,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
      keyword: keyword?.trim() || undefined,
      format,
    },
    `consultation-report-${studentId}`,
    format
  );
}
