"use client";

import { useMemo, useState } from "react";
import { ChevronDown, FileText, Link as LinkIcon, ClipboardList, Download, Search, BookOpen } from "lucide-react";
import { cx, fmtDate } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { EmptyState } from "@/components/ui/primitives";
import { getPortalFileUrl } from "@/lib/supabase/storage";
import type { SubjectRow, SubjectFileRow, SubjectLinkRow, SubjectAssignmentRow, SummaryRow } from "@/types/database";

const SEMESTERS = ["الأول", "الثاني", "الثالث", "الرابع", "الخامس", "السادس", "السابع", "الثامن"];

function fileHref(item: { storage_path: string | null; external_url: string | null }) {
  if (item.storage_path) return getPortalFileUrl(item.storage_path);
  return item.external_url ?? "#";
}

type SubjectWithContent = SubjectRow & {
  subject_files: SubjectFileRow[];
  subject_links: SubjectLinkRow[];
  subject_assignments: SubjectAssignmentRow[];
};

export function SubjectsBrowser({ subjects, summaries }: { subjects: SubjectWithContent[]; summaries: SummaryRow[] }) {
  const { dark } = useTheme();
  const [view, setView] = useState<"subjects" | "summaries">("subjects");
  const presentSemesters = useMemo(() => {
    const set = new Set(subjects.map((s) => s.semester));
    return SEMESTERS.filter((s) => set.has(s));
  }, [subjects]);
  const [sem, setSem] = useState(presentSemesters[0] ?? SEMESTERS[0]);
  const filtered = subjects.filter((s) => s.semester === sem);

  return (
    <div>
      <div className={cx("inline-flex p-1 rounded-xl mb-8", dark ? "bg-slate-900" : "bg-slate-100")}>
        <button
          onClick={() => setView("subjects")}
          className={cx("px-4 py-2 rounded-lg text-sm font-bold transition-colors", view === "subjects" ? (dark ? "bg-slate-800 text-white" : "bg-white text-slate-900 shadow-sm") : dark ? "text-slate-400" : "text-slate-500")}
        >
          المواد
        </button>
        <button
          onClick={() => setView("summaries")}
          className={cx("px-4 py-2 rounded-lg text-sm font-bold transition-colors", view === "summaries" ? (dark ? "bg-slate-800 text-white" : "bg-white text-slate-900 shadow-sm") : dark ? "text-slate-400" : "text-slate-500")}
        >
          الملخصات
        </button>
      </div>

      {view === "subjects" ? (
        <>
          <div className="flex flex-wrap gap-2 mb-8">
            {(presentSemesters.length ? presentSemesters : SEMESTERS).map((s) => (
              <button
                key={s}
                onClick={() => setSem(s)}
                className={cx(
                  "px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors",
                  sem === s
                    ? dark
                      ? "bg-blue-500/15 border-blue-500/40 text-blue-300"
                      : "bg-blue-50 border-blue-200 text-blue-700"
                    : dark
                      ? "border-slate-800 text-slate-400 hover:border-slate-700"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                )}
              >
                {s}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon={BookOpen} title="لا توجد مواد في هذا الفصل بعد" />
          ) : (
            <div className="flex flex-col gap-4">
              {filtered.map((s) => (
                <SubjectCard key={s.id} subject={s} summaries={summaries.filter((sm) => sm.subject_id === s.id)} />
              ))}
            </div>
          )}
        </>
      ) : (
        <SummariesSearch summaries={summaries} subjects={subjects} />
      )}
    </div>
  );
}

function SubjectCard({ subject, summaries }: { subject: SubjectWithContent; summaries: SummaryRow[] }) {
  const { dark } = useTheme();
  const [open, setOpen] = useState(false);
  const totalItems = subject.subject_files.length + subject.subject_links.length + subject.subject_assignments.length + summaries.length;

  return (
    <div className={cx("rounded-2xl border overflow-hidden", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center gap-3 p-4 text-right">
        <div className={cx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", dark ? "bg-blue-500/10 text-blue-300" : "bg-blue-50 text-blue-700")}>
          <BookOpen className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className={cx("font-bold text-sm truncate", dark ? "text-white" : "text-slate-900")}>{subject.name}</div>
          <div className={cx("text-xs mt-0.5 truncate", dark ? "text-slate-400" : "text-slate-500")}>{subject.doctor}</div>
        </div>
        <span className={cx("text-xs shrink-0", dark ? "text-slate-500" : "text-slate-400")}>{totalItems} عنصر</span>
        <ChevronDown className={cx("w-4 h-4 shrink-0 transition-transform", open && "rotate-180", dark ? "text-slate-500" : "text-slate-400")} />
      </button>

      {open && (
        <div className={cx("px-4 pb-4 border-t", dark ? "border-slate-800" : "border-slate-100")}>
          {subject.description && <p className={cx("text-sm mt-3 mb-4", dark ? "text-slate-400" : "text-slate-500")}>{subject.description}</p>}

          {subject.subject_files.length > 0 && (
            <SubList title="الملفات" icon={FileText}>
              {subject.subject_files.map((f) => (
                <a key={f.id} href={fileHref(f)} target="_blank" rel="noreferrer" className={cx("flex items-center gap-2.5 py-2 text-sm", dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900")}>
                  <Download className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{f.name}</span>
                </a>
              ))}
            </SubList>
          )}

          {summaries.length > 0 && (
            <SubList title="الملخصات" icon={FileText}>
              {summaries.map((sm) => (
                <a
                  key={sm.id}
                  href={sm.storage_path || sm.external_url ? fileHref(sm) : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className={cx("flex items-center gap-2.5 py-2 text-sm", dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900")}
                >
                  <Download className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{sm.title}</span>
                </a>
              ))}
            </SubList>
          )}

          {subject.subject_links.length > 0 && (
            <SubList title="روابط" icon={LinkIcon}>
              {subject.subject_links.map((l) => (
                <a key={l.id} href={l.url} target="_blank" rel="noreferrer" className={cx("flex items-center gap-2.5 py-2 text-sm", dark ? "text-slate-300 hover:text-white" : "text-slate-600 hover:text-slate-900")}>
                  <LinkIcon className="w-3.5 h-3.5 shrink-0" /> <span className="truncate">{l.title}</span>
                </a>
              ))}
            </SubList>
          )}

          {subject.subject_assignments.length > 0 && (
            <SubList title="الواجبات" icon={ClipboardList}>
              {subject.subject_assignments.map((a) => (
                <div key={a.id} className={cx("flex items-center justify-between py-2 text-sm", dark ? "text-slate-300" : "text-slate-600")}>
                  <span className="truncate">{a.title}</span>
                  {a.due_date && <span className={cx("text-xs shrink-0 mr-2", dark ? "text-slate-500" : "text-slate-400")}>{fmtDate(a.due_date)}</span>}
                </div>
              ))}
            </SubList>
          )}
        </div>
      )}
    </div>
  );
}

function SubList({ title, icon: Icon, children }: { title: string; icon: typeof FileText; children: React.ReactNode }) {
  const { dark } = useTheme();
  return (
    <div className="mt-3">
      <div className={cx("flex items-center gap-1.5 text-xs font-bold mb-1", dark ? "text-slate-500" : "text-slate-400")}>
        <Icon className="w-3.5 h-3.5" /> {title}
      </div>
      <div className="flex flex-col">{children}</div>
    </div>
  );
}

function SummariesSearch({ summaries, subjects }: { summaries: SummaryRow[]; subjects: SubjectRow[] }) {
  const { dark } = useTheme();
  const [q, setQ] = useState("");
  const [subjFilter, setSubjFilter] = useState("all");
  const subjectMap = useMemo(() => Object.fromEntries(subjects.map((s) => [s.id, s])), [subjects]);

  const filtered = summaries.filter((sm) => {
    const matchQ = sm.title.toLowerCase().includes(q.toLowerCase());
    const matchSubj = subjFilter === "all" || sm.subject_id === subjFilter;
    return matchQ && matchSubj;
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div className={cx("flex-1 flex items-center gap-2 px-4 py-2.5 rounded-xl border", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
          <Search className={cx("w-4 h-4 shrink-0", dark ? "text-slate-500" : "text-slate-400")} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ابحث داخل الملخصات..." className={cx("w-full bg-transparent outline-none text-sm", dark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400")} />
        </div>
        <select value={subjFilter} onChange={(e) => setSubjFilter(e.target.value)} className={cx("px-4 py-2.5 rounded-xl border text-sm font-semibold outline-none", dark ? "bg-slate-900 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600")}>
          <option value="all">كل المواد</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      {filtered.length === 0 ? (
        <EmptyState icon={Search} title="لا توجد نتائج مطابقة" />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((sm) => (
            <div key={sm.id} className={cx("flex items-center gap-4 p-4 rounded-xl border", dark ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200")}>
              <div className={cx("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", dark ? "bg-emerald-500/10 text-emerald-400" : "bg-emerald-50 text-emerald-600")}>
                <FileText className="w-5 h-5" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={cx("font-bold text-sm truncate", dark ? "text-white" : "text-slate-900")}>{sm.title}</div>
                <div className={cx("text-xs mt-0.5 flex items-center gap-1.5", dark ? "text-slate-500" : "text-slate-400")}>
                  <span className="truncate">{subjectMap[sm.subject_id]?.name || "—"}</span>
                  <span>·</span>
                  <span>{sm.file_type}</span>
                </div>
              </div>
              {sm.storage_path || sm.external_url ? (
                <a href={fileHref(sm)} target="_blank" rel="noreferrer" className={cx("shrink-0 p-2 rounded-lg transition-colors", dark ? "hover:bg-slate-800 text-blue-400" : "hover:bg-slate-100 text-blue-600")}>
                  <Download className="w-5 h-5" />
                </a>
              ) : (
                <Download className="w-5 h-5 text-slate-600 shrink-0" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
