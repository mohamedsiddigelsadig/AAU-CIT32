import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { getPortalFileUrl } from "@/lib/supabase/storage";
import { PhotoGrid } from "./photo-grid";

export default async function AlbumDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: album } = await supabase.from("albums").select("*, photos(*)").eq("id", id).single();

  if (!album) notFound();

  const photoUrls = (album.photos ?? []).map((p: any) => getPortalFileUrl(p.storage_path));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main-content" className="max-w-5xl mx-auto px-5 sm:px-8 py-12 sm:py-16">
        <Link href="/gallery" className="flex items-center gap-1.5 text-sm font-bold mb-6 text-blue-600 dark:text-blue-400">
          <ChevronRight className="w-4 h-4" /> كل الألبومات
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold mb-1 font-display text-slate-900 dark:text-white">{album.title}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8 font-tech">{album.year}</p>
        <PhotoGrid photos={photoUrls} title={album.title} />
      </main>
      <Footer />
    </div>
  );
}
