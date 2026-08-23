import { createClient } from "@/lib/supabase/server";
import { ProjectsAdminList } from "./projects-admin-list";

export default async function AdminProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase.from("projects").select("*").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5 text-slate-900 dark:text-white">إدارة مشاريع الطلاب</h1>
      <ProjectsAdminList initialProjects={projects ?? []} />
    </div>
  );
}
