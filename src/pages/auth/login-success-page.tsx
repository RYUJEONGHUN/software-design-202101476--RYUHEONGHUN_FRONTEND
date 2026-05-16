import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getRedirectPathByRole,
  getRoleFromToken,
  saveAccessToken,
} from "@/lib/auth";

type LoginSuccessStatus = "processing" | "error";

export default function LoginSuccessPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<LoginSuccessStatus>("processing");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const run = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const accessToken = params.get("accessToken");

        if (!accessToken) {
          setStatus("error");
          setErrorMessage("액세스 토큰이 없습니다.");
          return;
        }

        saveAccessToken(accessToken);

        const role = getRoleFromToken(accessToken);
        const redirectPath = getRedirectPathByRole(role);

        window.history.replaceState({}, document.title, "/login-success");
        navigate(redirectPath, { replace: true });
      } catch (error) {
        console.error(error);
        setStatus("error");
        setErrorMessage("로그인 처리 중 오류가 발생했습니다.");
      }
    };

    run();
  }, [navigate]);

  if (status === "processing") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
        <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 text-center shadow-sm">
          <h1 className="text-2xl font-bold text-slate-900">로그인 처리 중</h1>
          <p className="mt-3 text-sm text-slate-500">
            사용자 권한을 확인하고 있습니다.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-[32px] border border-red-100 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-red-600">로그인 실패</h1>
        <p className="mt-3 text-sm text-slate-500">{errorMessage}</p>
      </div>
    </div>
  );
}