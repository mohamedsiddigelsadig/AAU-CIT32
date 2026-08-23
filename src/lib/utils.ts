import { clsx, type ClassValue } from "clsx";

export function cx(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function fmtDate(d: string) {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString("ar-EG-u-nu-latn", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export function fmtDateShort(d: string) {
  try {
    return new Date(`${d}T00:00:00`).toLocaleDateString("ar-EG-u-nu-latn", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return d;
  }
}

export function daysUntil(d: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(`${d}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return (parts[0]?.[0] ?? "") + (parts[1]?.[0] ?? "");
}
