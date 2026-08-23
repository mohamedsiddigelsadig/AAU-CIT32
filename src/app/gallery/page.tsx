import Link from "next/link";
import { Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SectionHeading, EmptyState, PlaceholderArt } from "@/components/ui/primitives";
import { getPortalFileUrl } from "@/lib/supabase/storage";

export const metadata = { title: "أرشيف الذكريات — بوابة دفعة 32" };

export default async function GalleryPage() {
  const supabase = await createClient();
  const { data: albums } = await supabase.from("albums").select("*, photos(*)").order("featured", { ascending: false }).order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main-content" className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <SectionHeading eyebrow="لحظات لا تُنسى" icon={<ImageIcon />} title="أرشيف الذكريات" subtitle="ألبومات صور من فعاليات وأنشطة الدفعة." tone="amber" />
        {!albums || albums.length === 0 ? (
          <EmptyState icon={<ImageIcon />} title="لا توجد ألبومات بعد" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {albums.map((a) => (
              <Link key={a.id} href={`/gallery/${a.id}`} className="rounded-2xl border overflow-hidden group border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:-translate-y-1 transition-all">
                <div className="h-40 relative">
                  {a.photos?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getPortalFileUrl(a.photos[0].storage_path)} alt={a.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <PlaceholderArt tone="amber" Icon={<ImageIcon />} />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-bold leading-snug font-display text-slate-900 dark:text-white">{a.title}</h3>
                  <div className="text-xs mt-1 text-slate-500 dark:text-slate-400 font-tech">
                    {a.year} · {a.photos?.length ?? 0} صورة
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
