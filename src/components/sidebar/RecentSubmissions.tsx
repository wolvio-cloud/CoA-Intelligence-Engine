"use client";

import { useEffect, useState } from "react";
import { StatusBadge } from "@/components/results/StatusBadge";
import { listSubmissions } from "@/lib/api";
import type { SubmissionSummary } from "@/lib/types";

export function RecentSubmissions({
  activeId,
  onSelect,
  onRequestCollapse,
  className = "",
}: {
  activeId: string | null;
  onSelect: (s: SubmissionSummary) => void;
  /** Optional control to hide the column (wider main area). */
  onRequestCollapse?: () => void;
  className?: string;
}) {
  const [items, setItems] = useState<SubmissionSummary[]>([]);

  useEffect(() => {
    let cancelled = false;
    listSubmissions()
      .then((submissions) => {
        if (!cancelled) setItems(submissions);
      })
      .catch((error) => {
        console.error("Unable to load recent submissions:", error);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      className={`flex min-h-0 flex-col rounded-lg border border-slate-200/90 bg-white p-5 shadow-card ${className}`}
    >
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <h3 className="text-[12px] font-semibold tracking-tight text-navy">Recent activity</h3>
        <div className="flex items-center gap-2">
          {onRequestCollapse ? (
            <button
              type="button"
              onClick={onRequestCollapse}
              className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-brand-slate transition hover:border-slate-300 hover:bg-brand-light"
              title="Hide panel — use header to show again"
            >
              Hide
            </button>
          ) : null}
        </div>
      </div>
      <ul className="mt-1 min-h-0 flex-1 divide-y divide-slate-100 overflow-y-auto overscroll-contain">
        {items.map((s) => (
          <li key={s.id}>
            <button
              type="button"
              onClick={() => onSelect(s)}
              className={`flex w-full flex-col gap-1.5 py-3.5 text-left transition-colors ${
                activeId === s.id ? "text-navy" : "text-brand-slate hover:text-navy"
              }`}
            >
              <span className="truncate text-[12px] font-medium leading-snug">{s.filename}</span>
              <span className="font-mono text-[11px] text-slate-400">
                {new Date(s.created_at).toLocaleString(undefined, {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </span>
              <div className="flex items-center justify-between gap-2 pt-0.5">
                <StatusBadge status={s.overall_status} />
                <span className="text-[11px] text-slate-500">{s.parameter_count} parameters</span>
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
