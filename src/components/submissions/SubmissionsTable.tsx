"use client";

import { useEffect, useRef } from "react";
import type { SubmissionSummary, StatusSummary } from "@/lib/types";
import { StatusBadge } from "@/components/results/StatusBadge";

function StatusBreakdown({ summary }: { summary?: StatusSummary }) {
  if (!summary) return null;
  const parts = [];
  if (summary.PASS) parts.push(
    <div key="pass" className="flex items-center gap-1 text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-[1px] rounded-[3px] uppercase font-bold tracking-wider">
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      <span>{summary.PASS}</span>
    </div>
  );
  if (summary.WARNING) parts.push(
    <div key="warn" className="flex items-center gap-1 text-amber-600 bg-amber-50 border border-amber-100 px-1.5 py-[1px] rounded-[3px] uppercase font-bold tracking-wider">
      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>{summary.WARNING}</span>
    </div>
  );
  if (summary.FAIL) parts.push(
    <div key="fail" className="flex items-center gap-1 text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-[1px] rounded-[3px] uppercase font-bold tracking-wider">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <span>{summary.FAIL}</span>
    </div>
  );
  if (summary.ERROR) parts.push(
    <div key="err" className="flex items-center gap-1 text-orange-700 bg-orange-50 border border-orange-100 px-1.5 py-[1px] rounded-[3px] uppercase font-bold tracking-wider">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{summary.ERROR}</span>
    </div>
  );
  if (summary.REVIEW) parts.push(
    <div key="rev" className="flex items-center gap-1 text-indigo-600 bg-indigo-50 border border-indigo-100 px-1.5 py-[1px] rounded-[3px] uppercase font-bold tracking-wider">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <span>{summary.REVIEW}</span>
    </div>
  );

  if (parts.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-2 text-[8px]">
      {parts}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffH < 24) return `${diffH}h ago`;
  if (diffD < 7) return `${diffD}d ago`;
  return new Date(dateStr).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

const STAGE_LABEL: Record<string, string> = {
  intake: "Intake",
  extract: "Extract",
  validate: "Validate",
  store: "Store",
  complete: "Complete",
};

function stageLabel(stage: SubmissionSummary["stage"]): string {
  return STAGE_LABEL[stage] ?? stage;
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export type SubmissionsTableBulkSelect = {
  selectedIds: ReadonlySet<string>;
  onToggleOne: (id: string, selected: boolean) => void;
  onToggleAll: (selectAll: boolean) => void;
};

export function SubmissionsTable({
  submissions,
  onRowClick,
  onDelete,
  variant = "default",
  userRole,
  bulkSelect,
}: {
  submissions: SubmissionSummary[];
  onRowClick?: (s: SubmissionSummary) => void;
  onDelete?: (s: SubmissionSummary) => void;
  variant?: "default" | "compact";
  userRole?: string;
  bulkSelect?: SubmissionsTableBulkSelect;
}) {
  const compact = variant === "compact";
  const th = compact
    ? "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400"
    : "px-6 py-3.5 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400";
  const td = compact ? "px-4 py-3.5 align-middle" : "px-6 py-4 align-middle";
  const rowInteractive = Boolean(onRowClick);
  const showBulk = Boolean(bulkSelect) && !compact;

  const selectAllRef = useRef<HTMLInputElement>(null);
  const allSelected =
    showBulk && submissions.length > 0 && submissions.every((s) => bulkSelect!.selectedIds.has(s.id));
  const someSelected =
    showBulk && submissions.some((s) => bulkSelect!.selectedIds.has(s.id));

  useEffect(() => {
    const el = selectAllRef.current;
    if (!el) return;
    el.indeterminate = Boolean(someSelected && !allSelected);
  }, [someSelected, allSelected, showBulk]);

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full min-w-[min(100%,720px)] border-collapse text-left text-sm">
        <thead>
          <tr className="bg-slate-50/50">
            {showBulk ? (
              <th scope="col" className={`${th} w-12 pl-6 text-center`}>
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allSelected}
                  onChange={(e) => bulkSelect!.onToggleAll(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                  title="Select all rows"
                  aria-label="Select all rows"
                />
              </th>
            ) : null}
            <th scope="col" className={th}>
              Document
            </th>
            <th scope="col" className={th}>
              Results
            </th>
            {!compact && (
              <>
                <th scope="col" className={th}>
                  Outcome
                </th>
                <th scope="col" className={th}>
                  Approval
                </th>
              </>
            )}
            <th scope="col" className={`${th} text-right`}>
              Submitted
            </th>
            {onDelete && <th scope="col" className={`${th} w-12 text-center`}>Actions</th>}
            {rowInteractive && !onDelete ? (
              <th scope="col" className={`${th} w-12 pr-6 text-center`}>
                <span className="sr-only">Open</span>
              </th>
            ) : null}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {submissions.map((s) => (
            <tr
              key={s.id}
              onClick={rowInteractive ? () => onRowClick!(s) : undefined}
              className={`group transition-colors ${
                rowInteractive
                  ? "cursor-pointer hover:bg-slate-50/60"
                  : "hover:bg-slate-50/40"
              } ${showBulk && bulkSelect!.selectedIds.has(s.id) ? "bg-slate-50" : ""}`}
            >
              {showBulk ? (
                <td
                  className={`${td} w-12 pl-6 text-center`}
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="checkbox"
                    checked={bulkSelect!.selectedIds.has(s.id)}
                    onChange={(e) => bulkSelect!.onToggleOne(s.id, e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    aria-label={`Select ${s.filename}`}
                  />
                </td>
              ) : null}
              <td className={td}>
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex shrink-0 items-center justify-center rounded bg-slate-100 text-slate-400 ring-1 ring-inset ring-slate-200 ${
                      compact ? "h-7 w-7" : "h-8 w-8"
                    }`}
                  >
                    <FileIcon className={compact ? "scale-75" : "scale-90"} />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <p
                      className={`truncate font-bold text-slate-900 ${
                        compact ? "max-w-[180px] text-[12px]" : "max-w-[min(100%,20rem)] text-[13px]"
                      } transition-colors`}
                      title={s.filename}
                    >
                      {s.filename}
                    </p>
                    <p className="mt-0.5 font-semibold text-[10px] text-slate-400" title={s.header?.coa_number || s.id}>
                      {s.header?.coa_number || s.id.slice(0, 8)}
                    </p>
                  </div>
                </div>
              </td>
              <td className={td}>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900 tabular-nums text-[13px]">{s.parameter_count > 0 ? s.parameter_count : "—"}</span>
                  {s.parameter_count > 0 && <span className="text-[11px] font-semibold text-slate-400">Parameters</span>}
                </div>
                {s.status_summary && s.parameter_count > 0 && <StatusBreakdown summary={s.status_summary} />}
              </td>
              {!compact && (
                <>
                  <td className={td}>
                    <StatusBadge status={s.overall_status} />
                  </td>
                  <td className={td}>
                    {(() => {
                      const st = (s.approval_status || "").toUpperCase();
                      if (st === "RELEASED" || st === "RELEASE") {
                        return (
                          <span className="inline-flex items-center gap-1.5 font-bold text-emerald-600">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span className="text-[11px]">Released</span>
                          </span>
                        );
                      }
                      if (st === "WAITING_FOR_QC") {
                        return (
                          <span className="inline-flex items-center gap-1.5 font-bold text-indigo-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
                            <span className="text-[11px]">Pending QC</span>
                          </span>
                        );
                      }
                      if (st === "HELD" || st === "HOLD") {
                        return (
                          <span className="inline-flex items-center gap-1.5 font-bold text-amber-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            <span className="text-[11px]">Hold</span>
                          </span>
                        );
                      }
                      if (st === "REJECTED" || st === "REJECT") {
                        return (
                          <span className="inline-flex items-center gap-1.5 font-bold text-rose-500">
                            <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                            <span className="text-[11px]">Rejected</span>
                          </span>
                        );
                      }
                      return (
                        <span className="inline-flex items-center gap-1.5 font-bold text-slate-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-slate-300" />
                          <span className="text-[11px]">Draft</span>
                        </span>
                      );
                    })()}
                  </td>
                </>
              )}
              <td className={`${td} text-right text-[11px] font-semibold text-slate-400 tabular-nums`}>
                <span title={new Date(s.created_at).toLocaleString()}>{timeAgo(s.created_at)}</span>
              </td>
              {onDelete && (
                <td className={`${td} text-center`}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(s);
                    }}
                    className="inline-flex h-8 w-8 items-center justify-center rounded text-slate-300 hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Delete submission"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </td>
              )}
              {rowInteractive && !onDelete ? (
                <td className={`${td} w-12 pr-6 text-center text-slate-300 group-hover:text-slate-900 transition-colors`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden>
                    <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
