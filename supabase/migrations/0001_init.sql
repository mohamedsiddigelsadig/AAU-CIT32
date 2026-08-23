-- =========================================================================
-- بوابة دفعة 32 — initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push`) once,
-- against a fresh project. Safe to re-run: every statement is idempotent.
-- =========================================================================

-- ---------- extensions ----------
create extension if not exists "pgcrypto"; -- for gen_random_uuid()

-- ---------- profiles (links auth.users to an app role) ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role text not null default 'student' check (role in ('admin', 'student')),
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever someone signs up (defaults to
-- 'student' — promote to 'admin' manually in the Supabase table editor
-- for whichever account(s) should manage the site).
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper used throughout the RLS policies below.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- ---------- news ----------
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  excerpt text not null default '',
  content text not null default '',
  category text not null default 'عام',
  pinned boolean not null default false,
  published_at date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.news_images (
  id uuid primary key default gen_random_uuid(),
  news_id uuid not null references public.news(id) on delete cascade,
  storage_path text not null,
  position int not null default 0
);

-- ---------- academic calendar ----------
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  type text not null check (type in ('exam', 'semester', 'activity')),
  event_date date not null,
  created_at timestamptz not null default now()
);

-- ---------- subjects ----------
create table if not exists public.subjects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  doctor text not null default '',
  description text not null default '',
  semester text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.subject_files (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  name text not null,
  storage_path text not null,
  file_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create table if not exists public.subject_links (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  url text not null
);

create table if not exists public.subject_assignments (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  due_date date
);

-- ---------- summaries (belong to a subject) ----------
create table if not exists public.summaries (
  id uuid primary key default gen_random_uuid(),
  subject_id uuid not null references public.subjects(id) on delete cascade,
  title text not null,
  file_type text not null default 'PDF',
  storage_path text,
  created_at timestamptz not null default now()
);

-- ---------- student projects ----------
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text not null default '',
  team text,
  link text,
  storage_path text,
  created_at timestamptz not null default now()
);

-- ---------- gallery ----------
create table if not exists public.albums (
  id uuid primary key default gen_random_uuid(),
  year text not null,
  title text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.photos (
  id uuid primary key default gen_random_uuid(),
  album_id uuid not null references public.albums(id) on delete cascade,
  storage_path text not null,
  created_at timestamptz not null default now()
);

-- ---------- committee ----------
create table if not exists public.committee_members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  role text not null,
  group_name text not null default 'اللجان',
  sort_order int not null default 0
);

-- ---------- site-wide settings (single row) ----------
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1), -- singleton row
  students_count int not null default 0,
  contact_email text,
  contact_facebook text,
  contact_instagram text,
  contact_whatsapp text,
  contact_telegram text,
  updated_at timestamptz not null default now()
);
insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- =========================================================================
-- Row Level Security — every content table is publicly readable (this is
-- a public portal) and writable only by an authenticated admin profile.
-- =========================================================================
do $$
declare
  t text;
begin
  for t in select unnest(array[
    'news', 'news_images', 'events', 'subjects', 'subject_files',
    'subject_links', 'subject_assignments', 'summaries', 'projects',
    'albums', 'photos', 'committee_members', 'site_settings'
  ])
  loop
    execute format('alter table public.%I enable row level security;', t);

    execute format('drop policy if exists "public read" on public.%I;', t);
    execute format(
      'create policy "public read" on public.%I for select using (true);', t
    );

    execute format('drop policy if exists "admin write" on public.%I;', t);
    execute format(
      'create policy "admin write" on public.%I for all using (public.is_admin()) with check (public.is_admin());', t
    );
  end loop;
end $$;

-- profiles: users can read their own profile; admins can read all.
alter table public.profiles enable row level security;
drop policy if exists "read own or admin" on public.profiles;
create policy "read own or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

-- =========================================================================
-- Storage buckets — run once. Files are public-read (it's a public site),
-- upload/delete restricted to admins via the storage policies below.
-- =========================================================================
insert into storage.buckets (id, name, public)
values ('portal-files', 'portal-files', true)
on conflict (id) do nothing;

drop policy if exists "portal-files public read" on storage.objects;
create policy "portal-files public read" on storage.objects
  for select using (bucket_id = 'portal-files');

drop policy if exists "portal-files admin write" on storage.objects;
create policy "portal-files admin write" on storage.objects
  for insert with check (bucket_id = 'portal-files' and public.is_admin());

drop policy if exists "portal-files admin update" on storage.objects;
create policy "portal-files admin update" on storage.objects
  for update using (bucket_id = 'portal-files' and public.is_admin());

drop policy if exists "portal-files admin delete" on storage.objects;
create policy "portal-files admin delete" on storage.objects
  for delete using (bucket_id = 'portal-files' and public.is_admin());

-- =========================================================================
-- Seed data — same starting content as the prototype, safe to delete/edit
-- from the admin dashboard once the site is live.
-- =========================================================================
insert into public.news (title, excerpt, content, category, pinned, published_at) values
  ('انطلاق التسجيل في معرض مشاريع التخرج 2026', 'تعلن الكلية عن فتح باب التسجيل لمعرض مشاريع التخرج السنوي.', 'تعلن كلية علوم الحاسوب وتقانة المعلومات عن فتح باب التسجيل في معرض مشاريع التخرج السنوي لهذا العام. يُرجى من جميع الطلاب المشاركين تجهيز ملخص المشروع وتسليمه عبر منسق الدفعة قبل الموعد النهائي.', 'أكاديمي', true, '2026-07-14'),
  ('جدول امتحانات نهاية الفصل الدراسي', 'تم اعتماد الجدول النهائي لامتحانات نهاية الفصل.', 'اعتمدت إدارة الكلية الجدول النهائي لامتحانات نهاية الفصل الدراسي. يمكن لجميع الطلاب الاطلاع على مواعيد كل مادة من قسم «التقويم الأكاديمي».', 'امتحانات', true, '2026-07-10')
on conflict do nothing;

insert into public.events (title, type, event_date) values
  ('بداية الفصل الدراسي الثاني', 'semester', '2026-02-01'),
  ('امتحانات منتصف الفصل', 'exam', '2026-04-12'),
  ('امتحانات نهاية الفصل', 'exam', '2026-08-02'),
  ('معرض مشاريع التخرج', 'activity', '2026-08-20')
on conflict do nothing;

insert into public.site_settings (id, students_count, contact_email)
values (1, 186, 'batch32.fcsit@gmail.com')
on conflict (id) do update set students_count = excluded.students_count;
