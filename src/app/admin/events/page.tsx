import { createClient } from "@/lib/supabase/server";
import { EventsAdminList } from "./events-admin-list";

export default async function AdminEventsPage() {
  const supabase = await createClient();
  const { data: events } = await supabase.from("events").select("*").order("event_date", { ascending: true });

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5 text-slate-900 dark:text-white">إدارة التقويم الأكاديمي</h1>
      <EventsAdminList initialEvents={events ?? []} />
    </div>
  );
}
