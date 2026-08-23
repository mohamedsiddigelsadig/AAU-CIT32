"use server";

import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/supabase/assert-permission";

export interface NewsInput {
  title: string;
  excerpt: string;
  content: string;
  category: string;
  pinned: boolean;
  published_at: string;
  imagePaths: string[]; // already-uploaded Supabase Storage paths, in display order
}

export async function createNews(input: NewsInput) {
  const supabase = await assertPermission("news");

  const { data: news, error } = await supabase
    .from("news")
    .insert({
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      pinned: input.pinned,
      published_at: input.published_at,
    })
    .select()
    .single();
  if (error) throw error;

  if (input.imagePaths.length > 0) {
    const rows = input.imagePaths.map((storage_path, position) => ({ news_id: news.id, storage_path, position }));
    const { error: imgError } = await supabase.from("news_images").insert(rows);
    if (imgError) throw imgError;
  }

  revalidatePath("/news");
  revalidatePath("/admin/news");
  revalidatePath("/");
  return news;
}

export async function updateNews(id: string, input: NewsInput) {
  const supabase = await assertPermission("news");

  const { error } = await supabase
    .from("news")
    .update({
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      category: input.category,
      pinned: input.pinned,
      published_at: input.published_at,
    })
    .eq("id", id);
  if (error) throw error;

  // Replace the image set: simplest correct approach given the small
  // per-post image counts here — delete existing rows, insert current ones.
  await supabase.from("news_images").delete().eq("news_id", id);
  if (input.imagePaths.length > 0) {
    const rows = input.imagePaths.map((storage_path, position) => ({ news_id: id, storage_path, position }));
    const { error: imgError } = await supabase.from("news_images").insert(rows);
    if (imgError) throw imgError;
  }

  revalidatePath("/news");
  revalidatePath(`/news/${id}`);
  revalidatePath("/admin/news");
  revalidatePath("/");
}

export async function deleteNews(id: string) {
  const supabase = await assertPermission("news");
  const { error } = await supabase.from("news").delete().eq("id", id);
  if (error) throw error;

  revalidatePath("/news");
  revalidatePath("/admin/news");
  revalidatePath("/");
}
