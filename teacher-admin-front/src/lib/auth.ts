export type AppRole =
  | "ROLE_TEACHER"
  | "ROLE_STUDENT"
  | "ROLE_ADMIN"
  | "ROLE_PARENT"
  | "ROLE_GUEST";

type JwtPayload = {
  sub?: string;
  role?: AppRole | string;
  exp?: number;
  iat?: number;
};

const ACCESS_TOKEN_KEY = "accessToken";

export function saveAccessToken(token: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function getAccessToken() {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function parseJwt(token: string): JwtPayload | null {
  try {
    const [, payloadBase64] = token.split(".");
    if (!payloadBase64) return null;

    const normalized = payloadBase64.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = decodeURIComponent(
      atob(normalized)
        .split("")
        .map((char) => `%${("00" + char.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );

    return JSON.parse(decoded) as JwtPayload;
  } catch (error) {
    console.error("JWT 파싱 실패", error);
    return null;
  }
}

export function getRoleFromToken(token: string): AppRole | null {
  const payload = parseJwt(token);
  if (!payload?.role) return null;

  switch (payload.role) {
    case "TEACHER":
      return "ROLE_TEACHER";
    case "STUDENT":
      return "ROLE_STUDENT";
    case "ADMIN":
      return "ROLE_ADMIN";
    case "PARENT":
      return "ROLE_PARENT";
    case "GUEST":
      return "ROLE_GUEST";
    default:
      return payload.role as AppRole;
  }
}

export function getEmailFromToken(token: string): string | null {
  const payload = parseJwt(token);
  return payload?.sub ?? null;
}

export function isTokenExpired(token: string): boolean {
  const payload = parseJwt(token);
  if (!payload?.exp) return true;
  return payload.exp * 1000 < Date.now();
}

export function getRedirectPathByRole(role: AppRole | null): string {
  switch (role) {
    case "ROLE_TEACHER":
      return "/teacher/dashboard";
    case "ROLE_STUDENT":
      return "/student/dashboard";
    case "ROLE_ADMIN":
      return "/admin/dashboard";
    case "ROLE_PARENT":
      return "/parent/dashboard";
    case "ROLE_GUEST":
    default:
      return "/login?status=guest";
  }
}
