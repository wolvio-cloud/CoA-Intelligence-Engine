"use client";

import { useEffect, useMemo, useState, useRef } from "react";
import { OverallStatus } from "@/components/results/OverallStatus";
import { SubmissionsTable } from "@/components/submissions/SubmissionsTable";
import { ResultTable } from "@/components/results/ResultTable";
import { ParameterDetail } from "@/components/results/ParameterDetail";
import { DispositionPanel } from "@/components/results/DispositionPanel";
import { ExportButtons } from "@/components/export/ExportButtons";
import { useCoaResult } from "@/hooks/useCoaResult";
import { useAuth } from "@/context/AuthContext";
import { listSubmissions, deleteSubmission, downloadExport, downloadBulkExport, acknowledgeSubmission } from "@/lib/api";
import { useRouter } from "next/navigation";
import type { CoaParameter, SubmissionSummary } from "@/lib/types";

type View = "list" | "detail";

/** Local calendar YYYY-MM-DD for filter matching (submission `created_at`). */
function localDateKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Inclusive range on local `YYYY-MM-DD` keys; swaps if from > to. */
function inLocalDateRange(iso: string, from: string, to: string): boolean {
  const key = localDateKey(iso);
  let start = from;
  let end = to;
  if (start && end && start > end) {
    const swap = start;
    start = end;
    end = swap;
  }
  if (start && key < start) return false;
  if (end && key > end) return false;
  return true;
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-slate-50 text-slate-400 mb-4 ring-1 ring-inset ring-slate-200">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <p className="text-sm font-bold text-slate-900 tracking-tight">No submissions found</p>
      <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wider">Analysis results will appear here</p>
    </div>
  );
}

/** Header chip after manager sign-off (`approval_status` + optional raw `disposition`). */
function ManagerDispositionBadge({
  approvalStatus,
  disposition,
}: {
  approvalStatus?: string | null;
  disposition?: string | null;
}) {
  const a = (approvalStatus || "").toUpperCase().trim();
  const d = (disposition || "").toUpperCase().trim();
  const isReject = a === "REJECTED" || d === "REJECT";
  const isHold = a === "HELD" || a === "HOLD" || d === "HOLD";
  const isReleased = a === "RELEASED" || d === "RELEASE";

  if (isReject) {
    return (
      <div className="inline-flex h-9 items-center gap-2 rounded-md border border-rose-100 bg-rose-50 px-3 text-[10px] font-bold uppercase tracking-wider text-rose-700">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
          <path d="M18 6L6 18M6 6l12 12" />
        </svg>
        Reject
      </div>
    );
  }
  if (isHold) {
    return (
      <div className="inline-flex h-9 items-center gap-2 rounded-md border border-amber-100 bg-amber-50 px-3 text-[10px] font-bold uppercase tracking-wider text-amber-700">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
          <rect x="6" y="4" width="4" height="16" rx="1" />
          <rect x="14" y="4" width="4" height="16" rx="1" />
        </svg>
        Hold
      </div>
    );
  }
  if (isReleased) {
    return (
      <div className="inline-flex h-9 items-center gap-2 rounded-md border border-emerald-100 bg-emerald-50 px-3 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <polyline points="20 6 9 17 4 12" />
        </svg>
        Released
      </div>
    );
  }
  return null;
}

