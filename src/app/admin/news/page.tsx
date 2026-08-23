import { createClient } from "@/lib/supabase/server";
import { NewsAdminList } from "./news-admin-list";

export default async function AdminNewsPage() {
  const supabase = await createClient();
  const { data: news } = await supabase.from("news").select("*, news_images(*)").order("published_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5 text-slate-900 dark:text-white">إدارة الأخبار</h1>
      <NewsAdminList initialNews={news ?? []} />
    </div>
  );
}
