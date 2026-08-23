import { createClient } from "@/lib/supabase/server";
import { TeamAdminList } from "./team-admin-list";

export default async function AdminTeamPage() {
  const supabase = await createClient();
  const { data: profiles } = await supabase.from("profiles").select("*").neq("role", "student").order("created_at", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-1 text-slate-900 dark:text-white">الفريق والصلاحيات</h1>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-5">
        صلاحية كاملة للأمين العام ورئيس الدفعة. رؤساء اللجان يشوفون فقط الأقسام اللي تتوافق مع تخصصهم.
      </p>
      <TeamAdminList initialProfiles={profiles ?? []} />
    </div>
  );
}
