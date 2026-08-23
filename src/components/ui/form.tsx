"use client";

import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block mb-4">
      <span className="block text-sm font-semibold mb-1.5 text-slate-500">{label}</span>
      {children}
    </label>
  );
}

export function useInputClass() {
  const { dark } = useTheme();
  return cx(
    "w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none transition-colors",
    dark
      ? "bg-slate-950 border-slate-700 text-white placeholder:text-slate-600 focus:border-blue-500"
      : "bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-blue-500"
  );
}
