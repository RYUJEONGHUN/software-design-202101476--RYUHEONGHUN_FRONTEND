import { Navigate, Outlet } from "react-router-dom";
import {
  getAccessToken,
  getRoleFromToken,
  isTokenExpired,
  type AppRole,
} from "@/lib/auth";

type RoleRouteProps = {
  allow: AppRole[];
};

export default function RoleRoute({ allow }: RoleRouteProps) {
  const token = getAccessToken();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  const role = getRoleFromToken(token);

  if (!role || !allow.includes(role)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}