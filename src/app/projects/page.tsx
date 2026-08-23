import { Rocket, Users, Link as LinkIcon, Star } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SectionHeading, EmptyState, PlaceholderArt, Badge } from "@/components/ui/primitives";
import { getPortalFileUrl } from "@/lib/supabase/storage";

export const metadata = { title: "مشاريع الطلاب — بوابة دفعة 32" };

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase.from("projects").select("*").order("featured", { ascending: false }).order("created_at", { ascending: false });

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main-content" className="max-w-6xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <SectionHeading eyebrow="إبداعات الدفعة" icon={<Rocket />} title="مشاريع الطلاب" subtitle="مشاريع تخرج وأعمال طلابية من أعضاء الدفعة." tone="emerald" />
        {!projects || projects.length === 0 ? (
          <EmptyState icon={<Rocket />} title="لا توجد مشاريع بعد" />
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((p) => (
              <div key={p.id} className="rounded-2xl border overflow-hidden flex flex-col border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="h-36 relative shrink-0">
                  {p.storage_path ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={getPortalFileUrl(p.storage_path)} alt={p.title} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <PlaceholderArt tone="emerald" Icon={<Rocket />} />
                  )}
                  {p.featured && (
                    <div className="absolute top-3 right-3">
                      <Badge tone="amber">
                        <Star className="w-3 h-3" /> مميّز
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-bold mb-1.5 leading-snug font-display text-slate-900 dark:text-white">{p.title}</h3>
                  <p className="text-sm leading-relaxed line-clamp-3 mb-3 text-slate-500 dark:text-slate-400">{p.description}</p>
                  <div className="mt-auto pt-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 truncate">
                      <Users className="w-3.5 h-3.5 shrink-0" /> {p.team || "—"}
                    </span>
                    {p.link && (
                      <a href={p.link} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-bold text-blue-600 dark:text-blue-400 shrink-0">
                        <LinkIcon className="w-3.5 h-3.5" /> رابط المشروع
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
