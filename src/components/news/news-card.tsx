import Link from "next/link";
import { Newspaper, Pin } from "lucide-react";
import { cx, fmtDateShort } from "@/lib/utils";
import { Badge, PlaceholderArt } from "@/components/ui/primitives";
import { getPortalFileUrl } from "@/lib/supabase/storage";
import type { NewsRow, NewsImageRow } from "@/types/database";

export function NewsCard({ news, coverImage }: { news: NewsRow; coverImage?: NewsImageRow }) {
  return (
    <Link
      href={`/news/${news.id}`}
      className={cx(
        "text-right rounded-2xl border overflow-hidden transition-all hover:-translate-y-1 flex flex-col",
        "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-700/60 hover:shadow-lg"
      )}
    >
      <div className="h-36 relative shrink-0">
        {coverImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={getPortalFileUrl(coverImage.storage_path)} alt={news.title} className="w-full h-full object-cover" loading="lazy" />
        ) : (
          <PlaceholderArt tone={news.pinned ? "amber" : "blue"} Icon={Newspaper} />
        )}
        {news.pinned && (
          <div className="absolute top-3 right-3">
            <Badge tone="amber">
              <Pin className="w-3 h-3" /> مثبّت
            </Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-2">
          <Badge tone="blue">{news.category}</Badge>
          <span className="text-xs text-slate-400 dark:text-slate-500 font-tech">{fmtDateShort(news.published_at)}</span>
        </div>
        <h3 className="font-bold mb-1.5 leading-snug font-display text-slate-900 dark:text-white">{news.title}</h3>
        <p className="text-sm leading-relaxed line-clamp-2 mb-3 text-slate-500 dark:text-slate-400">{news.excerpt}</p>
        <span className="text-xs font-bold mt-auto pt-1 text-blue-600 dark:text-blue-400">اقرأ المزيد</span>
      </div>
    </Link>
  );
}
