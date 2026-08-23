import { Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SectionHeading, EmptyState } from "@/components/ui/primitives";
import { initials } from "@/lib/utils";

export const metadata = { title: "اللجنة التنفيذية — بوابة دفعة 32" };

export default async function CommitteePage() {
  const supabase = await createClient();
  const { data: members } = await supabase.from("committee_members").select("*").order("sort_order", { ascending: true });

  const groups = new Map<string, any[]>();
  for (const m of members ?? []) {
    if (!groups.has(m.group_name)) groups.set(m.group_name, []);
    groups.get(m.group_name)!.push(m);
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main-content" className="max-w-4xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <SectionHeading eyebrow="من يقود الدفعة" icon={Users} title="اللجنة التنفيذية" subtitle="الطلاب المسؤولون عن تنظيم شؤون الدفعة وأنشطتها." />
        {!members || members.length === 0 ? (
          <EmptyState icon={Users} title="لا يوجد أعضاء بعد" />
        ) : (
          <div className="flex flex-col gap-8">
            {Array.from(groups.entries()).map(([groupName, groupMembers]) => (
              <div key={groupName}>
                <h3 className="font-bold text-sm mb-3 text-slate-500 dark:text-slate-400">{groupName}</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {groupMembers!.map((m) => (
                    <div key={m.id} className="flex items-center gap-3 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shrink-0 bg-blue-700 text-white">{initials(m.name)}</div>
                      <div className="min-w-0">
                        <div className="font-bold text-sm truncate text-slate-900 dark:text-white">{m.name}</div>
                        <div className="text-xs mt-0.5 truncate text-slate-500 dark:text-slate-400">{m.role}</div>
                      </div>
                    </div>
                  ))}
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
