import type { ReactNode } from "react";
import { X } from "lucide-react";

type ModalFormShellProps = {
  title: string;
  description?: string;
  children: ReactNode;
  onClose: () => void;
  maxWidthClassName?: string;
};

export default function ModalFormShell({
  title,
  description,
  children,
  onClose,
  maxWidthClassName = "max-w-lg",
}: ModalFormShellProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div
        className={`w-full ${maxWidthClassName} rounded-[22px] border border-slate-200 bg-white p-6 shadow-xl`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold tracking-tight text-slate-950">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition hover:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
