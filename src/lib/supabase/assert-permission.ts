import "server-only";
import { createClient } from "@/lib/supabase/server";
import { canAccess, type PermissionKey } from "@/lib/permissions";

/**
 * Every Server Action should call this (or assertSuperAdmin) before
 * writing anything. RLS enforces the same rule at the database level —
 * this is the second, defense-in-depth check, and it's also what lets
 * an action return a clear Arabic error instead of a raw Postgres one.
 */
export async function assertPermission(perm: PermissionKey) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("غير مصرح — الرجاء تسجيل الدخول");

  const { data: profile } = await supabase.from("profiles").select("role, permissions").eq("id", user.id).single();
  if (!canAccess(profile, perm)) throw new Error("ليس لديك صلاحية للتعديل في هذا القسم");

  return supabase;
}

export async function assertSuperAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("غير مصرح — الرجاء تسجيل الدخول");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "super_admin") throw new Error("هذا الإجراء متاح فقط للأمين العام ورئيس الدفعة");

  return supabase;
}
