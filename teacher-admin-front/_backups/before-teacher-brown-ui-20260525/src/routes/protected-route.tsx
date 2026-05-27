import { Navigate, Outlet } from "react-router-dom";
import { getAccessToken, isTokenExpired } from "@/lib/auth";

export default function ProtectedRoute() {
  const token = getAccessToken();

  if (!token || isTokenExpired(token)) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}