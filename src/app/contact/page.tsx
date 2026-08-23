import { Mail, Facebook, Instagram, MessageCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { SectionHeading } from "@/components/ui/primitives";

export const metadata = { title: "تواصل معنا — بوابة دفعة 32" };

export default async function ContactPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", 1).single();

  const links = [
    settings?.contact_email && { icon: Mail, label: settings.contact_email, href: `mailto:${settings.contact_email}`, tone: "blue" as const },
    settings?.contact_facebook && { icon: Facebook, label: "فيسبوك الدفعة", href: settings.contact_facebook, tone: "blue" as const },
    settings?.contact_instagram && { icon: Instagram, label: "إنستغرام الدفعة", href: settings.contact_instagram, tone: "amber" as const },
    settings?.contact_whatsapp && { icon: MessageCircle, label: "واتساب الدفعة", href: `https://wa.me/${settings.contact_whatsapp}`, tone: "emerald" as const },
    settings?.contact_telegram && { icon: Send, label: "قناة تيليجرام", href: settings.contact_telegram, tone: "blue" as const },
  ].filter(Boolean) as { icon: typeof Mail; label: string; href: string; tone: "blue" | "amber" | "emerald" }[];

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950">
      <Navbar />
      <main id="main-content" className="max-w-2xl mx-auto px-5 sm:px-8 py-14 sm:py-16">
        <SectionHeading eyebrow="نسعد بتواصلكم" icon={<Mail />} title="تواصل معنا" subtitle="لأي استفسار أو اقتراح يخص الدفعة، تقدر توصلنا من أي من القنوات دي." align="center" />
        {links.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400">لسه ما تم إضافة وسائل تواصل — تابعونا قريبًا.</p>
        ) : (
          <div className="flex flex-col gap-3 mt-8">
            {links.map((l) => {
              const Icon = l.icon;
              const toneCls = {
                blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300",
                amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300",
                emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
              }[l.tone];
              return (
                <a
                  key={l.label}
                  href={l.href}
                  target={l.href.startsWith("http") ? "_blank" : undefined}
                  rel="noreferrer"
                  className="flex items-center gap-4 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-300 dark:hover:border-blue-700/60 transition-colors"
                >
                  <span className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${toneCls}`}>
                    <Icon className="w-5 h-5" />
                  </span>
                  <span className="font-bold text-sm text-slate-900 dark:text-white">{l.label}</span>
                </a>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
