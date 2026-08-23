import { createClient } from "@/lib/supabase/client";

const BUCKET = "portal-files";

/** Uploads a file under a folder prefix (e.g. "news", "subjects/<id>") and
 * returns its storage path plus a ready-to-use public URL. */
export async function uploadPortalFile(file: File, folder: string) {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${folder}/${crypto.randomUUID()}${ext ? `.${ext}` : ""}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  return { path, url: getPortalFileUrl(path) };
}

export function getPortalFileUrl(path: string) {
  const supabase = createClient();
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

export async function deletePortalFile(path: string) {
  const supabase = createClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);
  if (error) throw error;
}
