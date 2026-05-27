import { clearAccessToken } from "@/lib/auth";

export function logout() {
  clearAccessToken();
  window.location.href = "/login";
}