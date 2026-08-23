"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, FolderOpen, Download, Link as LinkIcon, ClipboardList, FileText } from "lucide-react";
import { cx, fmtDate } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/toast-provider";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, useInputClass } from "@/components/ui/form";
import { uploadPortalFile, getPortalFileUrl } from "@/lib/supabase/storage";
import {
  createSubject,
  updateSubject,
  deleteSubject,
  addSubjectFile,
  deleteSubjectFile,
  addSubjectLink,
  deleteSubjectLink,
  addSubjectAssignment,
  deleteSubjectAssignment,
  addSummary,
  deleteSummary,
  type SubjectInput,
} from "./actions";
import type { SubjectRow, SubjectFileRow, SubjectLinkRow, SubjectAssignmentRow, SummaryRow } from "@/types/database";

const SEMESTERS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن"];

type SubjectFull = SubjectRow & {
  subject_files: SubjectFileRow[];
  subject_links: SubjectLinkRow[];
  subject_assignments: SubjectAssignmentRow[];
  summaries: SummaryRow[];
};

export function SubjectsAdminList({ initialSubjects }: { initialSubjects: SubjectFull[] }) {
  const { dark } = useTheme();
  const router = useRouter();
  const { notify } = useToast();
  const [formModal, setFormModal] = useState<{ mode: "add" | "edit"; item?: SubjectFull } | null>(null);
  const [contentModal, setContentModal] = useState<SubjectFull | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmDel) return;
    try {
      await deleteSubject(confirmDel);
      notify("تم حذف المادة");
      router.refresh();
    } catch {
      notify("تعذّر الحذف", "error");
    }
    setConfirmDel(null);
  }

  return (
    <div>
      <button onClick={() => setFormModal({ mode: "add" })} className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors">
        <Plus className="w-4 h-4" /> إضافة مادة
      </button>
      <div className="flex flex-col gap-2.5">
        {initialSubjects.map((s) => (
          <div key={s.id} className={cx("flex items-center gap-3 p-3.5 rounded-xl border", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="flex-1 min-w-0">
              <div className={cx("font-bold text-sm truncate", dark ? "text-white" : "text-slate-900")}>{s.name}</div>
              <div className={cx("text-xs mt-0.5 truncate", dark ? "text-slate-400" : "text-slate-500")}>
                {s.doctor} · الفصل {s.semester}
              </div>
            </div>
            <button onClick={() => setContentModal(s)} className={cx("flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold", dark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700")}>
              <FolderOpen className="w-3.5 h-3.5" /> المحتوى
            </button>
            <button onClick={() => setFormModal({ mode: "edit", item: s })} className={cx("p-2 rounded-lg", dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}>
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => setConfirmDel(s.id)} className={cx("p-2 rounded-lg", dark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-500")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal open={!!formModal} onClose={() => setFormModal(null)} title={formModal?.mode === "edit" ? "تعديل المادة" : "إضافة مادة"}>
        {formModal && (
          <SubjectForm
            initial={formModal.item}
            onDone={() => {
              setFormModal(null);
              router.refresh();
            }}
          />
        )}
      </Modal>

      <Modal open={!!contentModal} onClose={() => setContentModal(null)} title={contentModal ? `محتوى: ${contentModal.name}` : ""} wide>
        {contentModal && <ContentManager subject={contentModal} onChange={() => router.refresh()} />}
      </Modal>

      <ConfirmDialog open={!!confirmDel} onCancel={() => setConfirmDel(null)} onConfirm={handleDelete} text="سيتم حذف المادة وكل محتواها (ملفات، روابط، واجبات، ملخصات). هل أنت متأكد؟" />
    </div>
  );
}

function SubjectForm({ initial, onDone }: { initial?: SubjectFull; onDone: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [name, setName] = useState(initial?.name ?? "");
  const [doctor, setDoctor] = useState(initial?.doctor ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [semester, setSemester] = useState(initial?.semester ?? SEMESTERS[0]);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!name.trim()) return;
    setSaving(true);
    const input: SubjectInput = { name, doctor, description, semester };
    try {
      if (initial) await updateSubject(initial.id, input);
      else await createSubject(input);
      notify("تم الحفظ");
      onDone();
    } catch {
      notify("تعذّر الحفظ", "error");
    }
    setSaving(false);
  }

  return (
    <div>
      <Field label="اسم المادة">
        <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} />
      </Field>
      <Field label="اسم الدكتور/المحاضر">
        <input value={doctor} onChange={(e) => setDoctor(e.target.value)} className={inputCls} />
      </Field>
      <Field label="وصف مختصر (اختياري)">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} />
      </Field>
      <Field label="الفصل الدراسي">
        <select value={semester} onChange={(e) => setSemester(e.target.value)} className={inputCls}>
          {SEMESTERS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </Field>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!name.trim() || saving}
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

function ContentManager({ subject, onChange }: { subject: SubjectFull; onChange: () => void }) {
  const { dark } = useTheme();
  const [tab, setTab] = useState<"files" | "summaries" | "links" | "assignments">("files");
  const tabs = [
    { id: "files" as const, label: "الملفات", icon: FileText },
    { id: "summaries" as const, label: "الملخصات", icon: FileText },
    { id: "links" as const, label: "روابط", icon: LinkIcon },
    { id: "assignments" as const, label: "الواجبات", icon: ClipboardList },
  ];
  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cx(
              "px-3 py-2 text-xs font-bold border-b-2 -mb-px transition-colors",
              tab === t.id ? "border-blue-600 text-blue-600 dark:text-blue-400" : "border-transparent text-slate-500 dark:text-slate-400"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      {tab === "files" && <FilesTab subject={subject} onChange={onChange} />}
      {tab === "summaries" && <SummariesTab subject={subject} onChange={onChange} />}
      {tab === "links" && <LinksTab subject={subject} onChange={onChange} />}
      {tab === "assignments" && <AssignmentsTab subject={subject} onChange={onChange} />}
    </div>
  );
}

function FilesTab({ subject, onChange }: { subject: SubjectFull; onChange: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [files, setFiles] = useState(subject.subject_files);
  const [uploading, setUploading] = useState(false);
  const [linkName, setLinkName] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [savingLink, setSavingLink] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { path } = await uploadPortalFile(file, `subjects/${subject.id}`);
      await addSubjectFile(subject.id, file.name, { storagePath: path, fileType: file.type, sizeBytes: file.size });
      setFiles((f) => [...f, { id: `temp-${Date.now()}`, subject_id: subject.id, name: file.name, storage_path: path, external_url: null, file_type: file.type, size_bytes: file.size, created_at: new Date().toISOString() }]);
      onChange();
    } catch {
      notify("تعذّر رفع الملف", "error");
    }
    setUploading(false);
    e.target.value = "";
  }
  async function handleAddLink() {
    if (!linkName.trim() || !linkUrl.trim()) return;
    setSavingLink(true);
    try {
      await addSubjectFile(subject.id, linkName, { externalUrl: linkUrl });
      setFiles((f) => [...f, { id: `temp-${Date.now()}`, subject_id: subject.id, name: linkName, storage_path: null, external_url: linkUrl, file_type: null, size_bytes: null, created_at: new Date().toISOString() }]);
      setLinkName("");
      setLinkUrl("");
      onChange();
    } catch {
      notify("تعذّر الإضافة", "error");
    }
    setSavingLink(false);
  }
  async function handleRemove(id: string) {
    try {
      await deleteSubjectFile(id);
      setFiles((f) => f.filter((x) => x.id !== id));
      onChange();
    } catch {
      notify("تعذّر الحذف", "error");
    }
  }

  return (
    <div>
      <RowList
        items={files}
        renderRow={(f) => (
          <>
            <Download className="w-4 h-4 shrink-0 text-slate-400" />
            <a href={f.storage_path ? getPortalFileUrl(f.storage_path) : f.external_url ?? "#"} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate text-sm hover:underline">
              {f.name}
            </a>
            {f.external_url && <span className="text-[10px] shrink-0 text-slate-400">رابط خارجي</span>}
          </>
        )}
        onRemove={handleRemove}
      />
      <div className="mt-3">
        <input type="file" onChange={handleUpload} disabled={uploading} className="w-full text-sm text-slate-600 dark:text-slate-300" />
        {uploading && (
          <div className="text-xs text-blue-500 mt-1.5 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري الرفع...
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs text-slate-400 shrink-0">أو ألصق رابط خارجي (قوقل درايف مثلًا)</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="flex gap-2">
        <input value={linkName} onChange={(e) => setLinkName(e.target.value)} placeholder="اسم الملف" className={inputCls} />
        <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://drive.google.com/..." className={inputCls} />
      </div>
      <button onClick={handleAddLink} disabled={!linkName.trim() || !linkUrl.trim() || savingLink} className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition-colors">
        إضافة الرابط
      </button>
    </div>
  );
}

function SummariesTab({ subject, onChange }: { subject: SubjectFull; onChange: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [summaries, setSummaries] = useState(subject.summaries);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [savingLink, setSavingLink] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !title.trim()) {
      if (!title.trim()) notify("اكتب عنوان الملخص أولًا", "error");
      return;
    }
    setUploading(true);
    try {
      const { path } = await uploadPortalFile(file, `summaries/${subject.id}`);
      const fileType = file.name.split(".").pop()?.toUpperCase() ?? "PDF";
      await addSummary(subject.id, title, fileType, { storagePath: path });
      setSummaries((s) => [...s, { id: `temp-${Date.now()}`, subject_id: subject.id, title, file_type: fileType, storage_path: path, external_url: null, created_at: new Date().toISOString() }]);
      setTitle("");
      onChange();
    } catch {
      notify("تعذّر رفع الملخص", "error");
    }
    setUploading(false);
    e.target.value = "";
  }
  async function handleAddLink() {
    if (!title.trim() || !linkUrl.trim()) {
      if (!title.trim()) notify("اكتب عنوان الملخص أولًا", "error");
      return;
    }
    setSavingLink(true);
    try {
      await addSummary(subject.id, title, "رابط", { externalUrl: linkUrl });
      setSummaries((s) => [...s, { id: `temp-${Date.now()}`, subject_id: subject.id, title, file_type: "رابط", storage_path: null, external_url: linkUrl, created_at: new Date().toISOString() }]);
      setTitle("");
      setLinkUrl("");
      onChange();
    } catch {
      notify("تعذّر الإضافة", "error");
    }
    setSavingLink(false);
  }
  async function handleRemove(id: string) {
    try {
      await deleteSummary(id);
      setSummaries((s) => s.filter((x) => x.id !== id));
      onChange();
    } catch {
      notify("تعذّر الحذف", "error");
    }
  }

  return (
    <div>
      <RowList
        items={summaries}
        renderRow={(sm) => (
          <>
            <Download className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="flex-1 min-w-0 truncate text-sm">{sm.title}</span>
            <span className="text-xs text-slate-400 shrink-0">{sm.file_type}</span>
          </>
        )}
        onRemove={handleRemove}
      />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الملخص" className={inputCls + " mt-2 mb-2"} />
      <input type="file" onChange={handleUpload} disabled={uploading} className="w-full text-sm text-slate-600 dark:text-slate-300" />
      {uploading && (
        <div className="text-xs text-blue-500 mt-1.5 flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري الرفع...
        </div>
      )}
      <div className="flex items-center gap-2 my-3">
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
        <span className="text-xs text-slate-400 shrink-0">أو ألصق رابط خارجي (قوقل درايف مثلًا)</span>
        <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
      </div>
      <div className="flex gap-2">
        <input value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://drive.google.com/..." className={inputCls} />
        <button onClick={handleAddLink} disabled={!title.trim() || !linkUrl.trim() || savingLink} className="shrink-0 px-4 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40 text-slate-700 dark:text-slate-200 transition-colors">
          إضافة
        </button>
      </div>
    </div>
  );
}

function LinksTab({ subject, onChange }: { subject: SubjectFull; onChange: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [links, setLinks] = useState(subject.subject_links);
  const [title, setTitle] = useState("");
  const [url, setUrl] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!title.trim() || !url.trim()) return;
    setSaving(true);
    try {
      await addSubjectLink(subject.id, title, url);
      setLinks((l) => [...l, { id: `temp-${Date.now()}`, subject_id: subject.id, title, url }]);
      setTitle("");
      setUrl("");
      onChange();
    } catch {
      notify("تعذّر الإضافة", "error");
    }
    setSaving(false);
  }
  async function handleRemove(id: string) {
    try {
      await deleteSubjectLink(id);
      setLinks((l) => l.filter((x) => x.id !== id));
      onChange();
    } catch {
      notify("تعذّر الحذف", "error");
    }
  }

  return (
    <div>
      <RowList
        items={links}
        renderRow={(l) => (
          <>
            <LinkIcon className="w-4 h-4 shrink-0 text-slate-400" />
            <a href={l.url} target="_blank" rel="noreferrer" className="flex-1 min-w-0 truncate text-sm hover:underline">
              {l.title}
            </a>
          </>
        )}
        onRemove={handleRemove}
      />
      <div className="flex gap-2 mt-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الرابط" className={inputCls} />
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://..." className={inputCls} />
      </div>
      <button onClick={handleAdd} disabled={!title.trim() || !url.trim() || saving} className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors">
        إضافة
      </button>
    </div>
  );
}

function AssignmentsTab({ subject, onChange }: { subject: SubjectFull; onChange: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [items, setItems] = useState(subject.subject_assignments);
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleAdd() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      await addSubjectAssignment(subject.id, title, dueDate || null);
      setItems((i) => [...i, { id: `temp-${Date.now()}`, subject_id: subject.id, title, due_date: dueDate || null }]);
      setTitle("");
      setDueDate("");
      onChange();
    } catch {
      notify("تعذّر الإضافة", "error");
    }
    setSaving(false);
  }
  async function handleRemove(id: string) {
    try {
      await deleteSubjectAssignment(id);
      setItems((i) => i.filter((x) => x.id !== id));
      onChange();
    } catch {
      notify("تعذّر الحذف", "error");
    }
  }

  return (
    <div>
      <RowList
        items={items}
        renderRow={(a) => (
          <>
            <ClipboardList className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="flex-1 min-w-0 truncate text-sm">{a.title}</span>
            {a.due_date && <span className="text-xs text-slate-400 shrink-0">{fmtDate(a.due_date)}</span>}
          </>
        )}
        onRemove={handleRemove}
      />
      <div className="flex gap-2 mt-2">
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان الواجب" className={inputCls} />
        <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className={inputCls} />
      </div>
      <button onClick={handleAdd} disabled={!title.trim() || saving} className="mt-2 px-4 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white transition-colors">
        إضافة
      </button>
    </div>
  );
}

function RowList<T extends { id: string }>({ items, renderRow, onRemove }: { items: T[]; renderRow: (item: T) => React.ReactNode; onRemove: (id: string) => void }) {
  const { dark } = useTheme();
  if (items.length === 0) return <p className="text-xs text-slate-400 py-2">لا توجد عناصر بعد.</p>;
  return (
    <div className="flex flex-col gap-1">
      {items.map((item) => (
        <div key={item.id} className={cx("flex items-center gap-2 py-1.5 px-2 rounded-lg", dark ? "hover:bg-slate-800" : "hover:bg-slate-50")}>
          {renderRow(item)}
          <button onClick={() => onRemove(item.id)} className="shrink-0 p-1 rounded text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
