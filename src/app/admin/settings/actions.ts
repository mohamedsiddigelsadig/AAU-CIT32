"use server";

import { revalidatePath } from "next/cache";
import { assertSuperAdmin } from "@/lib/supabase/assert-permission";
import type { SiteSettingsRow } from "@/types/database";

export type SettingsInput = Omit<SiteSettingsRow, "id" | "updated_at">;

export async function updateSettings(input: SettingsInput) {
  const supabase = await assertSuperAdmin();
  const { error } = await supabase
    .from("site_settings")
    .update({ ...input, updated_at: new Date().toISOString() })
    .eq("id", 1);
  if (error) throw error;

  revalidatePath("/");
  revalidatePath("/contact");
  revalidatePath("/admin/settings");
}
