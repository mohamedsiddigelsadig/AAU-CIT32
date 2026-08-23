"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, ShieldCheck, Loader2 } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { createClient } from "@/lib/supabase/client";
import { Field, useInputClass } from "@/components/ui/form";

export default function AdminLoginPage() {
  const { dark } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputCls = useInputClass();

  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    searchParams.get("error") === "not-authorized" ? "هذا الحساب غير مخوّل بالوصول إلى لوحة التحكم." : null
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password: pass });
    setLoading(false);
    if (authError) {
      setError("بيانات الدخول غير صحيحة.");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div dir="rtl" className={cx("min-h-screen flex items-center justify-center px-4", dark ? "bg-slate-950" : "bg-slate-50")}>
      <div className={cx("w-full max-w-sm rounded-2xl border p-6", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
        <div className="flex flex-col items-center mb-6">
          <div className={cx("w-12 h-12 rounded-xl flex items-center justify-center mb-3", dark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-700")}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className={cx("font-extrabold text-lg font-display", dark ? "text-white" : "text-slate-900")}>لوحة تحكم دفعة 32</h1>
        </div>

        {error && (
          <div className={cx("mb-4 px-3.5 py-2.5 rounded-lg text-sm font-semibold", dark ? "bg-red-950 text-red-200 border border-red-800" : "bg-red-50 text-red-700 border border-red-200")}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Field label="البريد الإلكتروني">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} autoComplete="email" />
          </Field>
          <Field label="كلمة المرور">
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={pass}
                onChange={(e) => setPass(e.target.value)}
                className={inputCls + " pl-10"}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPass((s) => !s)}
                className={cx("absolute left-3 top-1/2 -translate-y-1/2", dark ? "text-slate-400" : "text-slate-500")}
              >
                {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </Field>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm transition-colors flex items-center justify-center gap-2"
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            دخول
          </button>
        </form>
      </div>
    </div>
  );
}
