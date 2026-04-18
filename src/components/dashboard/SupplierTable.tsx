interface Supplier {
  name: string;
  submissions: number;
  passRate: number;
  lastSubmission: string;
  trend: "up" | "down" | "stable";
}

const SUPPLIERS: Supplier[] = [
  { name: "BioSynth Labs", submissions: 28, passRate: 71, lastSubmission: "Today", trend: "down" },
  { name: "PharmaCore Ltd", submissions: 45, passRate: 96, lastSubmission: "Today", trend: "up" },
  { name: "MedChem Inc", submissions: 19, passRate: 84, lastSubmission: "Yesterday", trend: "stable" },
  { name: "GlobalAPI", submissions: 33, passRate: 91, lastSubmission: "2 days ago", trend: "up" },
  { name: "EuroChem SA", submissions: 12, passRate: 100, lastSubmission: "4 days ago", trend: "up" },
];

function TrendIcon({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") return (
    <span className="flex items-center gap-0.5 text-emerald-600 text-xs font-medium">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 15l-6-6-6 6"/></svg>
      Up
    </span>
  );
  if (trend === "down") return (
    <span className="flex items-center gap-0.5 text-red-500 text-xs font-medium">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M6 9l6 6 6-6"/></svg>
      Down
    </span>
  );
  return <span className="text-slate-400 text-xs font-medium">Stable</span>;
}

export function SupplierTable() {
  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Supplier Performance</h3>
        <p className="mt-0.5 text-xs text-slate-400 font-medium">Monthly pass rate metrics</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50/50">
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Supplier</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Submissions</th>
              <th className="px-6 py-3 text-right text-[10px] font-bold uppercase tracking-wider text-slate-400">Pass Rate</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Trend</th>
              <th className="px-6 py-3 text-left text-[10px] font-bold uppercase tracking-wider text-slate-400">Activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {SUPPLIERS.map((s) => (
              <tr key={s.name} className="hover:bg-slate-50/40 transition-colors">
                <td className="px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-500 ring-1 ring-inset ring-slate-200">
                      {s.name[0]}
                    </div>
                    <span className="font-semibold text-slate-900">{s.name}</span>
                  </div>
                </td>
                <td className="px-6 py-3.5 text-right text-slate-600 font-bold">{s.submissions}</td>
                <td className="px-6 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-3">
                    <div className="w-24 h-1 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full"
                        style={{
                          width: `${s.passRate}%`,
                          backgroundColor: s.passRate >= 90 ? "#10b981" : s.passRate >= 75 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-slate-900 font-bold text-[11px] w-12 text-right">{s.passRate}%</span>
                  </div>
                </td>
                <td className="px-6 py-3.5">
                  <TrendIcon trend={s.trend} />
                </td>
                <td className="px-6 py-3.5 text-slate-500 text-[10px] font-bold uppercase tracking-wide">{s.lastSubmission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
