-- =========================================================================
-- بوابة دفعة 32 — roles & permissions
-- Adds three tiers: super_admin (full access — الأمين العام / رئيس الدفعة),
-- committee_head (scoped to whichever sections they're granted), and the
-- default student (no dashboard access). Run this after 0001_init.sql.
-- =========================================================================

-- ---------- extend profiles ----------
alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles
  alter column role set default 'student',
  add constraint profiles_role_check check (role in ('super_admin', 'committee_head', 'student'));

alter table public.profiles
  add column if not exists permissions text[] not null default '{}';

-- Recreate the new-user trigger's default as 'student' explicitly (no
-- change in behavior, just keeping this migration self-contained/idempotent).

-- ---------- permission helper functions ----------
-- Any signed-in staff member (either tier) — used to gate entry to
-- /admin at all, both in middleware and in the layout's server check.
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('super_admin', 'committee_head')
  );
$$ language sql security definer stable;

create or replace function public.is_super_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  );
$$ language sql security definer stable;

-- Section-level check: super_admin always passes; committee_head passes
-- only if `perm` is in their granted permissions array.
create or replace function public.has_permission(perm text)
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
    and (
      role = 'super_admin'
      or (role = 'committee_head' and perm = any(permissions))
    )
  );
$$ language sql security definer stable;

-- =========================================================================
-- Re-scope write policies per section instead of one blanket "any admin"
-- check. Table -> permission key:
--   news, news_images          -> 'news'
--   events                     -> 'events'
--   subjects + its 3 detail
--   tables, summaries          -> 'subjects'
--   projects                   -> 'projects'
--   albums, photos             -> 'gallery'
--   committee_members          -> 'committee'
--   site_settings               -> super_admin only (whole-site scope)
-- =========================================================================
do $$
declare
  mapping jsonb := '{
    "news": "news", "news_images": "news",
    "events": "events",
    "subjects": "subjects", "subject_files": "subjects",
    "subject_links": "subjects", "subject_assignments": "subjects",
    "summaries": "subjects",
    "projects": "projects",
    "albums": "gallery", "photos": "gallery",
    "committee_members": "committee"
  }';
  t text;
  perm text;
begin
  for t, perm in select * from jsonb_each_text(mapping)
  loop
    execute format('drop policy if exists "admin write" on public.%I;', t);
    execute format(
      'create policy "admin write" on public.%I for all using (public.has_permission(%L)) with check (public.has_permission(%L));',
      t, perm, perm
    );
  end loop;
end $$;

-- site_settings stays super-admin-only (contact info / whole-site config).
drop policy if exists "admin write" on public.site_settings;
create policy "admin write" on public.site_settings
  for all using (public.is_super_admin()) with check (public.is_super_admin());

-- profiles: a super_admin can also update other profiles (needed to set
-- role/permissions when adding a team member); everyone can still read
-- their own row, and any staff member can list the team.
drop policy if exists "read own or admin" on public.profiles;
create policy "read own or admin" on public.profiles
  for select using (auth.uid() = id or public.is_admin());

drop policy if exists "super admin manage profiles" on public.profiles;
create policy "super admin manage profiles" on public.profiles
  for update using (public.is_super_admin()) with check (public.is_super_admin());

-- =========================================================================
-- One-time manual step (not run by this file): promote your own account.
-- Find your row in Table Editor -> profiles and set role = 'super_admin'.
-- Every account created after that through the in-app "الفريق" page gets
-- its role/permissions set automatically when you create it.
-- =========================================================================
