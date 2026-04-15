import type { SubmissionSummary } from "@/lib/types";

type StatusKey = "PASS" | "WARNING" | "FAIL" | "REVIEW" | "ERROR";

const statusConfig: Record<StatusKey, { label: string; bg: string; text: string; dot: string }> = {
  PASS: { label: "Pass", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  WARNING: { label: "Warning", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  FAIL: { label: "Fail", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  REVIEW: { label: "Review", bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
  ERROR: { label: "Error", bg: "bg-orange-50", text: "text-orange-700", dot: "bg-orange-500" },
};

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

interface RecentActivityProps {
  submissions: SubmissionSummary[];
}

export function RecentActivity({ submissions }: RecentActivityProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Recent Submissions</h3>
          <p className="mt-0.5 text-xs text-slate-400">Latest CoA analysis results</p>
        </div>
      </div>
      {submissions.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-slate-400">No submissions yet</div>
      ) : (
        <div className="divide-y divide-slate-50">
          {submissions.map((item) => {
            const cfg = statusConfig[item.overall_status as StatusKey] ?? statusConfig.REVIEW;
            return (
              <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-900">{item.filename}</p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {item.parameter_count > 0 ? `${item.parameter_count} params` : "—"}
                  </p>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </span>
                  <span className="text-[11px] text-slate-400">{timeAgo(item.created_at)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
