"use server";

import { revalidatePath } from "next/cache";
import { assertSuperAdmin } from "@/lib/supabase/assert-permission";
import { createServiceRoleClient } from "@/lib/supabase/admin-client";
import type { ProfileRole } from "@/types/database";

export interface TeamMemberInput {
  fullName: string;
  email: string;
  password: string;
  role: ProfileRole; // 'super_admin' | 'committee_head' (student isn't created here)
  permissions: string[]; // only meaningful when role === 'committee_head'
}

/** Creates a real auth account for a committee member and sets their
 * role/permissions in one step. Requires the service-role key because
 * creating another person's account isn't something the anon/RLS-scoped
 * client can ever be allowed to do. */
export async function createTeamMember(input: TeamMemberInput) {
  await assertSuperAdmin(); // only a super_admin may create accounts

  const admin = createServiceRoleClient();

  const { data, error } = await admin.auth.admin.createUser({
    email: input.email,
    password: input.password,
    email_confirm: true,
    user_metadata: { full_name: input.fullName },
  });
  if (error) throw new Error(error.message === "User already registered" ? "هذا البريد مسجّل بالفعل" : error.message);

  // The handle_new_user trigger already created a 'student' profile row —
  // update it with the real role/permissions.
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: input.fullName,
      role: input.role,
      permissions: input.role === "committee_head" ? input.permissions : [],
    })
    .eq("id", data.user.id);
  if (profileError) throw profileError;

  revalidatePath("/admin/team");
}

/** Lets a super_admin set a new password for a team member directly —
 * there's no self-service "forgot password" email flow here, so this is
 * the only recovery path if someone forgets their credentials. */
export async function resetTeamMemberPassword(id: string, newPassword: string) {
  await assertSuperAdmin();
  const admin = createServiceRoleClient();
  const { error } = await admin.auth.admin.updateUserById(id, { password: newPassword });
  if (error) throw error;
}

export async function updateTeamMember(id: string, updates: { role: ProfileRole; permissions: string[] }) {
  const supabase = await assertSuperAdmin();
  const { error } = await supabase
    .from("profiles")
    .update({
      role: updates.role,
      permissions: updates.role === "committee_head" ? updates.permissions : [],
    })
    .eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/team");
}

/** Demotes an account to 'student' (removes dashboard access) rather
 * than deleting the auth user outright — safer, and reversible. */
export async function revokeTeamAccess(id: string) {
  const supabase = await assertSuperAdmin();
  const { error } = await supabase.from("profiles").update({ role: "student", permissions: [] }).eq("id", id);
  if (error) throw error;
  revalidatePath("/admin/team");
}
