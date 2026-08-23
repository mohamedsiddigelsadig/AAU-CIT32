"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export function Modal({
  open,
  onClose,
  title,
  children,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  const { dark } = useTheme();
  const panelRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<Element | null>(null);

  useEffect(() => {
    if (!open) return;
    previouslyFocused.current = document.activeElement;
    const panel = panelRef.current;
    panel?.focus();

    const getFocusable = () => {
      if (!panel) return [];
      return Array.from(
        panel.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null);
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      if (previouslyFocused.current instanceof HTMLElement) {
        previouslyFocused.current.focus();
      }
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 100 }} role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm" onClick={onClose} />
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cx(
          "relative w-full rounded-2xl border shadow-2xl overflow-y-auto",
          wide ? "max-w-2xl" : "max-w-md",
          dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200"
        )}
        style={{ maxHeight: "88vh", outline: "none" }}
      >
        <div className={cx("sticky top-0 flex items-center justify-between px-5 py-4 border-b backdrop-blur", dark ? "bg-slate-900/95 border-slate-800" : "bg-white/95 border-slate-100")}>
          <h3 className={cx("font-bold text-lg font-display", dark ? "text-white" : "text-slate-900")}>{title}</h3>
          <button onClick={onClose} className={cx("p-1.5 rounded-lg", dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function ConfirmDialog({
  open,
  onCancel,
  onConfirm,
  text,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
  text?: string;
}) {
  const { dark } = useTheme();
  return (
    <Modal open={open} onClose={onCancel} title="تأكيد الحذف">
      <p className={cx("text-sm mb-5", dark ? "text-slate-300" : "text-slate-600")}>
        {text || "هل أنت متأكد من حذف هذا العنصر؟ لا يمكن التراجع عن هذا الإجراء."}
      </p>
      <div className="flex gap-3">
        <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-colors">
          حذف
        </button>
        <button
          onClick={onCancel}
          className={cx("flex-1 py-2.5 rounded-xl font-bold text-sm transition-colors", dark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700")}
        >
          إلغاء
        </button>
      </div>
    </Modal>
  );
}
