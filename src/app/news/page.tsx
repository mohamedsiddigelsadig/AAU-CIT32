import { Newspaper } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { NewsCard } from "@/components/news/news-card";
import { SectionHeading, EmptyState } from "@/components/ui/primitives";

export const metadata = { title: "الأخبار — بوابة دفعة 32" };

export default async function NewsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("news").select("*, news_images(*)").order("pinned", { ascending: false }).order("published_at", { ascending: false });
  if (category) query = query.eq("category", category);
  const { data: news } = await query;

  const { data: allNews } = await supabase.from("news").select("category");
  const categories = Array.from(new Set((allNews ?? []).map((n) => n.category)));

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main-content" className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <SectionHeading eyebrow="مستجدات الدفعة" icon={<Newspaper />} title="الأخبار والإعلانات" subtitle="كل ما هو جديد يخص الدفعة والكلية في مكان واحد." />
        <div className="flex flex-wrap gap-2 mb-8">
          <a
            href="/news"
            className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${!category ? "bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"}`}
          >
            الكل
          </a>
          {categories.map((c) => (
            <a
              key={c}
              href={`/news?category=${encodeURIComponent(c)}`}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${category === c ? "bg-blue-50 dark:bg-blue-500/15 border-blue-200 dark:border-blue-500/40 text-blue-700 dark:text-blue-300" : "border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700"}`}
            >
              {c}
            </a>
          ))}
        </div>
        {!news || news.length === 0 ? (
          <EmptyState icon={<Newspaper />} title="لا توجد أخبار في هذا التصنيف" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {news.map((n) => (
              <NewsCard key={n.id} news={n} coverImage={n.news_images?.sort((a: any, b: any) => a.position - b.position)[0]} />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
