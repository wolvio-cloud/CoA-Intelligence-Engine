"use client";

import type { SubmissionSummary, StatusSummary } from "@/lib/types";
import { StatusBadge } from "@/components/results/StatusBadge";

function StatusBreakdown({ summary }: { summary?: StatusSummary }) {
  if (!summary) return null;
  const parts = [];
  if (summary.PASS) parts.push(
    <div key="pass" className="flex items-center gap-1 text-emerald-600 bg-emerald-50/80 border border-emerald-200/60 px-1.5 py-[2px] rounded uppercase font-bold tracking-wider">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      <span>{summary.PASS}</span>
    </div>
  );
  if (summary.WARNING) parts.push(
    <div key="warn" className="flex items-center gap-1 text-amber-600 bg-amber-50/80 border border-amber-200/60 px-1.5 py-[2px] rounded uppercase font-bold tracking-wider">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>{summary.WARNING}</span>
    </div>
  );
  if (summary.FAIL) parts.push(
    <div key="fail" className="flex items-center gap-1 text-rose-600 bg-rose-50/80 border border-rose-200/60 px-1.5 py-[2px] rounded uppercase font-bold tracking-wider">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
      <span>{summary.FAIL}</span>
    </div>
  );
  if (summary.ERROR) parts.push(
    <div key="err" className="flex items-center gap-1 text-red-700 bg-red-50/80 border border-red-200/60 px-1.5 py-[2px] rounded uppercase font-bold tracking-wider">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
      <span>{summary.ERROR}</span>
    </div>
  );
  if (summary.REVIEW) parts.push(
    <div key="rev" className="flex items-center gap-1 text-sky-600 bg-sky-50/80 border border-sky-200/60 px-1.5 py-[2px] rounded uppercase font-bold tracking-wider">
      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      <span>{summary.REVIEW}</span>
    </div>
  );

  if (parts.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-[9px]">
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
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

export function SubmissionsTable({
  submissions,
  onRowClick,
  variant = "default",
}: {
  submissions: SubmissionSummary[];
  onRowClick?: (s: SubmissionSummary) => void;
  variant?: "default" | "compact";
}) {
  const compact = variant === "compact";
  const th = compact
    ? "px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wide text-navy"
    : "px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-navy sm:px-5";
  const td = compact ? "px-3 py-2.5 align-middle" : "px-4 py-3.5 align-middle sm:px-5";
  const rowInteractive = Boolean(onRowClick);

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200/90 bg-white shadow-sm">
      <table className="w-full min-w-[min(100%,720px)] border-collapse text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/95">
            <th scope="col" className={th}>
              Document
            </th>
            {!compact && (
              <th scope="col" className={`${th} hidden sm:table-cell`}>
                Stage
              </th>
            )}
            <th scope="col" className={`${th} sm:table-cell`}>
              Results
            </th>
            {!compact && (
              <th scope="col" className={th}>
                Outcome
              </th>
            )}
            <th scope="col" className={`${th} text-right`}>
              Submitted
            </th>
            {rowInteractive ? (
              <th scope="col" className={`${th} w-12 pr-4 text-center sm:pr-5`}>
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
              onKeyDown={
                rowInteractive
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onRowClick!(s);
                      }
                    }
                  : undefined
              }
              tabIndex={rowInteractive ? 0 : undefined}
              role={rowInteractive ? "button" : undefined}
              className={`group transition-colors ${
                rowInteractive
                  ? "cursor-pointer hover:bg-sky-50/60 focus-visible:bg-sky-50/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400/40"
                  : "hover:bg-slate-50/50"
              }`}
            >
              <td className={td}>
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={`flex shrink-0 items-center justify-center rounded-lg border border-slate-200/80 bg-white text-slate-500 shadow-sm ${
                      compact ? "h-8 w-8" : "h-9 w-9"
                    }`}
                  >
                    <FileIcon className={compact ? "scale-90" : undefined} />
                  </div>
                  <div className="min-w-0 flex flex-col justify-center">
                    <p
                      className={`truncate font-medium text-navy ${
                        compact ? "max-w-[180px] text-[13px]" : "max-w-[min(100%,20rem)]"
                      } ${rowInteractive ? "group-hover:text-blue-700" : ""} transition-colors`}
                      title={s.filename}
                    >
                      {s.filename}
                    </p>
                    <p className="mt-0.5 font-mono text-[10px] text-slate-400 sm:text-[11px]" title={s.header?.coa_number || s.id}>
                      {s.header?.coa_number || `${s.id.slice(0, 8)}…${s.id.slice(-4)}`}
                    </p>
                  </div>
                </div>
              </td>
              {!compact && (
                <td className={`${td} hidden text-xs font-medium text-slate-600 sm:table-cell`}>
                  {stageLabel(s.stage)}
                </td>
              )}
              <td className={`${td}`}>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-slate-700 tabular-nums">{s.parameter_count > 0 ? s.parameter_count : "—"}</span>
                  {s.parameter_count > 0 && <span className="text-xs text-slate-400">params</span>}
                </div>
                {s.status_summary && s.parameter_count > 0 && <StatusBreakdown summary={s.status_summary} />}
              </td>
              {!compact && (
                <td className={td}>
                  <StatusBadge status={s.overall_status} />
                </td>
              )}
              <td className={`${td} text-right text-xs tabular-nums text-slate-500`}>
                <span title={new Date(s.created_at).toLocaleString()}>{timeAgo(s.created_at)}</span>
              </td>
              {rowInteractive ? (
                <td className={`${td} w-12 pr-4 text-center text-slate-300 group-hover:text-blue-500 sm:pr-5`}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
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
