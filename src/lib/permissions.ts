import type { Profile } from "@/types/database";

export const PERMISSIONS = [
  { key: "news", label: "الأخبار" },
  { key: "events", label: "التقويم الأكاديمي" },
  { key: "subjects", label: "المواد الدراسية والملخصات" },
  { key: "projects", label: "مشاريع الطلاب" },
  { key: "gallery", label: "أرشيف الذكريات" },
  { key: "committee", label: "اللجنة التنفيذية" },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]["key"];

/** Mirrors the has_permission() SQL function — keep both in sync. */
export function canAccess(profile: Pick<Profile, "role" | "permissions"> | null | undefined, key: PermissionKey) {
  if (!profile) return false;
  if (profile.role === "super_admin") return true;
  if (profile.role === "committee_head") return profile.permissions.includes(key);
  return false;
}

export function roleLabel(role: Profile["role"]) {
  return { super_admin: "صلاحية كاملة", committee_head: "رئيس لجنة", student: "طالب" }[role];
}
