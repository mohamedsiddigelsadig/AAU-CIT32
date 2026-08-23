import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Pin } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Badge } from "@/components/ui/primitives";
import { getPortalFileUrl } from "@/lib/supabase/storage";
import { fmtDate } from "@/lib/utils";
import { NewsGallery } from "./news-gallery";

export default async function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: news } = await supabase.from("news").select("*, news_images(*)").eq("id", id).single();

  if (!news) notFound();

  const images = (news.news_images ?? []).sort((a: any, b: any) => a.position - b.position).map((img: any) => getPortalFileUrl(img.storage_path));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main-content" className="max-w-3xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <Link href="/news" className="flex items-center gap-1.5 text-sm font-bold mb-6 text-blue-600 dark:text-blue-400">
          <ChevronRight className="w-4 h-4" /> كل الأخبار
        </Link>

        {images.length > 0 && <NewsGallery images={images} title={news.title} />}

        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <Badge tone="blue">{news.category}</Badge>
          {news.pinned && (
            <Badge tone="amber">
              <Pin className="w-3 h-3" /> مثبّت
            </Badge>
          )}
          <span className="text-xs text-slate-400 dark:text-slate-500 font-tech">{fmtDate(news.published_at)}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-extrabold mb-6 leading-tight font-display text-slate-900 dark:text-white">{news.title}</h1>

        <p className="leading-loose whitespace-pre-line text-base text-slate-700 dark:text-slate-300">{news.content}</p>
      </main>
      <Footer />
    </div>
  );
}
