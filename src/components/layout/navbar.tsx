"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Sun, Moon, LucideIcon, LayoutDashboard, Newspaper, BookOpen, Rocket, Image as ImageIcon, Users, MessageCircle } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { BatchLogo } from "@/components/ui/primitives";

const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/", label: "الرئيسية", icon: LayoutDashboard },
  { href: "/news", label: "الأخبار", icon: Newspaper },
  { href: "/subjects", label: "المواد الدراسية", icon: BookOpen },
  { href: "/projects", label: "مشاريع الطلاب", icon: Rocket },
  { href: "/gallery", label: "أرشيف الذكريات", icon: ImageIcon },
  { href: "/committee", label: "اللجنة التنفيذية", icon: Users },
  { href: "/contact", label: "تواصل معنا", icon: MessageCircle },
];

function useHideOnScroll(threshold = 80) {
  const [hidden, setHidden] = useState(false);
  const lastY = useRef(0);
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      if (y > lastY.current && y > threshold) setHidden(true);
      else setHidden(false);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return hidden;
}

export function Navbar() {
  const { dark, setDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const hidden = useHideOnScroll();
  const pathname = usePathname();

  return (
    <header
      className={cx(
        "sticky top-0 z-50 border-b backdrop-blur-md transition-transform duration-300 ease-in-out",
        hidden && !menuOpen ? "-translate-y-full" : "translate-y-0",
        dark ? "bg-slate-950/90 border-slate-800" : "bg-white/90 border-slate-200"
      )}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0 rounded-lg">
            <BatchLogo imgClass="h-9" onDark={dark} />
            <div className="text-right">
              <div className={cx("font-extrabold text-sm leading-none font-display", dark ? "text-white" : "text-slate-900")}>بوابة دفعة 32</div>
              <div className={cx("text-xs mt-0.5 hidden sm:block", dark ? "text-slate-500" : "text-slate-400")}>علوم الحاسوب وتقانة المعلومات</div>
            </div>
          </Link>

          <nav className="hidden lg:flex items-center gap-0.5" aria-label="التنقل الرئيسي">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                aria-current={pathname === item.href ? "page" : undefined}
                className={cx(
                  "px-3 py-2 rounded-lg text-sm font-semibold transition-colors",
                  pathname === item.href
                    ? dark
                      ? "bg-blue-500/15 text-blue-300"
                      : "bg-blue-50 text-blue-700"
                    : dark
                      ? "text-slate-400 hover:text-white hover:bg-slate-900"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-1 sm:gap-1.5">
            <Link
              href="/subjects"
              className="hidden sm:inline-flex items-center px-4 py-2 rounded-lg text-sm font-bold bg-blue-600 hover:bg-blue-700 active:scale-95 text-white transition-all"
            >
              تصفّح المواد
            </Link>
            <button
              onClick={() => setMenuOpen((m) => !m)}
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={menuOpen}
              className={cx("p-2 rounded-lg", dark ? "text-slate-300 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-100")}
            >
              {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {menuOpen && (
        <div className={cx("border-t px-4 py-3", dark ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200")}>
          <div className="flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={pathname === item.href ? "page" : undefined}
                  className={cx(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors",
                    pathname === item.href ? (dark ? "bg-blue-500/15 text-blue-300" : "bg-blue-50 text-blue-700") : dark ? "text-slate-300 hover:bg-slate-900" : "text-slate-600 hover:bg-slate-100"
                  )}
                >
                  <Icon className="w-4.5 h-4.5" /> {item.label}
                </Link>
              );
            })}
            <button
              onClick={() => setDark((d) => !d)}
              className={cx("flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-semibold transition-colors mt-1 border-t pt-3.5", dark ? "text-slate-300 border-slate-800 hover:bg-slate-900" : "text-slate-600 border-slate-200 hover:bg-slate-100")}
            >
              {dark ? <Sun className="w-4.5 h-4.5" /> : <Moon className="w-4.5 h-4.5" />} {dark ? "الوضع النهاري" : "الوضع الليلي"}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
