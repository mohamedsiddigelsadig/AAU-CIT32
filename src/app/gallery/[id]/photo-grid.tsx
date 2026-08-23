"use client";

import { useState } from "react";
import { X, ImageIcon } from "lucide-react";
import { EmptyState } from "@/components/ui/primitives";

export function PhotoGrid({ photos, title }: { photos: string[]; title: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  if (photos.length === 0) return <EmptyState icon={ImageIcon} title="لا توجد صور في هذا الألبوم بعد" />;

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {photos.map((src, idx) => (
          <button key={src} onClick={() => setLightboxIdx(idx)} className="aspect-square rounded-xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={`${title} ${idx + 1}`} className="w-full h-full object-cover hover:scale-105 transition-transform" loading="lazy" />
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center p-6" style={{ zIndex: 110 }} onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-5 left-5 text-white/70 hover:text-white" aria-label="إغلاق">
            <X className="w-7 h-7" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photos[lightboxIdx]} alt="" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
