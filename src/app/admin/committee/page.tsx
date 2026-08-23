import { createClient } from "@/lib/supabase/server";
import { CommitteeAdminList } from "./committee-admin-list";

export default async function AdminCommitteePage() {
  const supabase = await createClient();
  const { data: members } = await supabase.from("committee_members").select("*").order("sort_order", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5 text-slate-900 dark:text-white">إدارة اللجنة التنفيذية</h1>
      <CommitteeAdminList initialMembers={members ?? []} />
    </div>
  );
}
