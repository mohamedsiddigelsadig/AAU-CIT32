"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, ShieldCheck, UserCog2, RotateCcw, Copy, Check, KeyRound } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/toast-provider";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, useInputClass } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { PERMISSIONS, roleLabel } from "@/lib/permissions";
import { createTeamMember, updateTeamMember, revokeTeamAccess, resetTeamMemberPassword } from "./actions";
import type { Profile, ProfileRole } from "@/types/database";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  return Array.from({ length: 10 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function TeamAdminList({ initialProfiles }: { initialProfiles: Profile[] }) {
  const { dark } = useTheme();
  const router = useRouter();
  const { notify } = useToast();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: Profile } | null>(null);
  const [resetModal, setResetModal] = useState<Profile | null>(null);
  const [confirmRevoke, setConfirmRevoke] = useState<string | null>(null);

  async function handleRevoke() {
    if (!confirmRevoke) return;
    try {
      await revokeTeamAccess(confirmRevoke);
      notify("تم إلغاء صلاحيات هذا العضو");
      router.refresh();
    } catch {
      notify("تعذّر تنفيذ الإجراء", "error");
    }
    setConfirmRevoke(null);
  }

  return (
    <div>
      <button
        onClick={() => setModal({ mode: "add" })}
        className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
      >
        <Plus className="w-4 h-4" /> إضافة عضو للفريق
      </button>

      <div className="flex flex-col gap-2.5">
        {initialProfiles.map((p) => (
          <div key={p.id} className={cx("flex items-center gap-3 p-3.5 rounded-xl border", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className={cx("w-9 h-9 rounded-full flex items-center justify-center shrink-0", p.role === "super_admin" ? "bg-amber-600" : "bg-blue-700")}>
              {p.role === "super_admin" ? <ShieldCheck className="w-4 h-4 text-white" /> : <UserCog2 className="w-4 h-4 text-white" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className={cx("font-bold text-sm truncate", dark ? "text-white" : "text-slate-900")}>{p.full_name || "بدون اسم"}</div>
              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                <Badge tone={p.role === "super_admin" ? "amber" : "blue"}>{roleLabel(p.role)}</Badge>
                {p.role === "committee_head" &&
                  p.permissions.map((perm) => (
                    <Badge key={perm} tone="slate">
                      {PERMISSIONS.find((x) => x.key === perm)?.label ?? perm}
                    </Badge>
                  ))}
              </div>
            </div>
            <button onClick={() => setResetModal(p)} className={cx("p-2 rounded-lg", dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")} aria-label="إعادة تعيين كلمة المرور">
              <KeyRound className="w-4 h-4" />
            </button>
            <button onClick={() => setModal({ mode: "edit", item: p })} className={cx("px-3 py-1.5 rounded-lg text-xs font-bold", dark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700")}>
              تعديل
            </button>
            <button onClick={() => setConfirmRevoke(p.id)} className={cx("p-2 rounded-lg", dark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-500")} aria-label="إلغاء الصلاحية">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "تعديل الصلاحيات" : "إضافة عضو للفريق"}>
        {modal && (
          <TeamForm
            initial={modal.item}
            onDone={() => {
              setModal(null);
              router.refresh();
            }}
          />
        )}
      </Modal>

      <Modal open={!!resetModal} onClose={() => setResetModal(null)} title={resetModal ? `إعادة تعيين كلمة مرور: ${resetModal.full_name || "بدون اسم"}` : ""}>
        {resetModal && (
          <ResetPasswordForm
            profile={resetModal}
            onDone={() => setResetModal(null)}
          />
        )}
      </Modal>

      <ConfirmDialog open={!!confirmRevoke} onCancel={() => setConfirmRevoke(null)} onConfirm={handleRevoke} text="سيفقد هذا العضو الوصول للوحة التحكم فورًا. يمكن إعادة تفعيله لاحقًا بنفس الطريقة." />
    </div>
  );
}

function ResetPasswordForm({ profile, onDone }: { profile: Profile; onDone: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [password, setPassword] = useState(() => generatePassword());
  const [copied, setCopied] = useState(false);
  const [saving, setSaving] = useState(false);

  async function copyPassword() {
    await navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleReset() {
    if (!password.trim()) return;
    setSaving(true);
    try {
      await resetTeamMemberPassword(profile.id, password);
      notify("تم تعيين كلمة مرور جديدة — انسخها وشاركها مع العضو");
      onDone();
    } catch {
      notify("تعذّر تنفيذ الإجراء", "error");
    }
    setSaving(false);
  }

  return (
    <div>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        سيتم استبدال كلمة المرور الحالية فورًا. تأكد من مشاركة الكلمة الجديدة مع العضو قبل الإغلاق.
      </p>
      <Field label="كلمة المرور الجديدة">
        <div className="flex gap-2">
          <input value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} style={{ fontFamily: "monospace" }} />
          <button type="button" onClick={() => setPassword(generatePassword())} className="shrink-0 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
            توليد
          </button>
        </div>
      </Field>
      <button
        type="button"
        onClick={copyPassword}
        className="w-full mb-4 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
      >
        {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} نسخ كلمة المرور
      </button>
      <div className="flex gap-3">
        <button
          onClick={handleReset}
          disabled={!password.trim() || saving}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          تأكيد التغيير
        </button>
        <button onClick={onDone} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
          إلغاء
        </button>
      </div>
    </div>
  );
}

function TeamForm({ initial, onDone }: { initial?: Profile; onDone: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [fullName, setFullName] = useState(initial?.full_name ?? "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(() => generatePassword());
  const [copied, setCopied] = useState(false);
  const [role, setRole] = useState<ProfileRole>(initial?.role ?? "committee_head");
  const [permissions, setPermissions] = useState<string[]>(initial?.permissions ?? []);
  const [saving, setSaving] = useState(false);

  const togglePerm = (key: string) => setPermissions((p) => (p.includes(key) ? p.filter((x) => x !== key) : [...p, key]));

  async function copyCreds() {
    await navigator.clipboard.writeText(`البريد: ${email}\nكلمة المرور: ${password}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  async function handleSave() {
    if (!initial && (!fullName.trim() || !email.trim() || !password.trim())) return;
    setSaving(true);
    try {
      if (initial) {
        await updateTeamMember(initial.id, { role, permissions });
        notify("تم تحديث الصلاحيات");
      } else {
        await createTeamMember({ fullName, email, password, role, permissions });
        notify("تم إنشاء الحساب — انسخ بيانات الدخول وشاركها مع العضو");
      }
      onDone();
    } catch (e) {
      notify(e instanceof Error ? e.message : "تعذّر الحفظ", "error");
    }
    setSaving(false);
  }

  return (
    <div>
      {!initial && (
        <>
          <Field label="الاسم الكامل">
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className={inputCls} />
          </Field>
          <Field label="البريد الإلكتروني">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </Field>
          <Field label="كلمة المرور المبدئية">
            <div className="flex gap-2">
              <input value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} style={{ fontFamily: "monospace" }} />
              <button type="button" onClick={() => setPassword(generatePassword())} className="shrink-0 px-3 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                توليد
              </button>
            </div>
          </Field>
          {email && password && (
            <button
              type="button"
              onClick={copyCreds}
              className="w-full mb-4 flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />} نسخ بيانات الدخول لمشاركتها
            </button>
          )}
        </>
      )}

      <Field label="الدور">
        <select value={role} onChange={(e) => setRole(e.target.value as ProfileRole)} className={inputCls}>
          <option value="super_admin">صلاحية كاملة (الأمين العام / رئيس الدفعة)</option>
          <option value="committee_head">رئيس لجنة — صلاحية محددة</option>
        </select>
      </Field>

      {role === "committee_head" && (
        <div className="block mb-5">
          <span className="block text-sm font-semibold mb-2 text-slate-500">الأقسام المسموح بإدارتها</span>
          <div className="flex flex-col gap-2">
            {PERMISSIONS.map((perm) => (
              <label key={perm.key} className="flex items-center gap-2.5 text-sm cursor-pointer select-none">
                <input type="checkbox" checked={permissions.includes(perm.key)} onChange={() => togglePerm(perm.key)} className="w-4 h-4 rounded accent-blue-600" />
                <span className="text-slate-700 dark:text-slate-200">{perm.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          حفظ
        </button>
        <button onClick={onDone} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
          إلغاء
        </button>
      </div>
    </div>
  );
}
