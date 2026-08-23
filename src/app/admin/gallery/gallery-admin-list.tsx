"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Loader2, ImageIcon, Star } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useToast } from "@/components/toast-provider";
import { Modal, ConfirmDialog } from "@/components/ui/modal";
import { Field, useInputClass } from "@/components/ui/form";
import { PlaceholderArt } from "@/components/ui/primitives";
import { uploadPortalFile, getPortalFileUrl } from "@/lib/supabase/storage";
import { createAlbum, updateAlbum, deleteAlbum, addPhotos, deletePhoto } from "./actions";
import type { AlbumRow, PhotoRow } from "@/types/database";

type AlbumWithPhotos = AlbumRow & { photos: PhotoRow[] };

export function GalleryAdminList({ initialAlbums }: { initialAlbums: AlbumWithPhotos[] }) {
  const { dark } = useTheme();
  const router = useRouter();
  const { notify } = useToast();
  const [formModal, setFormModal] = useState<{ mode: "add" | "edit"; item?: AlbumWithPhotos } | null>(null);
  const [photosModal, setPhotosModal] = useState<AlbumWithPhotos | null>(null);
  const [confirmDel, setConfirmDel] = useState<string | null>(null);

  async function handleDelete() {
    if (!confirmDel) return;
    try {
      await deleteAlbum(confirmDel);
      notify("تم حذف الألبوم");
      router.refresh();
    } catch {
      notify("تعذّر الحذف", "error");
    }
    setConfirmDel(null);
  }

  return (
    <div>
      <button onClick={() => setFormModal({ mode: "add" })} className="mb-4 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm transition-colors">
        <Plus className="w-4 h-4" /> إضافة ألبوم
      </button>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {initialAlbums.map((a) => (
          <div key={a.id} className={cx("rounded-2xl border overflow-hidden", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
            <div className="h-28">
              {a.photos?.[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={getPortalFileUrl(a.photos[0].storage_path)} alt="" className="w-full h-full object-cover" />
              ) : (
                <PlaceholderArt tone="amber" Icon={ImageIcon} />
              )}
            </div>
            <div className="p-3.5">
              <div className="flex items-center gap-1.5">
                {a.featured && <Star className="w-3.5 h-3.5 text-amber-500 shrink-0 fill-amber-500" />}
                <div className={cx("font-bold text-sm truncate", dark ? "text-white" : "text-slate-900")}>{a.title}</div>
              </div>
              <div className={cx("text-xs mt-0.5 mb-3", dark ? "text-slate-400" : "text-slate-500")}>
                {a.year} · {a.photos?.length ?? 0} صورة
              </div>
              <div className="flex gap-1.5">
                <button onClick={() => setPhotosModal(a)} className={cx("flex-1 py-1.5 rounded-lg text-xs font-bold", dark ? "bg-slate-800 hover:bg-slate-700 text-slate-200" : "bg-slate-100 hover:bg-slate-200 text-slate-700")}>
                  إدارة الصور
                </button>
                <button onClick={() => setFormModal({ mode: "edit", item: a })} className={cx("p-1.5 rounded-lg", dark ? "hover:bg-slate-800 text-slate-400" : "hover:bg-slate-100 text-slate-500")}>
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setConfirmDel(a.id)} className={cx("p-1.5 rounded-lg", dark ? "hover:bg-red-500/10 text-red-400" : "hover:bg-red-50 text-red-500")}>
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      <Modal open={!!formModal} onClose={() => setFormModal(null)} title={formModal?.mode === "edit" ? "تعديل الألبوم" : "إضافة ألبوم"}>
        {formModal && (
          <AlbumForm
            initial={formModal.item}
            onDone={() => {
              setFormModal(null);
              router.refresh();
            }}
          />
        )}
      </Modal>

      <Modal open={!!photosModal} onClose={() => setPhotosModal(null)} title={photosModal ? `صور: ${photosModal.title}` : ""} wide>
        {photosModal && (
          <PhotosManager
            album={photosModal}
            onChange={() => router.refresh()}
          />
        )}
      </Modal>

      <ConfirmDialog open={!!confirmDel} onCancel={() => setConfirmDel(null)} onConfirm={handleDelete} text="سيتم حذف الألبوم وكل الصور بداخله. هل أنت متأكد؟" />
    </div>
  );
}

function AlbumForm({ initial, onDone }: { initial?: AlbumWithPhotos; onDone: () => void }) {
  const inputCls = useInputClass();
  const { notify } = useToast();
  const [title, setTitle] = useState(initial?.title ?? "");
  const [year, setYear] = useState(initial?.year ?? String(new Date().getFullYear()));
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    if (!title.trim()) return;
    setSaving(true);
    try {
      if (initial) await updateAlbum(initial.id, { title, year, featured });
      else await createAlbum({ title, year, featured });
      notify("تم الحفظ");
      onDone();
    } catch {
      notify("تعذّر الحفظ", "error");
    }
    setSaving(false);
  }

  return (
    <div>
      <Field label="عنوان الألبوم">
        <input value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} />
      </Field>
      <Field label="السنة">
        <input value={year} onChange={(e) => setYear(e.target.value)} className={inputCls} />
      </Field>
      <label className="flex items-center gap-2 mb-5 text-sm font-semibold cursor-pointer select-none">
        <input type="checkbox" checked={featured} onChange={(e) => setFeatured(e.target.checked)} className="w-4 h-4 rounded accent-blue-600" />
        <span className="text-slate-600 dark:text-slate-300">تمييز هذا الألبوم في الواجهة الرئيسية</span>
      </label>
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

function PhotosManager({ album, onChange }: { album: AlbumWithPhotos; onChange: () => void }) {
  const { notify } = useToast();
  const [photos, setPhotos] = useState(album.photos ?? []);
  const [uploading, setUploading] = useState(false);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const uploaded = await Promise.all(files.map((file) => uploadPortalFile(file, `gallery/${album.id}`)));
      await addPhotos(album.id, uploaded.map((u) => u.path));
      setPhotos((p) => [...p, ...uploaded.map((u, i) => ({ id: `temp-${i}-${Date.now()}`, album_id: album.id, storage_path: u.path, created_at: new Date().toISOString() }))]);
      onChange();
    } catch {
      notify("تعذّر رفع بعض الصور", "error");
    }
    setUploading(false);
    e.target.value = "";
  }

  async function handleRemove(photoId: string) {
    try {
      await deletePhoto(photoId, album.id);
      setPhotos((p) => p.filter((x) => x.id !== photoId));
      onChange();
    } catch {
      notify("تعذّر حذف الصورة", "error");
    }
  }

  return (
    <div>
      {photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-4">
          {photos.map((p) => (
            <div key={p.id} className="relative aspect-square rounded-lg overflow-hidden group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={getPortalFileUrl(p.storage_path)} alt="" className="w-full h-full object-cover" />
              <button onClick={() => handleRemove(p.id)} className="absolute top-1 left-1 p-1 rounded-md bg-slate-950/70 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
      <input type="file" accept="image/*" multiple onChange={handleUpload} className="w-full text-sm text-slate-600 dark:text-slate-300" disabled={uploading} />
      {uploading && (
        <div className="text-xs text-blue-500 mt-1.5 flex items-center gap-1.5">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> جاري الرفع...
        </div>
      )}
    </div>
  );
}
