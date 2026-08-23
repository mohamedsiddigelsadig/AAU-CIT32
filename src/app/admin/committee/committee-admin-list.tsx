"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/toast-provider";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, useInputClass } from "@/components/ui/form";
import { initials } from "@/lib/utils";
import { createCommitteeMember, updateCommitteeMember, deleteCommitteeMember, type CommitteeMemberInput } from "./actions";
import type { CommitteeMemberRow } from "@/types/database";

export function CommitteeAdminList({ initialMembers }: { initialMembers: CommitteeMemberRow[] }) {
  const { dark } = useTheme();
  const router = useRouter();
  const { notify } = useToast();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: CommitteeMemberRow } | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmDel) return;
    try {
      await deleteCommitteeMember(confirmDel);
      notify("تم الحذف");
      router.refresh();
    } catch {
      notify("تعذّر الحذف", "error");
    }
    setConfirmDel(null);
  }

  return (
    <div>
      <button onClick={() => setModal({ mode: "add" })} className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors">
        <Plus className="w-4 h-4" /> إضافة عضو
      </button>
      <div className="flex flex-col gap-2.5">
        {initialMembers.map((m) => (
          <div key={m.id} className={cx("flex items-center gap-3 p-3.5 rounded-xl border", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 bg-blue-700 text-white">{initials(m.name)}</div>
            <div className="flex-1 min-w-0">
              <div className={cx("font-bold text-sm truncate", dark ? "text-white" : "text-slate-900")}>{m.name}</div>
              <div className={cx("text-xs mt-0.5 truncate", dark ? "text-slate-400" : "text-slate-500")}>
                {m.role} · {m.group_name}
              </div>
            </div>
            <button onClick={() => setModal({ mode: "edit", item: m })} className={cx("p-2 rounded-lg", dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}>
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => setConfirmDel(m.id)} className={cx("p-2 rounded-lg", dark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-500")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "تعديل العضو" : "إضافة عضو"}>
        {modal && (
          <MemberForm
            initial={modal.item}
            onDone={() => {
              setModal(null);
              router.refresh();
            }}
          />
        )}
      </Modal>
      <ConfirmDialog open={!!confirmDel} onCancel={() => setConfirmDel(null)} onConfirm={handleDelete} />
    </div>
  );
}

function MemberForm({ initial, onDone }: { initial?: CommitteeMemberRow; onDone: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [role, setRole] = useState(initial?.role ?? "");
  const [groupName, setGroupName] = useState(initial?.group_name ?? "اللجان");
  const [sortOrder, setSortOrder] = useState(initial?.sort_order ?? 0);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim() || !role.trim()) return;
    setSaving(true);
    const input: CommitteeMemberInput = { name, role, group_name: groupName, sort_order: sortOrder };
    try {
      if (initial) await updateCommitteeMember(initial.id, input);
      else await createCommitteeMember(input);
      notify("تم الحفظ");
      onDone();
    } catch {
      notify("تعذّر الحفظ", "error");
    }
    setSaving(false);
  }

  return (
    <div>
      <Field label="الاسم الكامل">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>
      <Field label="المنصب">
        <input value={role} onChange={(e) => setRole(e.target.value)} className={inputCls} placeholder="رئيس اللجنة العلمية" />
      </Field>
      <Field label="اسم المجموعة (تظهر كعنوان تجميعي)">
        <input value={groupName} onChange={(e) => setGroupName(e.target.value)} className={inputCls} placeholder="اللجان" />
      </Field>
      <Field label="ترتيب الظهور (رقم أصغر = أول)">
        <input type="number" value={sortOrder} onChange={(e) => setSortOrder(Number(e.target.value))} className={inputCls} />
      </Field>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!name.trim() || !role.trim() || saving}
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
