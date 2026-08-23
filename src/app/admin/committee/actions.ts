"use server";

import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/supabase/assert-permission";

export interface CommitteeMemberInput {
  name: string;
  role: string;
  group_name: string;
  sort_order: number;
}

export async function createCommitteeMember(input: CommitteeMemberInput) {
  const supabase = await assertPermission("committee");
  const { error } = await supabase.from("committee_members").insert(input as any);
  if (error) throw error;
  revalidatePath("/committee");
  revalidatePath("/admin/committee");
}

export async function updateCommitteeMember(id: string, input: CommitteeMemberInput) {
  const supabase = await assertPermission("committee");
  const { error } = await supabase.from("committee_members").update(input as any).eq("id", id);
  if (error) throw error;
  revalidatePath("/committee");
  revalidatePath("/admin/committee");
}

export async function deleteCommitteeMember(id: string) {
  const supabase = await assertPermission("committee");
  const { error } = await supabase.from("committee_members").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/committee");
  revalidatePath("/admin/committee");
}
