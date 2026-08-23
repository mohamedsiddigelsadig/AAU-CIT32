"use server";

import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/supabase/assert-permission";

export interface SubjectInput {
  name: string;
  doctor: string;
  description: string;
  semester: string;
}

function revalidateSubjects(subjectId?: string) {
  revalidatePath("/subjects");
  revalidatePath("/admin/subjects");
}

export async function createSubject(input: SubjectInput) {
  const supabase = await assertPermission("subjects");
  const { data, error } = await supabase.from("subjects").insert(input).select().single();
  if (error) throw error;
  revalidateSubjects();
  return data;
}

export async function updateSubject(id: string, input: SubjectInput) {
  const supabase = await assertPermission("subjects");
  const { error } = await supabase.from("subjects").update(input).eq("id", id);
  if (error) throw error;
  revalidateSubjects();
}

export async function deleteSubject(id: string) {
  const supabase = await assertPermission("subjects");
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) throw error;
  revalidateSubjects();
}

// ---------- files ----------
export async function addSubjectFile(subjectId: string, name: string, source: { storagePath: string; fileType: string; sizeBytes: number } | { externalUrl: string }) {
  const supabase = await assertPermission("subjects");
  const row =
    "storagePath" in source
      ? { subject_id: subjectId, name, storage_path: source.storagePath, file_type: source.fileType, size_bytes: source.sizeBytes, external_url: null }
      : { subject_id: subjectId, name, storage_path: null, file_type: null, size_bytes: null, external_url: source.externalUrl };
  const { error } = await supabase.from("subject_files").insert(row);
  if (error) throw error;
  revalidateSubjects();
}
export async function deleteSubjectFile(id: string) {
  const supabase = await assertPermission("subjects");
  const { error } = await supabase.from("subject_files").delete().eq("id", id);
  if (error) throw error;
  revalidateSubjects();
}

// ---------- links ----------
export async function addSubjectLink(subjectId: string, title: string, url: string) {
  const supabase = await assertPermission("subjects");
  const { error } = await supabase.from("subject_links").insert({ subject_id: subjectId, title, url });
  if (error) throw error;
  revalidateSubjects();
}
export async function deleteSubjectLink(id: string) {
  const supabase = await assertPermission("subjects");
  const { error } = await supabase.from("subject_links").delete().eq("id", id);
  if (error) throw error;
  revalidateSubjects();
}

// ---------- assignments ----------
export async function addSubjectAssignment(subjectId: string, title: string, dueDate: string | null) {
  const supabase = await assertPermission("subjects");
  const { error } = await supabase.from("subject_assignments").insert({ subject_id: subjectId, title, due_date: dueDate });
  if (error) throw error;
  revalidateSubjects();
}
export async function deleteSubjectAssignment(id: string) {
  const supabase = await assertPermission("subjects");
  const { error } = await supabase.from("subject_assignments").delete().eq("id", id);
  if (error) throw error;
  revalidateSubjects();
}

// ---------- summaries ----------
export async function addSummary(subjectId: string, title: string, fileType: string, source: { storagePath: string } | { externalUrl: string }) {
  const supabase = await assertPermission("subjects");
  const row =
    "storagePath" in source
      ? { subject_id: subjectId, title, file_type: fileType, storage_path: source.storagePath, external_url: null }
      : { subject_id: subjectId, title, file_type: fileType, storage_path: null, external_url: source.externalUrl };
  const { error } = await supabase.from("summaries").insert(row);
  if (error) throw error;
  revalidateSubjects();
}
export async function deleteSummary(id: string) {
  const supabase = await assertPermission("subjects");
  const { error } = await supabase.from("summaries").delete().eq("id", id);
  if (error) throw error;
  revalidateSubjects();
}
