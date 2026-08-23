import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./settings-form";

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5 text-slate-900 dark:text-white">إعدادات الموقع</h1>
      {settings && <SettingsForm initial={settings} />}
    </div>
  );
}
