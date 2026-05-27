const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function getAccessToken() {
  return localStorage.getItem("accessToken");
}

export async function apiGet<T>(url: string): Promise<T> {
  const token = getAccessToken();

  const response = await fetch(`${API_BASE_URL}${url}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API 요청 실패: ${response.status}`);
  }

  const result = await response.json();
  return result;
}