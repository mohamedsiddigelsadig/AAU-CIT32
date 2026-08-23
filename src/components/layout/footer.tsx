import Link from "next/link";
import { Facebook, Instagram, Mail, Send, MessageCircle } from "lucide-react";
import { BatchLogo } from "@/components/ui/primitives";
import { createClient } from "@/lib/supabase/server";

const NAV_ITEMS = [
  { href: "/", label: "الرئيسية" },
  { href: "/news", label: "الأخبار" },
  { href: "/subjects", label: "المواد الدراسية" },
  { href: "/projects", label: "مشاريع الطلاب" },
  { href: "/gallery", label: "أرشيف الذكريات" },
  { href: "/committee", label: "اللجنة التنفيذية" },
  { href: "/contact", label: "تواصل معنا" },
];

export async function Footer() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  return (
    <footer className="bg-slate-950 text-slate-400">
      <div className="max-w-6xl mx-auto px-5 sm:px-8 py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <BatchLogo imgClass="h-11" onDark />
            <span className="font-extrabold text-white font-display">بوابة دفعة 32</span>
          </div>
          <p className="text-sm leading-relaxed"></p>
        </div>
        <div>
          <div className="text-white font-bold mb-3 text-sm font-tech">روابط سريعة</div>
          <div className="flex flex-col gap-2 text-sm">
            {NAV_ITEMS.map((i) => (
              <Link key={i.href} href={i.href} className="text-right hover:text-white transition-colors w-fit">
                {i.label}
              </Link>
            ))}
          </div>
        </div>
        <div>
          <div className="text-white font-bold mb-3 text-sm font-tech">تواصل معنا</div>
          <div className="flex flex-col gap-2.5 text-sm">
            {settings?.contact_facebook && (
              <a href={settings.contact_facebook} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Facebook className="w-4 h-4" /> فيسبوك الدفعة
              </a>
            )}
            {settings?.contact_instagram && (
              <a href={settings.contact_instagram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Instagram className="w-4 h-4" /> إنستغرام الدفعة
              </a>
            )}
            {settings?.contact_whatsapp && (
              <a href={`https://wa.me/${settings.contact_whatsapp}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <MessageCircle className="w-4 h-4" /> واتساب الدفعة
              </a>
            )}
            {settings?.contact_telegram && (
              <a href={settings.contact_telegram} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white transition-colors">
                <Send className="w-4 h-4" /> قناة تيليجرام
              </a>
            )}
            {settings?.contact_email && (
              <a href={`mailto:${settings.contact_email}`} className="flex items-center gap-2 hover:text-white transition-colors">
                <Mail className="w-4 h-4" /> {settings.contact_email}
              </a>
            )}
          </div>
        </div>
        <div>
          <div className="text-white font-bold mb-3 text-sm font-tech"></div>
          <div className="flex items-center gap-3 flex-wrap bg-white/5 rounded-xl p-3 w-fit">
            <img src="/logo-fcsit.png" alt="شعار كلية علوم الحاسوب وتقانة المعلومات" className="h-12 w-auto" />
            <img src="/logo-aau.png" alt="شعار جامعة الزعيم الأزهري" className="h-12 w-auto" />
          </div>
        </div>
      </div>
      <div className="border-t border-slate-900 py-5 text-center text-xs text-slate-600 font-tech">
        © {new Date().getFullYear()} بوابة دفعة 32 — كلية علوم الحاسوب وتقانة المعلومات، جامعة الزعيم الأزهري
      </div>
    </footer>
  );
}
