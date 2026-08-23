import Link from "next/link";
import { Newspaper, Rocket, CalendarDays, ArrowLeft, Image as ImageIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroAndStats } from "@/components/home/hero-and-stats";
import { NewsCard } from "@/components/news/news-card";
import { SectionHeading, EmptyState } from "@/components/ui/primitives";
import { getPortalFileUrl } from "@/lib/supabase/storage";
import { fmtDateShort, daysUntil } from "@/lib/utils";

export default async function HomePage() {
  const supabase = await createClient();

  const [{ data: settings }, { data: news }, { data: events }, { data: projects }, { data: featuredAlbum }] = await Promise.all([
    supabase.from("site_settings").select("*").eq("id", 1).single(),
    supabase.from("news").select("*, news_images(*)").order("pinned", { ascending: false }).order("published_at", { ascending: false }).limit(3),
    supabase.from("events").select("*").order("event_date", { ascending: true }).limit(5),
    supabase.from("projects").select("*").order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(3),
    supabase.from("albums").select("*, photos(*)").order("featured", { ascending: false }).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ]);

  const upcoming = (events ?? [] as Array<{ id: string; event_date: string; title: string }>).filter(
    (e) => daysUntil(e.event_date) >= -1,
  );

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main-content">
        <HeroAndStats
          studentsCount={
            (settings as { students_count?: number | null } | null)?.students_count ?? 0
          }
        />

        <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
          <div className="flex items-end justify-between mb-2">
            <SectionHeading eyebrow="مستجدات الدفعة" icon={<Newspaper />} title="آخر الأخبار" />
            <Link href="/news" className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 mb-8">
              كل الأخبار <ArrowLeft className="w-4 h-4" />
            </Link>
          </div>
          {!news || news.length === 0 ? (
            <EmptyState icon={<Newspaper />} title="لا توجد أخبار بعد" />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {(news as any[]).map((n) => (
                <NewsCard key={n.id} news={n} coverImage={n.news_images?.sort((a: any, b: any) => a.position - b.position)[0]} />
              ))}
            </div>
          )}
        </section>

        {upcoming.length > 0 && (
          <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-900">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
              <SectionHeading eyebrow="لا تفوّت موعدًا" icon={<CalendarDays />} title="التقويم الأكاديمي" tone="amber" />
              <div className="flex flex-col gap-2.5">
                {upcoming.map((e) => (
                  <div key={e.id} className="flex items-center gap-4 p-4 rounded-xl border bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                    <div className="w-12 h-12 rounded-lg flex flex-col items-center justify-center shrink-0 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 font-tech">
                      <span className="text-[10px] leading-none">{fmtDateShort(e.event_date).split(" ")[0]}</span>
                      <span className="text-sm font-bold leading-none mt-0.5">{new Date(`${e.event_date}T00:00:00`).getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate text-slate-900 dark:text-white">{e.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {projects && projects.length > 0 && (
          <section className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
            <div className="flex items-end justify-between mb-2">
              <SectionHeading eyebrow="إبداعات الدفعة" icon={<Rocket />} title="مشاريع الطلاب" tone="emerald" />
              <Link href="/projects" className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 mb-8">
                كل المشاريع <ArrowLeft className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {projects.map((p) => (
                <div key={p.id} className="rounded-2xl border p-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                  <h3 className="font-bold mb-1.5 font-display text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{p.description}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {featuredAlbum && featuredAlbum.photos && featuredAlbum.photos.length > 0 && (
          <section className="bg-slate-50 dark:bg-slate-900/40 border-y border-slate-100 dark:border-slate-900">
            <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
              <div className="flex items-end justify-between mb-2">
                <SectionHeading eyebrow={featuredAlbum.title} icon={<ImageIcon />} title="أرشيف الذكريات" tone="amber" />
                <Link href="/gallery" className="hidden sm:flex items-center gap-1 text-sm font-bold text-blue-600 dark:text-blue-400 mb-8">
                  كل الألبومات <ArrowLeft className="w-4 h-4" />
                </Link>
              </div>
              <Link href={`/gallery/${featuredAlbum.id}`} className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {featuredAlbum.photos.slice(0, 8).map((p: any) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={p.id} src={getPortalFileUrl(p.storage_path)} alt={featuredAlbum.title} className="aspect-square w-full object-cover rounded-xl hover:opacity-90 transition-opacity" loading="lazy" />
                ))}
              </Link>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
