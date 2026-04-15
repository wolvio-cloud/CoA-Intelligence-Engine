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
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Supplier Performance</h3>
          <p className="mt-0.5 text-xs text-slate-400">Pass rate by supplier this month</p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Supplier</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Submissions</th>
              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Pass Rate</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Trend</th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Last Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {SUPPLIERS.map((s) => (
              <tr key={s.name} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="h-7 w-7 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-600">
                      {s.name[0]}
                    </div>
                    <span className="font-medium text-slate-900">{s.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right text-slate-700 font-medium">{s.submissions}</td>
                <td className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${s.passRate}%`,
                          backgroundColor: s.passRate >= 90 ? "#10b981" : s.passRate >= 75 ? "#f59e0b" : "#ef4444",
                        }}
                      />
                    </div>
                    <span className="text-slate-700 font-semibold w-10 text-right">{s.passRate}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <TrendIcon trend={s.trend} />
                </td>
                <td className="px-5 py-3.5 text-slate-400 text-xs">{s.lastSubmission}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
