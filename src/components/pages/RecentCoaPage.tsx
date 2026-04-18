"use client";

import { useEffect, useMemo, useState } from "react";
import { OverallStatus } from "@/components/results/OverallStatus";
import { SubmissionsTable } from "@/components/submissions/SubmissionsTable";
import { ResultTable } from "@/components/results/ResultTable";
import { ParameterDetail } from "@/components/results/ParameterDetail";
import { ExportButtons } from "@/components/export/ExportButtons";
import { useCoaResult } from "@/hooks/useCoaResult";
import { useAuth } from "@/context/AuthContext";
import { listSubmissions, deleteSubmission, downloadExport, downloadBulkExport } from "@/lib/api";
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
  /** `YYYY-MM` from `<input type="month" />`, or "" for any month. */
  const [monthFilter, setMonthFilter] = useState("");
  /** Inclusive local date range (`YYYY-MM-DD`); when either is set, overrides the month filter. */
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set());
  const [exportBusy, setExportBusy] = useState(false);

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
      return true;
    });
  }, [submissions, search, monthFilter, dateFrom, dateTo]);

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
    "h-9 w-full min-w-0 rounded-md border border-slate-200/90 bg-white px-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-1 focus:ring-slate-200/80 disabled:cursor-not-allowed disabled:bg-slate-50/80 disabled:opacity-60";

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

  if (view === "detail" && selected) {
    return <DetailView submission={selected} onBack={handleBack} />;
  }

  return (
    <div className="space-y-5">
      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="border-b border-slate-100/90 bg-slate-50/40 px-4 py-4 sm:px-5">
          <div className="space-y-4">
            {/* Row 1: title left, date filters right (month + range always one line) */}
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
              <div className="min-w-0">
                <h2 className="text-sm font-semibold tracking-tight text-slate-900">Recent Submissions</h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {hasActiveFilters
                    ? `Showing ${filtered.length} of ${submissions.length}`
                    : `${submissions.length} submission${submissions.length !== 1 ? "s" : ""} on record`}
                </p>
                {selectedIds.size > 0 ? (
                  <p className="mt-2 text-xs font-medium text-blue-700">
                    {selectedIds.size} selected
                    {filtered.length > 0 ? ` · ${filtered.length} visible` : ""}
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
              <div className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-100/80 pt-3">
                <span className="hidden text-[11px] font-semibold uppercase tracking-wide text-slate-400 sm:inline">
                  Export
                </span>
                <button
                  type="button"
                  disabled={exportBusy}
                  onClick={() => void handleBulkExport("csv")}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-navy shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                >
                  CSV
                </button>
                <button
                  type="button"
                  disabled={exportBusy}
                  onClick={() => void handleBulkExport("pdf")}
                  className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-navy shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => void handleBulkDelete()}
                  disabled={exportBusy}
                  className="h-9 rounded-lg border border-red-200 bg-red-50 px-3 text-xs font-semibold text-red-700 shadow-sm transition hover:bg-red-100 disabled:opacity-50"
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
