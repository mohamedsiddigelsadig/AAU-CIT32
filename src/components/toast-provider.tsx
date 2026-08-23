"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { AlertCircle, Check } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

type Tone = "success" | "error";
interface Toast {
  id: string;
  message: string;
  tone: Tone;
}
interface ToastCtx {
  notify: (message: string, tone?: Tone) => void;
}

const ToastContext = createContext<ToastCtx>({ notify: () => {} });
export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: Tone = "success") => {
    const id = crypto.randomUUID();
    setToasts((t) => [...t, { id, message, tone }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <ToastStack toasts={toasts} />
    </ToastContext.Provider>
  );
}

function ToastStack({ toasts }: { toasts: Toast[] }) {
  const { dark } = useTheme();
  if (!toasts.length) return null;
  return (
    <div
      className="fixed bottom-5 inset-x-0 flex flex-col items-center gap-2 px-4 pointer-events-none"
      style={{ zIndex: 200 }}
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={cx(
            "pointer-events-auto flex items-center gap-2 px-4 py-2.5 rounded-xl shadow-lg text-sm font-semibold border max-w-sm",
            t.tone === "error"
              ? dark
                ? "bg-red-950 border-red-800 text-red-200"
                : "bg-red-50 border-red-200 text-red-700"
              : dark
                ? "bg-slate-900 border-slate-700 text-white"
                : "bg-white border-slate-200 text-slate-900"
          )}
        >
          {t.tone === "error" ? (
            <AlertCircle className="w-4 h-4 shrink-0" />
          ) : (
            <Check className="w-4 h-4 shrink-0 text-emerald-500" />
          )}
          {t.message}
        </div>
      ))}
    </div>
  );
}
