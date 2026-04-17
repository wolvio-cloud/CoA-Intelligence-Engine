"use client";

import { useQuery } from "@tanstack/react-query";
import { StatusBadge } from "@/components/results/StatusBadge";
import { useAuth } from "@/context/AuthContext";
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
  const { user } = useAuth();
  const { data: items = [], isLoading } = useQuery({
    queryKey: ["coa-submissions", user?.id ?? "none"],
    queryFn: () => listSubmissions(200),
    enabled: Boolean(user?.id),
    refetchInterval: 5000,
  });

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
      <div className="mt-1 min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {isLoading && <p className="py-4 text-center text-[12px] text-slate-400">Loading…</p>}
        {!isLoading && items.length === 0 && (
          <p className="py-4 text-center text-[12px] text-slate-400">No submissions yet</p>
        )}
        {!isLoading && items.length > 0 ? (
          <table className="w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-100 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                <th scope="col" className="py-2 pr-1 font-semibold">
                  Document
                </th>
                <th scope="col" className="w-14 py-2 text-right font-semibold">
                  Outcome
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {items.map((s) => (
                <tr key={s.id}>
                  <td className="py-2.5 pr-1 align-top">
                    <button
                      type="button"
                      onClick={() => onSelect(s)}
                      className={`w-full rounded-md px-1 py-0.5 text-left transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30 ${
                        activeId === s.id ? "bg-sky-50 text-navy" : "text-brand-slate hover:bg-slate-50 hover:text-navy"
                      }`}
                    >
                      <span className="line-clamp-2 font-medium leading-snug">{s.filename}</span>
                      <span className="mt-0.5 block font-mono text-[10px] text-slate-400">
                        {new Date(s.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                      </span>
                    </button>
                  </td>
                  <td className="py-2.5 pl-1 align-top text-right">
                    <button
                      type="button"
                      onClick={() => onSelect(s)}
                      className="inline-flex focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue/30"
                    >
                      <StatusBadge status={s.overall_status} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : null}
      </div>
    </div>
  );
}
