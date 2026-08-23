// Hand-written to match supabase/migrations/0001_init.sql.
// Once the project is running locally, regenerate/verify with:
//   npx supabase gen types typescript --project-id <ref> > src/types/database.ts

export type EventType = "exam" | "semester" | "activity";
export type ProfileRole = "super_admin" | "committee_head" | "student";

export interface Profile {
  id: string;
  full_name: string | null;
  role: ProfileRole;
  permissions: string[];
  created_at: string;
}

export interface NewsRow {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  pinned: boolean;
  published_at: string;
  created_at: string;
}
export interface NewsImageRow {
  id: string;
  news_id: string;
  storage_path: string;
  position: number;
}

export interface EventRow {
  id: string;
  title: string;
  type: EventType;
  event_date: string;
  created_at: string;
}

export interface SubjectRow {
  id: string;
  name: string;
  doctor: string;
  description: string;
  semester: string;
  created_at: string;
}
export interface SubjectFileRow {
  id: string;
  subject_id: string;
  name: string;
  storage_path: string | null;
  external_url: string | null;
  file_type: string | null;
  size_bytes: number | null;
  created_at: string;
}
export interface SubjectLinkRow {
  id: string;
  subject_id: string;
  title: string;
  url: string;
}
export interface SubjectAssignmentRow {
  id: string;
  subject_id: string;
  title: string;
  due_date: string | null;
}

export interface SummaryRow {
  id: string;
  subject_id: string;
  title: string;
  file_type: string;
  storage_path: string | null;
  external_url: string | null;
  created_at: string;
}

export interface ProjectRow {
  id: string;
  title: string;
  description: string;
  team: string | null;
  link: string | null;
  storage_path: string | null;
  featured: boolean;
  created_at: string;
}

export interface AlbumRow {
  id: string;
  year: string;
  title: string;
  featured: boolean;
  created_at: string;
}
export interface PhotoRow {
  id: string;
  album_id: string;
  storage_path: string;
  created_at: string;
}

export interface CommitteeMemberRow {
  id: string;
  name: string;
  role: string;
  group_name: string;
  sort_order: number;
}

export interface SiteSettingsRow {
  id: number;
  students_count: number;
  contact_email: string | null;
  contact_facebook: string | null;
  contact_instagram: string | null;
  contact_whatsapp: string | null;
  contact_telegram: string | null;
  updated_at: string;
}

// Minimal Database type so `@supabase/ssr`'s generics are satisfied.
// Swap for the CLI-generated version once you can run it locally —
// this hand-written one covers every table but isn't as strict as the
// generated one about relationships/enums.
export interface Database {
  public: {
    Tables: {
      profiles: { Row: Profile; Insert: Partial<Profile>; Update: Partial<Profile> };
      news: { Row: NewsRow; Insert: Partial<NewsRow>; Update: Partial<NewsRow> };
      news_images: { Row: NewsImageRow; Insert: Partial<NewsImageRow>; Update: Partial<NewsImageRow> };
      events: { Row: EventRow; Insert: Partial<EventRow>; Update: Partial<EventRow> };
      subjects: { Row: SubjectRow; Insert: Partial<SubjectRow>; Update: Partial<SubjectRow> };
      subject_files: { Row: SubjectFileRow; Insert: Partial<SubjectFileRow>; Update: Partial<SubjectFileRow> };
      subject_links: { Row: SubjectLinkRow; Insert: Partial<SubjectLinkRow>; Update: Partial<SubjectLinkRow> };
      subject_assignments: { Row: SubjectAssignmentRow; Insert: Partial<SubjectAssignmentRow>; Update: Partial<SubjectAssignmentRow> };
      summaries: { Row: SummaryRow; Insert: Partial<SummaryRow>; Update: Partial<SummaryRow> };
      projects: { Row: ProjectRow; Insert: Partial<ProjectRow>; Update: Partial<ProjectRow> };
      albums: { Row: AlbumRow; Insert: Partial<AlbumRow>; Update: Partial<AlbumRow> };
      photos: { Row: PhotoRow; Insert: Partial<PhotoRow>; Update: Partial<PhotoRow> };
      committee_members: { Row: CommitteeMemberRow; Insert: Partial<CommitteeMemberRow>; Update: Partial<CommitteeMemberRow> };
      site_settings: { Row: SiteSettingsRow; Insert: Partial<SiteSettingsRow>; Update: Partial<SiteSettingsRow> };
    };
  };
}
