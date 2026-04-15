"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/results/StatusBadge";
import { OverallStatus } from "@/components/results/OverallStatus";
import { ResultTable } from "@/components/results/ResultTable";
import { ParameterDetail } from "@/components/results/ParameterDetail";
import { ExportButtons } from "@/components/export/ExportButtons";
import { useCoaResult } from "@/hooks/useCoaResult";
import { listSubmissions } from "@/lib/api";
import type { CoaParameter, SubmissionSummary } from "@/lib/types";

type View = "list" | "detail";

function TimeAgo({ dateStr }: { dateStr: string }) {
  const date = new Date(dateStr);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  let label: string;
  if (diffMin < 1) label = "Just now";
  else if (diffMin < 60) label = `${diffMin}m ago`;
  else if (diffH < 24) label = `${diffH}h ago`;
  else if (diffD < 7) label = `${diffD}d ago`;
  else label = date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return <span>{label}</span>;
}

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

function SubmissionCard({
  submission,
  onSelect,
}: {
  submission: SubmissionSummary;
  onSelect: (s: SubmissionSummary) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(submission)}
      className="group flex w-full items-start gap-4 rounded-2xl border border-slate-200/70 bg-white p-4 text-left shadow-sm hover:border-blue-200 hover:shadow-md transition-all duration-150"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
          {submission.filename}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <StatusBadge status={submission.overall_status} />
          <span className="text-xs text-slate-400">
            {submission.parameter_count > 0 ? `${submission.parameter_count} params` : "—"}
          </span>
          <span className="text-xs text-slate-400">
            <TimeAgo dateStr={submission.created_at} />
          </span>
        </div>
      </div>
      <div className="shrink-0 text-slate-300 group-hover:text-blue-400 transition-colors mt-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </div>
    </button>
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
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M19 12H5M12 5l-7 7 7 7"/>
          </svg>
          Back to list
        </button>
        {data && <ExportButtons jobId={data.id} />}
      </div>

      {loading || !data ? (
        <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
            </svg>
            <p className="text-sm">Loading results…</p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
            <div className="p-5">
              <OverallStatus
                status={data.overall_status}
                productName={data.product_match.matched_product}
                filename={data.filename}
                matchScore={data.product_match.match_score}
              />
            </div>
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
            <ResultTable
              parameters={data.parameters}
              selectedId={selectedParam?.id ?? null}
              onSelect={setSelectedParam}
            />
            <ParameterDetail
              param={selectedParam}
              onClose={() => setSelectedParam(null)}
            />
          </div>
        </>
      )}
    </div>
  );
}

export function RecentCoaPage() {
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<SubmissionSummary | null>(null);
  const [view, setView] = useState<View>("list");
  const [search, setSearch] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoadingList(true);
    listSubmissions()
      .then((items) => { if (!cancelled) setSubmissions(items); })
      .catch((err) => console.error("Failed to load submissions:", err))
      .finally(() => { if (!cancelled) setLoadingList(false); });
    return () => { cancelled = true; };
  }, []);

  const handleSelect = (s: SubmissionSummary) => {
    setSelected(s);
    setView("detail");
  };

  const handleBack = () => {
    setSelected(null);
    setView("list");
  };

  const filtered = submissions.filter((s) =>
    s.filename.toLowerCase().includes(search.toLowerCase())
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
              width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
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

        <div className="p-4">
          {loadingList ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              <span className="text-sm">Loading submissions…</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {filtered.map((s) => (
                <SubmissionCard key={s.id} submission={s} onSelect={handleSelect} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
