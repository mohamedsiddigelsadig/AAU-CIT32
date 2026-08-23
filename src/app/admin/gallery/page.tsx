import { createClient } from "@/lib/supabase/server";
import { GalleryAdminList } from "./gallery-admin-list";

export default async function AdminGalleryPage() {
  const supabase = await createClient();
  const { data: albums } = await supabase.from("albums").select("*, photos(*)").order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="text-xl font-extrabold mb-5 text-slate-900 dark:text-white">إدارة أرشيف الذكريات</h1>
      <GalleryAdminList initialAlbums={albums ?? []} />
    </div>
  );
}
