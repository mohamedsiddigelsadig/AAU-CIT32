"use client";

import { useState } from "react";
import { X } from "lucide-react";

export function NewsGallery({ images, title }: { images: string[]; title: string }) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <div className="mb-6">
      <button onClick={() => setLightboxIdx(0)} className="block w-full rounded-2xl overflow-hidden mb-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[0]} alt={title} className="w-full max-h-96 object-cover" />
      </button>
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, idx) => (
            <button
              key={src}
              onClick={() => setLightboxIdx(idx)}
              className="shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-slate-200 dark:border-slate-800 hover:border-blue-500 transition-colors"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {lightboxIdx !== null && (
        <div className="fixed inset-0 bg-slate-950/95 flex items-center justify-center p-6" style={{ zIndex: 110 }} onClick={() => setLightboxIdx(null)}>
          <button className="absolute top-5 left-5 text-white/70 hover:text-white" aria-label="إغلاق">
            <X className="w-7 h-7" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={images[lightboxIdx]} alt="" className="max-w-full max-h-full rounded-lg" onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </div>
  );
}
