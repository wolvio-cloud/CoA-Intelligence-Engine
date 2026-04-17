"use client";

import { useEffect, useState } from "react";
import { OverallStatus } from "@/components/results/OverallStatus";
import { SubmissionsTable } from "@/components/submissions/SubmissionsTable";
import { ResultTable } from "@/components/results/ResultTable";
import { ParameterDetail } from "@/components/results/ParameterDetail";
import { ExportButtons } from "@/components/export/ExportButtons";
import { useCoaResult } from "@/hooks/useCoaResult";
import { useAuth } from "@/context/AuthContext";
import { listSubmissions } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { CoaParameter, SubmissionSummary } from "@/lib/types";

type View = "list" | "detail";

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-700">No submissions yet</p>
      <p className="mt-1 text-xs text-slate-400">Submitted CoAs will appear here once processed</p>
    </div>
  );
}

function DetailView({
  submission,
  onBack,
}: {
  submission: SubmissionSummary;
  onBack: () => void;
}) {
  const [selectedParam, setSelectedParam] = useState<CoaParameter | null>(null);
  const { data, loading } = useCoaResult(submission.id, true);

  useEffect(() => {
    if (!data?.parameters?.length) return;
    setSelectedParam((prev) => {
      if (prev && data.parameters.some((p) => p.id === prev.id)) return prev;
      return data.parameters[0];
    });
  }, [data]);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white sm:text-sm"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
              <path d="M19 12H5M12 5l-7 7 7 7"/>
            </svg>
            Back to list
          </button>
          <div className="hidden h-9 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
          <div className="min-w-0 flex flex-col justify-center">
            {submission.header?.product_name || submission.header?.supplier_name ? (
              <>
                <p className="truncate text-sm font-semibold text-navy sm:text-base" title={submission.header.product_name ?? undefined}>
                  {submission.header.product_name || "Product Unknown"}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500" title={submission.header.supplier_name ?? undefined}>
                  {submission.header.supplier_name || "Supplier Unknown"}
                </p>
              </>
            ) : (
              <>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Submission review</p>
                <p className="truncate text-sm font-semibold text-navy sm:text-base" title={data?.filename ?? submission.filename}>
                  {loading ? "Loading…" : data?.filename ?? submission.filename}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {data ? <ExportButtons jobId={data.id} compact /> : null}
        </div>
      </header>

      {loading || !data ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p className="text-sm font-medium text-slate-500">Loading validation workspace…</p>
          </div>
        </div>
      ) : (
        <>
          <OverallStatus
            status={data.overall_status}
            productName={data.product_match.matched_product}
            filename={data.filename}
            submissionId={data.id}
            matchScore={data.product_match.match_score}
            statusSummary={data.status_summary}
            header={data.header}
          />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_min(100%,400px)] xl:items-start xl:gap-8">
            <ResultTable
              parameters={data.parameters}
              selectedId={selectedParam?.id ?? null}
              onSelect={setSelectedParam}
            />
            <div className="xl:sticky xl:top-4">
              <ParameterDetail param={selectedParam} onClose={() => setSelectedParam(null)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function RecentCoaPage({
  initialId,
  initialView = "list",
}: {
  initialId?: string;
  initialView?: View;
}) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<SubmissionSummary | null>(null);
  const [view, setView] = useState<View>(initialView);
  const [search, setSearch] = useState("");

  const router = useRouter();

  useEffect(() => {
    if (initialId && submissions.length > 0) {
      const match = submissions.find((s) => s.id === initialId);
      if (match) {
        setSelected(match);
        setView("detail");
      }
    }
  }, [initialId, submissions]);

  useEffect(() => {
    if (!user?.id) {
      setSubmissions([]);
      setLoadingList(false);
      return;
    }
    let cancelled = false;
    setLoadingList(true);
    listSubmissions()
      .then((items) => { if (!cancelled) setSubmissions(items); })
      .catch((err) => console.error("Failed to load submissions:", err))
      .finally(() => { if (!cancelled) setLoadingList(false); });
    return () => { cancelled = true; };
  }, [user?.id]);

  const handleSelect = (s: SubmissionSummary) => {
    router.push(`/recent-coa/${s.id}`);
  };

  const handleBack = () => {
    router.push("/recent-coa");
  };

  const filtered = submissions.filter((s) =>
    s.filename.toLowerCase().includes(search.toLowerCase()),
  );

  if (view === "detail" && selected) {
    return <DetailView submission={selected} onBack={handleBack} />;
  }

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Recent Submissions</h2>
            <p className="mt-0.5 text-xs text-slate-400">
              {submissions.length} submission{submissions.length !== 1 ? "s" : ""} on record
            </p>
          </div>
          <div className="relative">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              width="13"
              height="13"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            <input
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-8 pr-3 text-sm outline-none focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all sm:w-56"
              placeholder="Search by filename…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {loadingList ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span className="text-sm">Loading submissions…</span>
            </div>
          ) : submissions.length === 0 ? (
            <EmptyState />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
              <p className="text-sm font-medium text-slate-600">No files match your search</p>
              <p className="mt-1 text-xs text-slate-400">Try another filename or clear the search box</p>
            </div>
          ) : (
            <SubmissionsTable
              submissions={filtered}
              onRowClick={handleSelect}
              variant="default"
            />
          )}
        </div>
      </div>
    </div>
  );
}
