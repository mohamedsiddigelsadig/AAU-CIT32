import { Users, BookOpen, FileText, ClipboardList, Newspaper, ShieldCheck, Rocket } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export default async function AdminOverviewPage() {
  const supabase = await createClient();

  const [{ data: settings }, subjectsCount, filesCount, summariesCount, examsCount, newsCount, committeeCount, projectsCount] = await Promise.all([
    supabase.from("site_settings").select("students_count").eq("id", 1).single(),
    supabase.from("subjects").select("*", { count: "exact", head: true }),
    supabase.from("subject_files").select("*", { count: "exact", head: true }),
    supabase.from("summaries").select("*", { count: "exact", head: true }),
    supabase.from("events").select("*", { count: "exact", head: true }).eq("type", "exam"),
    supabase.from("news").select("*", { count: "exact", head: true }),
    supabase.from("committee_members").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
  ]);

  const blocks = [
    { label: "عدد الطلاب", value: settings?.students_count ?? 0, icon: Users },
    { label: "المواد الدراسية", value: subjectsCount.count ?? 0, icon: BookOpen },
    { label: "الملفات المرفوعة", value: (filesCount.count ?? 0) + (summariesCount.count ?? 0), icon: FileText },
    { label: "الامتحانات", value: examsCount.count ?? 0, icon: ClipboardList },
    { label: "الأخبار المنشورة", value: newsCount.count ?? 0, icon: Newspaper },
    { label: "أعضاء اللجنة", value: committeeCount.count ?? 0, icon: ShieldCheck },
    { label: "مشاريع الطلاب", value: projectsCount.count ?? 0, icon: Rocket },
  ];

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5 text-slate-900 dark:text-white">نظرة عامة</h1>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {blocks.map((b) => {
          const Icon = b.icon;
          return (
            <div key={b.label} className="rounded-2xl border p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400 mb-2" />
              <div className="text-2xl font-black text-slate-900 dark:text-white font-tech">{b.value}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{b.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
