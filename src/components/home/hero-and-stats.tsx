"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { Eyebrow } from "@/components/ui/primitives";

function useCountUp(target: number, active: boolean, duration = 900) {
  const [val, setVal] = useState(0);
  const fromRef = useRef(0);
  useEffect(() => {
    if (!active || fromRef.current === target) return;
    const from = fromRef.current;
    let raf: number, startTs: number;
    const tick = (ts: number) => {
      if (!startTs) startTs = ts;
      const p = Math.min((ts - startTs) / duration, 1);
      setVal(Math.round(from + (target - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = target;
    };
    raf = requestAnimationFrame(tick);
    return () => raf && cancelAnimationFrame(raf);
  }, [target, active, duration]);
  return val;
}

function useRipple() {
  const ref = useRef<HTMLElement | null>(null);
  const createRipple = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height) * 2;
    const span = document.createElement("span");
    Object.assign(span.style, {
      position: "absolute",
      borderRadius: "9999px",
      background: "rgba(255,255,255,0.5)",
      width: `${size}px`,
      height: `${size}px`,
      left: `${e.clientX - rect.left - size / 2}px`,
      top: `${e.clientY - rect.top - size / 2}px`,
      pointerEvents: "none",
      transform: "scale(0)",
      transition: "transform 600ms ease, opacity 600ms ease",
      opacity: "1",
    });
    el.appendChild(span);
    requestAnimationFrame(() => {
      span.style.transform = "scale(1)";
      span.style.opacity = "0";
    });
    setTimeout(() => span.remove(), 650);
  };
  return [ref, createRipple] as const;
}

function HeroButton({ href, tone, children }: { href: string; tone: "primary" | "ghost" | "ghostLight"; children: React.ReactNode }) {
  const [ref, ripple] = useRipple();
  const cls =
    tone === "primary"
      ? "bg-amber-500 hover:bg-amber-400 text-slate-950 hover:shadow-lg hover:shadow-amber-500/30"
      : tone === "ghostLight"
        ? "bg-slate-900/5 hover:bg-slate-900/10 border border-slate-300 text-slate-900"
        : "bg-white/10 hover:bg-white/20 border border-white/20 text-white backdrop-blur";
  return (
    <Link
      href={href}
      ref={ref as React.Ref<HTMLAnchorElement>}
      onClick={ripple}
      className={cx("relative overflow-hidden w-full sm:w-52 py-3 rounded-2xl font-bold text-center transition-all hover:-translate-y-0.5 active:scale-95", cls)}
    >
      {children}
    </Link>
  );
}

function StatItem({ label, value, active }: { label: string; value: number; active: boolean }) {
  const displayVal = useCountUp(value, active);
  return (
    <div className="text-center">
      <div className="text-4xl sm:text-5xl font-black text-white tabular-nums font-display">{displayVal}</div>
      <div className="text-sm text-slate-400 mt-1.5">{label}</div>
    </div>
  );
}

export function HeroAndStats({ studentsCount }: { studentsCount: number }) {
  const { dark } = useTheme();
  const [statsReady, setStatsReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setStatsReady(true), 150);
    return () => clearTimeout(t);
  }, []);

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          background: dark
            ? "linear-gradient(180deg, #050816 0%, #0b1224 55%, #0f1b3d 100%)"
            : "linear-gradient(180deg, #ffffff 0%, #f8fafc 55%, #eff6ff 100%)",
        }}
      >
        <div className={cx("absolute -top-20 -right-16 w-72 h-72 rounded-full blur-3xl pointer-events-none", dark ? "bg-blue-600/25" : "bg-blue-200/50")} />
        <div className={cx("absolute -bottom-28 -left-20 w-80 h-80 rounded-full blur-3xl pointer-events-none", dark ? "bg-indigo-600/20" : "bg-indigo-200/40")} />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(${dark ? "#60a5fa" : "#1e293b"} 1px, transparent 1px), linear-gradient(90deg, ${dark ? "#60a5fa" : "#1e293b"} 1px, transparent 1px)`,
            backgroundSize: "44px 44px",
            opacity: dark ? 0.06 : 0.04,
          }}
        />
        <div className="relative max-w-5xl mx-auto px-5 sm:px-8 py-16 sm:py-24 text-center">
          <div className="flex justify-center">
            <Eyebrow icon={Terminal} tone="blue">
              جامعة الزعيم الأزهري
            </Eyebrow>
          </div>
          <h1 className={cx("text-5xl sm:text-7xl md:text-8xl font-black leading-none mb-3 font-display", dark ? "text-white" : "text-slate-900")}>دفعة 32</h1>
          <p className={cx("text-lg sm:text-2xl font-bold mb-5 font-display", dark ? "text-blue-200" : "text-blue-700")}>كلية علوم الحاسوب وتقانة المعلومات</p>
          <p className={cx("text-base sm:text-lg max-w-2xl mx-auto mb-9 leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}> علوم حاسوب ,تقنية معلومات و نظم معلومات
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <HeroButton href="/news" tone="primary">
              📰 آخر الأخبار
            </HeroButton>
            <HeroButton href="/subjects" tone={dark ? "ghost" : "ghostLight"}>
              📚 المواد الدراسية
            </HeroButton>
          </div>
        </div>
      </section>

      <section className={cx("border-b", dark ? "bg-slate-950 border-slate-900" : "bg-white border-slate-100")}>
        <div className="max-w-5xl mx-auto px-5 sm:px-8 py-9 flex justify-center">
          <StatItem label="طالبًا مسجّلًا في الدفعة" value={studentsCount} active={statsReady} />
        </div>
      </section>
    </>
  );
}
