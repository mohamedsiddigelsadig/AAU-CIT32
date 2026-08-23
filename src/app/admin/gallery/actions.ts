"use server";

import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/supabase/assert-permission";

export interface AlbumInput {
  title: string;
  year: string;
  featured: boolean;
}

export async function createAlbum(input: AlbumInput) {
  const supabase = await assertPermission("gallery");
  const { data, error } = await supabase.from("albums").insert(input).select().single();
  if (error) throw error;
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/");
  return data;
}

export async function updateAlbum(id: string, input: AlbumInput) {
  const supabase = await assertPermission("gallery");
  const { error } = await supabase.from("albums").update(input).eq("id", id);
  if (error) throw error;
  revalidatePath("/gallery");
  revalidatePath(`/gallery/${id}`);
  revalidatePath("/admin/gallery");
  revalidatePath("/");
}

export async function deleteAlbum(id: string) {
  const supabase = await assertPermission("gallery");
  const { error } = await supabase.from("albums").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/gallery");
  revalidatePath("/admin/gallery");
  revalidatePath("/");
}

export async function addPhotos(albumId: string, storagePaths: string[]) {
  const supabase = await assertPermission("gallery");
  const rows = storagePaths.map((storage_path) => ({ album_id: albumId, storage_path }));
  const { error } = await supabase.from("photos").insert(rows);
  if (error) throw error;
  revalidatePath("/gallery");
  revalidatePath(`/gallery/${albumId}`);
  revalidatePath("/admin/gallery");
}

export async function deletePhoto(photoId: string, albumId: string) {
  const supabase = await assertPermission("gallery");
  const { error } = await supabase.from("photos").delete().eq("id", photoId);
  if (error) throw error;
  revalidatePath("/gallery");
  revalidatePath(`/gallery/${albumId}`);
  revalidatePath("/admin/gallery");
}
