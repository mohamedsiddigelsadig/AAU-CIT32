"use server";

import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/supabase/assert-permission";

export interface ProjectInput {
  title: string;
  description: string;
  team: string;
  link: string;
  storage_path: string | null;
  featured: boolean;
}

export async function createProject(input: ProjectInput) {
  const supabase = await assertPermission("projects");
  const { error } = await supabase.from("projects").insert(input);
  if (error) throw error;
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function updateProject(id: string, input: ProjectInput) {
  const supabase = await assertPermission("projects");
  const { error } = await supabase.from("projects").update(input).eq("id", id);
  if (error) throw error;
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  revalidatePath("/");
}

export async function deleteProject(id: string) {
  const supabase = await assertPermission("projects");
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
  revalidatePath("/");
}