function DetailView({
  submission,
  onBack,
  userRole,
}: {
  submission: SubmissionSummary;
  onBack: () => void;
  userRole: string;
}) {
  const router = useRouter();
  const [selectedParam, setSelectedParam] = useState<CoaParameter | null>(null);
  const { data, loading, refetch } = useCoaResult(submission.id, true);
  const dispositionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!data?.parameters?.length) return;
    setSelectedParam((prev) => {
      if (prev && data.parameters.some((p) => p.id === prev.id)) return prev;
      return data.parameters[0];
    });
  }, [data]);

  const scrollToDisposition = () => {
    dispositionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const isDispositionCompleted = !!data?.manager_signed_at;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 rounded-lg border border-slate-200 bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <button
            type="button"
            onClick={onBack}
            className="inline-flex w-fit items-center gap-2 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 transition hover:bg-slate-50 hover:text-slate-900"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" aria-hidden>
              <path d="M19 12H5M12 5l-7 7 7 7" />
            </svg>
            Back
          </button>
          <div className="hidden h-8 w-px shrink-0 bg-slate-100 sm:block" aria-hidden />
          <div className="min-w-0 flex flex-col justify-center">
            {submission.header?.product_name || submission.header?.supplier_name ? (
              <>
                <p className="truncate text-base font-bold text-navy tracking-tight sm:text-lg" title={submission.header.product_name ?? undefined}>
                  {submission.header.product_name || "Product Unknown"}
                </p>
                <p className="mt-0.5 truncate text-[11px] font-semibold text-slate-500 tracking-wide" title={submission.header.supplier_name ?? undefined}>
                  {submission.header.supplier_name || "Supplier Unknown"}
                </p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold text-slate-400 tracking-wide">Submission Review</p>
                <p className="truncate text-base font-bold text-navy tracking-tight sm:text-lg" title={data?.filename ?? submission.filename}>
                  {loading ? "Loading…" : data?.filename ?? submission.filename}
                </p>
              </>
            )}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {data && (
            <>
              {userRole === "manager" && (data.approval_status || "").toUpperCase().trim() === "WAITING_FOR_QC" && (
                <div className="inline-flex h-9 items-center gap-2 rounded-lg bg-blue-50 px-3 text-xs font-bold text-blue-600 border border-blue-100 italic">
                  Awaiting your sign-off
                </div>
              )}
              <ManagerDispositionBadge approvalStatus={data.approval_status} disposition={data.disposition} />
              <div className="h-6 w-px bg-slate-200 mx-1" aria-hidden />
              <ExportButtons jobId={data.id} compact />
            </>
          )}
        </div>
      </header>

      {/* Status Timeline */}
      {data && !loading && (
        <div className="rounded-lg border border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide">Document Status</p>
            <div className="flex items-center gap-2 sm:gap-3 text-[11px]">
              {/* AI Analyzed */}
              <div className="flex items-center gap-1.5">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-100">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <span className="font-semibold text-slate-700">AI Analyzed</span>
              </div>

              {/* Divider */}
              <div className="h-0.5 w-6 bg-gradient-to-r from-emerald-200 to-slate-200" />

              {/* QC Pending/Review */}
              <div className="flex items-center gap-1.5">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  data.analyst_acknowledged_at 
                    ? "bg-emerald-100" 
                    : "bg-blue-100 animate-pulse"
                }`}>
                  {data.analyst_acknowledged_at ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-blue-600 animate-spin" style={{ animationDuration: '2s' }}>
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  )}
                </div>
                <span className={`font-semibold ${data.analyst_acknowledged_at ? "text-slate-700" : "text-blue-600"}`}>
                  {data.analyst_acknowledged_at ? "QC Reviewed" : "QC Pending"}
                </span>
              </div>

              {/* Divider */}
              <div className={`h-0.5 w-6 ${
                data.analyst_acknowledged_at 
                  ? "bg-gradient-to-r from-emerald-200 to-slate-200" 
                  : "bg-slate-200"
              }`} />

              {/* Disposition Decision */}
              <div className="flex items-center gap-1.5">
                <div className={`flex h-6 w-6 items-center justify-center rounded-full ${
                  data.manager_signed_at 
                    ? "bg-emerald-100" 
                    : data.analyst_acknowledged_at 
                      ? "bg-amber-100 animate-pulse"
                      : "bg-slate-100"
                }`}>
                  {data.manager_signed_at ? (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : data.analyst_acknowledged_at ? (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-amber-600 animate-spin" style={{ animationDuration: '2s' }}>
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  ) : (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" className="text-slate-400">
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                  )}
                </div>
                <span className={`font-semibold ${
                  data.manager_signed_at 
                    ? "text-slate-700" 
                    : data.analyst_acknowledged_at 
                      ? "text-amber-600"
                      : "text-slate-400"
                }`}>
                  {data.manager_signed_at ? "Decision Completed" : data.analyst_acknowledged_at ? "Decision Pending" : "Decision Awaiting"}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading || !data ? (
        <div className="flex min-h-[220px] items-center justify-center rounded-2xl border border-slate-200/70 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <svg className="h-6 w-6 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            <p className="text-sm font-medium text-slate-500">Loading validation workspace…</p>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            <OverallStatus
              status={data.overall_status}
              productName={data.product_match.matched_product}
              filename={data.filename}
              submissionId={data.id}
              matchScore={data.product_match.match_score}
              statusSummary={data.status_summary}
              header={data.header}
              isAcknowledged={!!data.analyst_acknowledged_at}
              showAcknowledgeButton={
                userRole !== "manager" && !data.analyst_acknowledged_at
              }
              userRole={userRole}
              isDispositionCompleted={!!data.manager_signed_at}
              onScrollToDisposition={scrollToDisposition}
              onAcknowledge={async () => {
                if (!window.confirm("Acknowledge that extraction is verified? This moves the item to Tier 2 (Manager Approval).")) return;
                try {
                  await acknowledgeSubmission(data.id);
                  await refetch();
                } catch (e) {
                  alert("Failed to acknowledge: " + (e instanceof Error ? e.message : String(e)));
                }
              }}
            />
          </div>

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

          {(userRole === "manager" || data.manager_signed_at) && (
            <div ref={dispositionRef}>
              <DispositionPanel
                submissionId={data.id}
                onSuccess={async () => {
                  await refetch();
                  if (userRole === "manager") {
                    router.push("/qc-panel");
                  }
                }}
                currentDisposition={data.disposition}
                currentNotes={data.manager_notes}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function RecentCoaPage({
  initialId,
  initialView = "list",
  statusFilter,
  dispositionFilter,
}: {
  initialId?: string;
  initialView?: View;
  statusFilter?: string;
  dispositionFilter?: string;
}) {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selected, setSelected] = useState<SubmissionSummary | null>(null);
  const [view, setView] = useState<View>(initialView);
  const [search, setSearch] = useState("");
  /** `YYYY-MM` from `<input type="month" />`, or "" for any month. */
  const [monthFilter, setMonthFilter] = useState("");
  /** Inclusive local date range (`YYYY-MM-DD`); when either is set, overrides the month filter. */
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [exportBusy, setExportBusy] = useState(false);
  const [activeStatusFilter, setActiveStatusFilter] = useState(statusFilter || "");
  const [activeDispositionFilter, setActiveDispositionFilter] = useState(dispositionFilter || "");

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
    if (user?.role === "manager") {
      router.push("/qc-panel");
    } else {
      router.push("/recent-coa");
    }
  };

  const handleDelete = async (s: SubmissionSummary) => {
    if (!window.confirm(`Are you sure you want to delete this submission? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteSubmission(s.id);
      setSubmissions((prev) => prev.filter((item) => item.id !== s.id));
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(s.id);
        return next;
      });
    } catch (err) {
      console.error("Delete failed:", err);
      alert("Failed to delete submission. Please try again.");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const rangeActive = Boolean(dateFrom) || Boolean(dateTo);
    return submissions.filter((s) => {
      if (q && !s.filename.toLowerCase().includes(q)) return false;
      if (rangeActive) {
        if (!inLocalDateRange(s.created_at, dateFrom, dateTo)) return false;
      } else if (monthFilter) {
        if (localDateKey(s.created_at).slice(0, 7) !== monthFilter) return false;
      }
      if (activeStatusFilter) {
        const statusUpper = activeStatusFilter.toUpperCase();
        // Support multiple statuses separated by commas or check individually
        const statuses = statusUpper.split(",").map(st => st.trim());
        if (!statuses.includes(s.overall_status)) return false;
      }
      if (activeDispositionFilter) {
        if (activeDispositionFilter === "pending") {
          // Show submissions without a disposition
          if (s.disposition) return false;
        } else {
          const dispositionUpper = activeDispositionFilter.toUpperCase();
          if (!s.disposition || s.disposition !== dispositionUpper) return false;
        }
      }
      return true;
    });
  }, [submissions, search, monthFilter, dateFrom, dateTo, activeStatusFilter, activeDispositionFilter]);

  const filteredIdsKey = useMemo(
    () =>
      filtered
        .map((s) => s.id)
        .slice()
        .sort()
        .join(","),
    [filtered],
  );

  useEffect(() => {
    const allowed = new Set(filtered.map((s) => s.id));
    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => allowed.has(id)));
      if (next.size === prev.size && [...next].every((id) => prev.has(id))) return prev;
      return next;
    });
  }, [filteredIdsKey]);

  const inputBase =
    "h-9 w-full min-w-0 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-400/10 disabled:cursor-not-allowed disabled:bg-slate-50";

  const handleBulkToggleOne = (id: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleBulkToggleAll = (selectAll: boolean) => {
    if (!selectAll) {
      setSelectedIds(new Set());
      return;
    }
    setSelectedIds(new Set(filtered.map((s) => s.id)));
  };

  const handleBulkExport = async (format: "csv" | "pdf") => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    setExportBusy(true);
    try {
      await downloadBulkExport(ids, format);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Export failed.");
    } finally {
      setExportBusy(false);
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...selectedIds];
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Delete ${ids.length} submission${ids.length === 1 ? "" : "s"}? This cannot be undone.`,
      )
    ) {
      return;
    }
    const results = await Promise.allSettled(ids.map((id) => deleteSubmission(id)));
    const succeeded = ids.filter((_, i) => results[i].status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected").length;
    setSubmissions((prev) => prev.filter((s) => !succeeded.includes(s.id)));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      succeeded.forEach((id) => next.delete(id));
      return next;
    });
    if (failed > 0) {
      alert(`${failed} deletion(s) failed. Try again or refresh the list.`);
    }
  };

  const hasActiveFilters =
    Boolean(search.trim()) || Boolean(monthFilter) || Boolean(dateFrom) || Boolean(dateTo);

  const clearDateFilters = () => {
    setMonthFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const clearAllFilters = () => {
    clearDateFilters();
    setSearch("");
    setActiveStatusFilter("");
    setActiveDispositionFilter("");
  };

  if (view === "detail" && selected) {
    return <DetailView submission={selected} onBack={handleBack} userRole={user?.role || "analyst"} />;
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="space-y-4">
            {/* Row 1: title left, date filters right (month + range always one line) */}
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="min-w-0">
                <h2 className="text-sm font-bold tracking-tight text-slate-900">Recent Submissions</h2>
                <p className="mt-1 text-xs font-medium text-slate-400 uppercase tracking-wider">
                  {hasActiveFilters
                    ? `${filtered.length} results filtered`
                    : `${submissions.length} total records`}
                </p>
                {selectedIds.size > 0 ? (
                  <p className="mt-2 text-xs font-bold text-brand-indigo uppercase tracking-wider">
                    {selectedIds.size} items selected
                  </p>
                ) : null}
              </div>

              <div className="flex min-w-0 flex-nowrap items-end justify-start gap-3 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] sm:ml-auto sm:justify-end [&::-webkit-scrollbar]:hidden">
                <div className="flex w-[9.25rem] shrink-0 flex-col gap-1">
                  <label
                    htmlFor="recent-coa-month"
                    className="text-[10px] font-medium tracking-wide text-slate-400"
                  >
                    Month
                  </label>
                  <input
                    id="recent-coa-month"
                    type="month"
                    value={monthFilter}
                    onChange={(e) => setMonthFilter(e.target.value)}
                    disabled={Boolean(dateFrom) || Boolean(dateTo)}
                    title={
                      dateFrom || dateTo
                        ? "Clear the date range to filter by month"
                        : "Filter by submission month"
                    }
                    className={inputBase}
                  />
                </div>

                <div className="flex min-w-[min(100%,17.5rem)] shrink-0 flex-col gap-1 sm:min-w-[19rem]">
                  <span
                    id="recent-coa-range-label"
                    className="text-[10px] font-medium tracking-wide text-slate-400"
                  >
                    Date range
                  </span>
                  <div
                    className="flex h-9 items-stretch gap-0 overflow-hidden rounded-md border border-slate-200/90 bg-white"
                    role="group"
                    aria-labelledby="recent-coa-range-label"
                  >
                    <label className="flex min-w-0 flex-1 items-stretch border-r border-slate-100">
                      <span className="sr-only">From</span>
                      <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        title="From (inclusive)"
                        aria-label="From date"
                        className="h-9 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-slate-800 outline-none focus:bg-slate-50/50"
                      />
                    </label>
                    <span
                      className="flex w-7 shrink-0 items-center justify-center text-[11px] text-slate-300"
                      aria-hidden
                    >
                      –
                    </span>
                    <label className="flex min-w-0 flex-1 items-stretch">
                      <span className="sr-only">To</span>
                      <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        title="To (inclusive)"
                        aria-label="To date"
                        className="h-9 min-w-0 flex-1 border-0 bg-transparent px-2 text-sm text-slate-800 outline-none focus:bg-slate-50/50"
                      />
                    </label>
                  </div>
                </div>

                {(monthFilter || dateFrom || dateTo) ? (
                  <button
                    type="button"
                    onClick={clearDateFilters}
                    className="h-9 shrink-0 self-end rounded-md border border-transparent px-2 text-xs font-medium text-slate-500 underline-offset-4 transition hover:text-slate-800 hover:underline"
                  >
                    Clear
                  </button>
                ) : null}
              </div>
            </div>

            {/* Row 2: search full width */}
            <div className="w-full min-w-0">
              <label
                htmlFor="recent-coa-search"
                className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wide text-slate-500"
              >
                Search
              </label>
              <div className="relative max-w-none">
                <svg
                  className="pointer-events-none absolute left-3 top-1/2 h-[13px] w-[13px] -translate-y-1/2 text-slate-400"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  aria-hidden
                >
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
                <input
                  id="recent-coa-search"
                  className={`${inputBase} pl-9`}
                  placeholder="Search by filename…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* Row 3: selection actions */}
            {selectedIds.size > 0 ? (
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100 pt-5">
                <span className="hidden text-[11px] font-semibold text-slate-400 tracking-wide sm:inline mr-2">
                  Selection Actions
                </span>
                <button
                  type="button"
                  disabled={exportBusy}
                  onClick={() => void handleBulkExport("csv")}
                  className="h-9 rounded border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  disabled={exportBusy}
                  onClick={() => void handleBulkExport("pdf")}
                  className="h-9 rounded border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-600 transition hover:bg-slate-50"
                >
                  Export PDF
                </button>
                <div className="h-4 w-px bg-slate-200 mx-1" />
                <button
                  type="button"
                  onClick={() => void handleBulkDelete()}
                  disabled={exportBusy}
                  className="h-9 rounded border border-rose-200 bg-rose-50 px-3 text-[11px] font-bold text-rose-700 transition hover:bg-rose-100"
                >
                  Delete ({selectedIds.size})
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="h-9 rounded-lg border border-transparent px-2 text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                >
                  Clear selection
                </button>
              </div>
            ) : null}

            {/* Row 4: active filters display */}
            {(activeStatusFilter || activeDispositionFilter) && (
              <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-5">
                <span className="text-[11px] font-semibold text-slate-400 tracking-wide">Active filters:</span>
                {activeStatusFilter && (
                  <div className="inline-flex items-center gap-2 rounded-md border border-blue-100 bg-blue-50 px-3 py-1.5 text-[11px] font-semibold text-blue-700">
                    Status: {activeStatusFilter}
                    <button
                      type="button"
                      onClick={() => setActiveStatusFilter("")}
                      className="ml-1 hover:text-blue-900"
                    >
                      ✕
                    </button>
                  </div>
                )}
                {activeDispositionFilter && (
                  <div className="inline-flex items-center gap-2 rounded-md border border-green-100 bg-green-50 px-3 py-1.5 text-[11px] font-semibold text-green-700">
                    Disposition: {activeDispositionFilter === "pending" ? "Pending" : activeDispositionFilter}
                    <button
                      type="button"
                      onClick={() => setActiveDispositionFilter("")}
                      className="ml-1 hover:text-green-900"
                    >
                      ✕
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="h-7 rounded-lg border border-transparent px-2 text-xs font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {loadingList ? (
            <div className="flex items-center justify-center py-16 text-slate-400">
              <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-sm">Loading submissions…</span>
            </div>
          ) : submissions.length === 0 ? (
            <EmptyState />
          ) : filtered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 py-14 text-center">
              <p className="text-sm font-medium text-slate-600">
                {hasActiveFilters ? "No submissions match your filters" : "No files match your search"}
              </p>
              <p className="mt-1 text-xs text-slate-400">
                {hasActiveFilters
                  ? "Adjust the month, date range, or filename search, or clear filters to see more results."
                  : "Try another filename or clear the search box"}
              </p>
            </div>
          ) : (
            <SubmissionsTable
              submissions={filtered}
              onRowClick={handleSelect}
              onDelete={handleDelete}
              variant="default"
              userRole={user?.role || "analyst"}
              bulkSelect={{
                selectedIds,
                onToggleOne: handleBulkToggleOne,
                onToggleAll: handleBulkToggleAll,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function DetailViewWrapper({
  submission,
  onBack,
  userRole
}: {
  submission: SubmissionSummary;
  onBack: () => void;
  userRole: string;
}) {
  return <DetailView submission={submission} onBack={onBack} userRole={userRole} />;
}
