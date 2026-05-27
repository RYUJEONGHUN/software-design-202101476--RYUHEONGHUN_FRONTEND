const BACKEND_BASE_URL = "http://localhost:8080";

export default function LoginPage() {
  const handleGoogleLogin = () => {
    window.location.href = `${BACKEND_BASE_URL}/oauth2/authorization/google`;
  };

  const status = new URLSearchParams(window.location.search).get("status");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-[32px] border border-slate-200 bg-white p-8 shadow-sm">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            ClassHub
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            구글 계정으로 로그인해 주세요.
          </p>
        </div>

        {status === "guest" && (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            아직 권한이 부여되지 않은 계정입니다. 관리자에게 문의해 주세요.
          </div>
        )}

        <button
          onClick={handleGoogleLogin}
          className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <span>G</span>
          <span>Google로 로그인</span>
        </button>

        <p className="mt-4 text-center text-xs text-slate-400">
          로그인 후 권한에 따라 페이지로 이동합니다.
        </p>
      </div>
    </div>
  );
}