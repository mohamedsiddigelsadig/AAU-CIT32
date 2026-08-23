"use server";

import { revalidatePath } from "next/cache";
import { assertPermission } from "@/lib/supabase/assert-permission";
import type { EventType } from "@/types/database";

export interface EventInput {
  title: string;
  type: EventType;
  event_date: string;
}

export async function createEvent(input: EventInput) {
  const supabase = await assertPermission("events");
  const { error } = await supabase.from("events").insert(input);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/events");
}

export async function updateEvent(id: string, input: EventInput) {
  const supabase = await assertPermission("events");
  const { error } = await supabase.from("events").update(input).eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/events");
}

export async function deleteEvent(id: string) {
  const supabase = await assertPermission("events");
  const { error } = await supabase.from("events").delete().eq("id", id);
  if (error) throw error;
  revalidatePath("/");
  revalidatePath("/admin/events");
}
