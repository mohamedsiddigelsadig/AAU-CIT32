"use client";
import React from 'react';


import { Terminal, ImageIcon, Loader2, type LucideIcon } from "lucide-react";
import { cx } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";

export function Eyebrow({
  children,
  icon: Icon = Terminal,
  tone = "blue",
}: {
  children: React.ReactNode;
  icon?: LucideIcon;
  tone?: "blue" | "amber" | "emerald";
}) {
  const { dark } = useTheme();
  const tones = {
    blue: dark ? "text-blue-300" : "text-blue-700",
    amber: dark ? "text-amber-300" : "text-amber-700",
    emerald: dark ? "text-emerald-300" : "text-emerald-700",
  };
  return (
    <div className={cx("inline-flex items-center gap-2 text-xs tracking-wide mb-3 font-tech", tones[tone])}>
      {React.isValidElement(Icon) ? Icon : Icon ? <Icon className="w-3.5 h-3.5" /> : null}
      <span>{children}</span>
    </div>
  );
}

export function SectionHeading({
  eyebrow,
  icon,
  title,
  subtitle,
  tone,
  align = "start",
}: {
  eyebrow: string;
  icon?: LucideIcon;
  title: string;
  subtitle?: string;
  tone?: "blue" | "amber" | "emerald";
  align?: "start" | "center";
}) {
  const { dark } = useTheme();
  return (
    <div className={cx("mb-8 md:mb-10", align === "center" ? "text-center" : "text-right")}>
      <div className={align === "center" ? "flex justify-center" : ""}>
        <Eyebrow icon={icon} tone={tone}>
          {eyebrow}
        </Eyebrow>
      </div>
      <h2
        className={cx(
          "text-2xl sm:text-3xl md:text-4xl font-extrabold leading-tight font-display",
          dark ? "text-white" : "text-slate-900"
        )}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          className={cx(
            "mt-3 max-w-2xl text-sm sm:text-base",
            align === "center" ? "mx-auto" : "",
            dark ? "text-slate-400" : "text-slate-500"
          )}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
}

export function Badge({
  children,
  tone = "slate",
  className = "",
}: {
  children: React.ReactNode;
  tone?: "slate" | "blue" | "amber" | "emerald";
  className?: string;
}) {
  const { dark } = useTheme();
  const tones = {
    slate: dark ? "bg-slate-800 text-slate-300 border-slate-700" : "bg-slate-100 text-slate-600 border-slate-200",
    blue: dark ? "bg-blue-500/10 text-blue-300 border-blue-500/30" : "bg-blue-50 text-blue-700 border-blue-200",
    amber: dark ? "bg-amber-500/10 text-amber-300 border-amber-500/30" : "bg-amber-50 text-amber-700 border-amber-200",
    emerald: dark ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/30" : "bg-emerald-50 text-emerald-700 border-emerald-200",
  };
  return (
    <span className={cx("inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border font-tech", tones[tone], className)}>
      {children}
    </span>
  );
}

export function PlaceholderArt({
  tone = "blue",
  Icon = ImageIcon,
  className = "",
}: {
  tone?: "blue" | "amber" | "emerald";
  Icon?: LucideIcon;
  className?: string;
}) {
  const solid = { blue: "bg-blue-700", amber: "bg-amber-600", emerald: "bg-emerald-700" }[tone];
  return (
    <div className={cx("w-full h-full flex items-center justify-center", solid, className)}>
      <Icon className="w-8 h-8 text-white/70" strokeWidth={1.5} />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
}) {
  const { dark } = useTheme();
  return (
    <div className={cx("text-center py-14 px-6 rounded-2xl border-2 border-dashed", dark ? "border-slate-800 text-slate-400" : "border-slate-200 text-slate-500")}>
      {React.isValidElement(Icon) ? Icon : Icon ? <Icon className="w-8 h-8 mx-auto mb-3 opacity-50" /> : null}
      <p className={cx("font-bold mb-1 font-display", dark ? "text-slate-200" : "text-slate-700")}>{title}</p>
      {subtitle && <p className="text-sm">{subtitle}</p>}
    </div>
  );
}

export function Spinner() {
  const { dark } = useTheme();
  return (
    <div className="flex items-center justify-center py-24">
      <Loader2 className={cx("w-7 h-7 animate-spin", dark ? "text-blue-400" : "text-blue-600")} />
    </div>
  );
}

export function BatchLogo({ imgClass = "h-9", onDark = false }: { imgClass?: string; onDark?: boolean }) {
  // The logo's "3" is dark navy — legible on light surfaces, but nearly
  // invisible directly on a dark background. A small white backdrop chip
  // keeps the real logo colors intact while staying readable in dark
  // contexts (the navbar in dark mode, and the footer, which is always
  // dark regardless of site theme).
  if (onDark) {
    return (
      <span className={cx("inline-flex items-center justify-center bg-white rounded-lg p-1", imgClass)}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-batch32.png" alt="شعار الدفعة" className="h-full w-auto block" />
      </span>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/logo-batch32.png" alt="شعار الدفعة" className={cx(imgClass, "w-auto block")} />;
}
