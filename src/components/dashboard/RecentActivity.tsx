interface ActivityItem {
  id: string;
  filename: string;
  status: "PASS" | "WARNING" | "FAIL" | "REVIEW";
  supplier: string;
  time: string;
  paramCount: number;
}

const statusConfig = {
  PASS: { label: "Pass", bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  WARNING: { label: "Warning", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  FAIL: { label: "Fail", bg: "bg-red-50", text: "text-red-600", dot: "bg-red-500" },
  REVIEW: { label: "Review", bg: "bg-cyan-50", text: "text-cyan-700", dot: "bg-cyan-500" },
};

const MOCK_ACTIVITY: ActivityItem[] = [
  { id: "1", filename: "CoA_Paracetamol_IP_Lot42.pdf", status: "WARNING", supplier: "BioSynth Labs", time: "2m ago", paramCount: 15 },
  { id: "2", filename: "Ibuprofen_USP_RMG.pdf", status: "PASS", supplier: "PharmaCore Ltd", time: "1h ago", paramCount: 12 },
  { id: "3", filename: "Aspirin_BP_batchC.pdf", status: "REVIEW", supplier: "MedChem Inc", time: "3h ago", paramCount: 11 },
  { id: "4", filename: "Metformin_IP_Lot8.pdf", status: "PASS", supplier: "GlobalAPI", time: "5h ago", paramCount: 14 },
  { id: "5", filename: "Atorvastatin_USP_BX9.pdf", status: "FAIL", supplier: "BioSynth Labs", time: "1d ago", paramCount: 16 },
];

export function RecentActivity() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Recent Submissions</h3>
          <p className="mt-0.5 text-xs text-slate-400">Latest CoA analysis results</p>
        </div>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors">
          View all
        </button>
      </div>
      <div className="divide-y divide-slate-50">
        {MOCK_ACTIVITY.map((item) => {
          const cfg = statusConfig[item.status];
          return (
            <div key={item.id} className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors cursor-pointer">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-slate-900">{item.filename}</p>
                <p className="mt-0.5 text-xs text-slate-400">{item.supplier} · {item.paramCount} params</p>
              </div>
              <div className="shrink-0 flex flex-col items-end gap-1">
                <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                  {cfg.label}
                </span>
                <span className="text-[11px] text-slate-400">{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
