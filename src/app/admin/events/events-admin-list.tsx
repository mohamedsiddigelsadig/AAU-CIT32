"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, CalendarDays, ClipboardList, GraduationCap, PartyPopper } from "lucide-react";
import { cx, fmtDate } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/toast-provider";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, useInputClass } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { createEvent, updateEvent, deleteEvent, type EventInput } from "./actions";
import type { EventRow, EventType } from "@/types/database";

const TYPE_LABELS: Record<EventType, string> = { exam: "امتحان", semester: "فصل دراسي", activity: "فعالية" };
const TYPE_ICONS: Record<EventType, typeof ClipboardList> = { exam: ClipboardList, semester: GraduationCap, activity: PartyPopper };
const TYPE_TONES: Record<EventType, "blue" | "amber" | "emerald"> = { exam: "amber", semester: "blue", activity: "emerald" };

export function EventsAdminList({ initialEvents }: { initialEvents: EventRow[] }) {
  const { dark } = useTheme();
  const router = useRouter();
  const { notify } = useToast();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: EventRow } | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmDel) return;
    try {
      await deleteEvent(confirmDel);
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
        <Plus className="w-4 h-4" /> إضافة حدث
      </button>
      <div className="flex flex-col gap-2.5">
        {initialEvents.length === 0 && <p className="text-sm text-slate-400">لا توجد أحداث بعد.</p>}
        {initialEvents.map((e) => {
          const Icon = TYPE_ICONS[e.type];
          return (
            <div key={e.id} className={cx("flex items-center gap-3 p-3.5 rounded-xl border", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
              <div className={cx("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", dark ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-700")}>
                <Icon className="w-4.5 h-4.5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cx("font-bold text-sm truncate", dark ? "text-white" : "text-slate-900")}>{e.title}</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <Badge tone={TYPE_TONES[e.type]}>{TYPE_LABELS[e.type]}</Badge>
                  <span className={cx("text-xs font-tech", dark ? "text-slate-400" : "text-slate-500")}>{fmtDate(e.event_date)}</span>
                </div>
              </div>
              <button onClick={() => setModal({ mode: "edit", item: e })} className={cx("p-2 rounded-lg", dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}>
                <Pencil className="w-4 h-4" />
              </button>
              <button onClick={() => setConfirmDel(e.id)} className={cx("p-2 rounded-lg", dark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-500")}>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "تعديل الحدث" : "إضافة حدث"}>
        {modal && (
          <EventForm
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

function EventForm({ initial, onDone }: { initial?: EventRow; onDone: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [type, setType] = useState<EventType>(initial?.type ?? "exam");
  const [date, setDate] = useState(initial?.event_date ?? new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const input: EventInput = { title, type, event_date: date };
    try {
      if (initial) await updateEvent(initial.id, input);
      else await createEvent(input);
      notify("تم الحفظ");
      onDone();
    } catch {
      notify("تعذّر الحفظ", "error");
    }
    setSaving(false);
  }

  return (
    <div>
      <Field label="عنوان الحدث">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} placeholder="امتحان نهاية الفصل" />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="النوع">
          <select value={type} onChange={(e) => setType(e.target.value as EventType)} className={inputCls}>
            <option value="exam">امتحان</option>
            <option value="semester">فصل دراسي</option>
            <option value="activity">فعالية</option>
          </select>
        </Field>
        <Field label="التاريخ">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
      </div>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!title.trim() || saving}
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
