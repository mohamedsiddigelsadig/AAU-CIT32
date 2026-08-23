import { BookOpen } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SectionHeading } from "@/components/ui/primitives";
import { SubjectsBrowser } from "./subjects-browser";

export const metadata = { title: "المواد الدراسية — بوابة دفعة 32" };

export default async function SubjectsPage() {
  const supabase = await createClient();
  const [{ data: subjects }, { data: summaries }] = await Promise.all([
    supabase.from("subjects").select("*, subject_files(*), subject_links(*), subject_assignments(*)").order("name"),
    supabase.from("summaries").select("*"),
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main-content" className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <SectionHeading eyebrow="محتوى أكاديمي" icon={<BookOpen />} title="المواد الدراسية" subtitle="المواد مقسّمة حسب الفصل الدراسي، مع الملفات والملخصات والواجبات وروابط المحاضرات." />
        <SubjectsBrowser subjects={subjects ?? []} summaries={summaries ?? []} />
      </main>
      <Footer />
    </div>
  );
}
