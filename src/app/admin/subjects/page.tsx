import { createClient } from "@/lib/supabase/server";
import { SubjectsAdminList } from "./subjects-admin-list";

export default async function AdminSubjectsPage() {
  const supabase = await createClient();
  const { data: subjects } = await supabase
    .from("subjects")
    .select("*, subject_files(*), subject_links(*), subject_assignments(*), summaries(*)")
    .order("semester");

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5 text-slate-900 dark:text-white">إدارة المواد الدراسية</h1>
      <SubjectsAdminList initialSubjects={subjects ?? []} />
    </div>
  );
}
