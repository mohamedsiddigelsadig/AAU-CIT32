"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useToast } from "@/components/toast-provider";
import { Field, useInputClass } from "@/components/ui/form";
import { updateSettings } from "./actions";
import type { SiteSettingsRow } from "@/types/database";

export function SettingsForm({ initial }: { initial: SiteSettingsRow }) {
  const inputCls = useInputClass();
  const router = useRouter();
  const { notify } = useToast();
  const [f, setF] = useState({
    students_count: initial.students_count,
    contact_email: initial.contact_email ?? "",
    contact_facebook: initial.contact_facebook ?? "",
    contact_instagram: initial.contact_instagram ?? "",
    contact_whatsapp: initial.contact_whatsapp ?? "",
    contact_telegram: initial.contact_telegram ?? "",
  });
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      await updateSettings(f);
      notify("تم حفظ الإعدادات");
      router.refresh();
    } catch {
      notify("تعذّر الحفظ", "error");
    }
    setSaving(false);
  }

  return (
    <div className="max-w-lg">
      <Field label="عدد الطلاب">
        <input type="number" value={f.students_count} onChange={(e) => setF((s) => ({ ...s, students_count: Number(e.target.value) }))} className={inputCls} />
      </Field>
      <Field label="البريد الإلكتروني">
        <input value={f.contact_email} onChange={(e) => setF((s) => ({ ...s, contact_email: e.target.value }))} className={inputCls} placeholder="batch32@example.com" />
      </Field>
      <Field label="رابط فيسبوك">
        <input value={f.contact_facebook} onChange={(e) => setF((s) => ({ ...s, contact_facebook: e.target.value }))} className={inputCls} placeholder="https://facebook.com/..." />
      </Field>
      <Field label="رابط إنستغرام">
        <input value={f.contact_instagram} onChange={(e) => setF((s) => ({ ...s, contact_instagram: e.target.value }))} className={inputCls} placeholder="https://instagram.com/..." />
      </Field>
      <Field label="رقم واتساب (بدون + أو مسافات)">
        <input value={f.contact_whatsapp} onChange={(e) => setF((s) => ({ ...s, contact_whatsapp: e.target.value }))} className={inputCls} placeholder="249xxxxxxxxx" />
      </Field>
      <Field label="رابط تيليجرام">
        <input value={f.contact_telegram} onChange={(e) => setF((s) => ({ ...s, contact_telegram: e.target.value }))} className={inputCls} placeholder="https://t.me/..." />
      </Field>
      <button
        onClick={handleSave}
        disabled={saving}
        className="py-2.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 disabled:opacity-40 text-white font-bold text-sm transition-all flex items-center justify-center gap-2"
      >
        {saving && <Loader2 className="w-4 h-4 animate-spin" />}
        حفظ الإعدادات
      </button>
    </div>
  );
}
