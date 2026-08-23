-- =========================================================================
-- بوابة دفعة 32 — تثبيت/تمييز عناصر لعرضها في الواجهة الرئيسية
-- نفس فكرة "pinned" في الأخبار، لكن لمشاريع الطلاب وألبومات أرشيف الذكريات.
-- =========================================================================

alter table public.projects
  add column if not exists featured boolean not null default false;

alter table public.albums
  add column if not exists featured boolean not null default false;
