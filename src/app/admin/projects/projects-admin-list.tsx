"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, X, Star } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/toast-provider";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, useInputClass } from "@/components/ui/form";
import { uploadPortalFile, getPortalFileUrl } from "@/lib/supabase/storage";
import { createProject, updateProject, deleteProject, type ProjectInput } from "./actions";
import type { ProjectRow } from "@/types/database";

export function ProjectsAdminList({ initialProjects }: { initialProjects: ProjectRow[] }) {
  const { dark } = useTheme();
  const router = useRouter();
  const { notify } = useToast();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: ProjectRow } | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmDel) return;
    try {
      await deleteProject(confirmDel);
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
        <Plus className="w-4 h-4" /> إضافة مشروع
      </button>
      <div className="flex flex-col gap-2.5">
        {initialProjects.map((p) => (
          <div key={p.id} className={cx("flex items-center gap-3 p-3.5 rounded-xl border", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            {p.storage_path ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getPortalFileUrl(p.storage_path)} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-lg shrink-0 bg-emerald-700" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {p.featured && <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500" />}
                <div className={cx("font-bold text-sm truncate", dark ? "text-white" : "text-slate-900")}>{p.title}</div>
              </div>
              <div className={cx("text-xs mt-0.5 truncate", dark ? "text-slate-400" : "text-slate-500")}>{p.team || "بدون فريق محدد"}</div>
            </div>
            <button onClick={() => setModal({ mode: "edit", item: p })} className={cx("p-2 rounded-lg", dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}>
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => setConfirmDel(p.id)} className={cx("p-2 rounded-lg", dark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-500")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "تعديل المشروع" : "إضافة مشروع"}>
        {modal && (
          <ProjectForm
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

function ProjectForm({ initial, onDone }: { initial?: ProjectRow; onDone: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [team, setTeam] = useState(initial?.team ?? "");
  const [link, setLink] = useState(initial?.link ?? "");
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [imagePath, setImagePath] = useState<string | null>(initial?.storage_path ?? null);
  const [imageUrl, setImageUrl] = useState<string | null>(initial?.storage_path ? getPortalFileUrl(initial.storage_path) : null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const { path, url } = await uploadPortalFile(file, "projects");
      setImagePath(path);
      setImageUrl(url);
    } catch {
      notify("تعذّر رفع الصورة", "error");
    }
    setUploading(false);
  }

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const input: ProjectInput = { title, description, team, link, storage_path: imagePath, featured };
    try {
      if (initial) await updateProject(initial.id, input);
      else await createProject(input);
      notify("تم الحفظ");
      onDone();
    } catch {
      notify("تعذّر الحفظ", "error");
    }
    setSaving(false);
  }

  return (
    <div>
      <Field label="اسم المشروع">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>
      <Field label="صورة توضيحية (اختياري)">
        {imageUrl && (
          <div className="relative mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="" className="w-full h-40 object-cover rounded-lg" />
            <button
              type="button"
              onClick={() => {
                setImagePath(null);
                setImageUrl(null);
              }}
              className="absolute top-2 left-2 p-1.5 rounded-md bg-slate-950/70 text-white hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <input type="file" accept="image/*" onChange={handleImage} className="w-full text-sm text-slate-600 dark:text-slate-300" disabled={uploading} />
        {uploading && (
          <div className="text-xs text-blue-500 mt-1.5 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري الرفع...
          </div>
        )}
      </Field>
      <Field label="الوصف">
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} className={inputCls} />
      </Field>
      <Field label="الفريق">
        <input value={team} onChange={(e) => setTeam(e.target.value)} className={inputCls} placeholder="أسماء أعضاء الفريق" />
      </Field>
      <Field label="رابط المشروع (اختياري)">
        <input value={link} onChange={(e) => setLink(e.target.value)} className={inputCls} placeholder="https://..." />
      </Field>
      <label className="flex items-center gap-2 mb-5 text-sm font-semibold cursor-pointer select-none">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
        <span className="text-slate-600 dark:text-slate-300">تمييز هذا المشروع في الواجهة الرئيسية</span>
      </label>
      <div className="flex gap-3">
        <button
          onClick={handleSave}
          disabled={!title.trim() || saving || uploading}
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
