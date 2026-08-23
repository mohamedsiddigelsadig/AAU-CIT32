"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Pin, Loader2, X } from "lucide-react";
import { cx, fmtDateShort } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/toast-provider";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, useInputClass } from "@/components/ui/form";
import { Badge } from "@/components/ui/primitives";
import { uploadPortalFile, getPortalFileUrl } from "@/lib/supabase/storage";
import { createNews, updateNews, deleteNews, type NewsInput } from "./actions";

const CATEGORIES = ["عام", "أكاديمي", "امتحانات", "فعاليات"];

interface NewsWithImages {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  pinned: boolean;
  published_at: string;
  news_images: { id: string; storage_path: string; position: number }[];
}

export function NewsAdminList({ initialNews }: { initialNews: NewsWithImages[] }) {
  const { dark } = useTheme();
  const router = useRouter();
  const [modal, setModal] = useState<{ mode: "add" | "edit"; item?: NewsWithImages } | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);
  const { notify } = useToast();

  async function handleDelete() {
    if (!confirmDel) return;
    try {
      await deleteNews(confirmDel);
      notify("تم حذف الخبر");
      router.refresh();
    } catch (e) {
      notify("تعذّر حذف الخبر", "error");
    }
    setConfirmDel(null);
  }

  return (
    <div>
      <button
        onClick={() => setModal({ mode: "add" })}
        className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors"
      >
        <Plus className="w-4 h-4" /> إضافة خبر
      </button>

      <div className="flex flex-col gap-2.5">
        {initialNews.map((n) => (
          <div key={n.id} className={cx("flex items-center gap-3 p-3.5 rounded-xl border", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            {n.news_images?.[0] ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={getPortalFileUrl(n.news_images[0].storage_path)} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-11 h-11 rounded-lg shrink-0 bg-blue-700" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                {n.pinned && <Pin className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                <div className={cx("font-bold text-sm truncate", dark ? "text-white" : "text-slate-900")}>{n.title}</div>
              </div>
              <div className={cx("text-xs mt-0.5 flex items-center gap-1.5", dark ? "text-slate-400" : "text-slate-500")}>
                <Badge tone="blue">{n.category}</Badge>
                <span className="font-tech">{fmtDateShort(n.published_at)}</span>
              </div>
            </div>
            <button onClick={() => setModal({ mode: "edit", item: n })} className={cx("p-2 rounded-lg", dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}>
              <Pencil className="w-4 h-4" />
            </button>
            <button onClick={() => setConfirmDel(n.id)} className={cx("p-2 rounded-lg", dark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-500")}>
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === "edit" ? "تعديل الخبر" : "إضافة خبر"} wide>
        {modal && (
          <NewsForm
            initial={modal.item}
            onDone={() => {
              setModal(null);
              router.refresh();
            }}
          />
        )}
      </Modal>

      <ConfirmDialog open={!!confirmDel} onCancel={() => setConfirmDel(null)} onConfirm={handleDelete} text="هل أنت متأكد من حذف هذا الخبر؟" />
    </div>
  );
}

function NewsForm({ initial, onDone }: { initial?: NewsWithImages; onDone: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [content, setContent] = useState(initial?.content ?? "");
  const [category, setCategory] = useState(initial?.category ?? CATEGORIES[0]);
  const [pinned, setPinned] = useState(initial?.pinned ?? false);
  const [date, setDate] = useState(initial?.published_at ?? new Date().toISOString().slice(0, 10));
  const [images, setImages] = useState<{ path: string; url: string }[]>(
    (initial?.news_images ?? []).sort((a, b) => a.position - b.position).map((img) => ({ path: img.storage_path, url: getPortalFileUrl(img.storage_path) }))
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  async function handleImages(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((file) => uploadPortalFile(file, "news")));
      setImages((imgs) => [...imgs, ...uploaded]);
    } catch {
      notify("تعذّر رفع بعض الصور، حاول مرة أخرى", "error");
    }
    setUploading(false);
    e.target.value = "";
  }
  const removeImage = (idx: number) => setImages((imgs) => imgs.filter((_, i) => i !== idx));

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    const input: NewsInput = {
      title,
      excerpt,
      content,
      category,
      pinned,
      published_at: date,
      imagePaths: images.map((i) => i.path),
    };
    try {
      if (initial) {
        await updateNews(initial.id, input);
        notify("تم حفظ التغييرات");
      } else {
        await createNews(input);
        notify("تمت إضافة الخبر");
      }
      onDone();
    } catch {
      notify("تعذّر الحفظ — تحقق من الاتصال وحاول مجددًا", "error");
    }
    setSaving(false);
  }

  return (
    <div>
      <Field label="عنوان الخبر">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>

      <div className="block mb-4">
        <label htmlFor="news-images-input" className="block text-sm font-semibold mb-1.5 text-slate-500">
          صور المنشور (اختياري، يمكن أكثر من صورة)
        </label>
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-2">
            {images.map((img, idx) => (
              <div key={img.path} className="relative aspect-square rounded-lg overflow-hidden group">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(idx)}
                  className="absolute top-1 left-1 p-1 rounded-md bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
        <input id="news-images-input" type="file" accept="image/*" multiple onChange={handleImages} className="w-full text-sm text-slate-600 dark:text-slate-300" disabled={uploading} />
        {uploading && (
          <div className="text-xs text-blue-500 mt-1.5 flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري الرفع...
          </div>
        )}
      </div>

      <Field label="مقتطف مختصر">
        <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={2} className={inputCls} />
      </Field>
      <Field label="التفاصيل الكاملة (تقبل نصًا طويلًا)">
        <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className={inputCls} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="التاريخ">
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
        </Field>
        <Field label="التصنيف">
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <label className="flex items-center gap-2 mb-5 text-sm font-semibold cursor-pointer select-none">
        <input type="checkbox" checked={pinned} onChange={(e) => setPinned(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
        <span className="text-slate-600 dark:text-slate-300">تثبيت هذا الخبر في الأعلى</span>
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
