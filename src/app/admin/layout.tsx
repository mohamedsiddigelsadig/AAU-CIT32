import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Newspaper, CalendarDays, BookOpen, Rocket, Image as ImageIcon, Users, Settings, UserCog } from "lucide-react";
import { getCurrentProfile } from "@/lib/supabase/server";
import { canAccess, roleLabel, type PermissionKey } from "@/lib/permissions";
import { LogoutButton } from "./logout-button";

const ADMIN_TABS: { href: string; label: string; icon: typeof LayoutDashboard; perm?: PermissionKey; superAdminOnly?: boolean }[] = [
  { href: "/admin", label: "نظرة عامة", icon: LayoutDashboard },
  { href: "/admin/news", label: "الأخبار", icon: Newspaper, perm: "news" },
  { href: "/admin/events", label: "التقويم", icon: CalendarDays, perm: "events" },
  { href: "/admin/subjects", label: "المواد الدراسية", icon: BookOpen, perm: "subjects" },
  { href: "/admin/projects", label: "مشاريع الطلاب", icon: Rocket, perm: "projects" },
  { href: "/admin/gallery", label: "أرشيف الذكريات", icon: ImageIcon, perm: "gallery" },
  { href: "/admin/committee", label: "اللجنة التنفيذية", icon: Users, perm: "committee" },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings, superAdminOnly: true },
  { href: "/admin/team", label: "الفريق والصلاحيات", icon: UserCog, superAdminOnly: true },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Middleware already redirects unauthenticated/non-staff requests away
  // from /admin/**, but this Server Component check is defense-in-depth
  // (and gets us the profile for the sidebar/logout button).
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "super_admin" && profile.role !== "committee_head")) {
    redirect("/admin/login");
  }

  const visibleTabs = ADMIN_TABS.filter((tab) => {
    if (tab.superAdminOnly) return profile.role === "super_admin";
    if (!tab.perm) return true; // overview — every staff member sees it
    return canAccess(profile, tab.perm);
  });

  return (
    <div dir="rtl" className="min-h-screen flex bg-slate-50 dark:bg-slate-950">
      <aside className="hidden md:flex w-60 shrink-0 flex-col border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
        <div className="font-extrabold mb-6 px-2 text-slate-900 dark:text-white">لوحة التحكم</div>
        <nav className="flex flex-col gap-1 flex-1">
          {visibleTabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-slate-200 dark:border-slate-800 pt-3 mt-3">
          <div className="px-2 mb-2">
            <div className="text-xs font-semibold truncate text-slate-700 dark:text-slate-200">{profile.full_name || "بدون اسم"}</div>
            <div className="text-[11px] text-slate-400">{roleLabel(profile.role)}</div>
          </div>
          <LogoutButton />
        </div>
      </aside>
      <main className="flex-1 min-w-0 p-5 md:p-8">{children}</main>
    </div>
  );
}
