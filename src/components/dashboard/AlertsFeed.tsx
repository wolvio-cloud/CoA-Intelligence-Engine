interface Alert {
  id: string;
  type: "warning" | "error" | "info";
  message: string;
  time: string;
  product: string;
}

const ALERTS: Alert[] = [
  { id: "1", type: "error", message: "Impurity limit exceeded", time: "10m ago", product: "Paracetamol IP Lot 42" },
  { id: "2", type: "warning", message: "Microbiology section requires SME review", time: "2h ago", product: "Paracetamol IP Lot 42" },
  { id: "3", type: "warning", message: "Residual solvent ND — verify LOQ", time: "5h ago", product: "Ibuprofen USP RMG" },
  { id: "4", type: "info", message: "New supplier baseline uploaded", time: "1d ago", product: "Aspirin BP" },
];

const alertConfig = {
  error: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700", icon: "text-red-500" },
  warning: { bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700", icon: "text-amber-500" },
  info: { bg: "bg-blue-50", border: "border-blue-200", text: "text-blue-700", icon: "text-blue-500" },
};

function AlertIcon({ type }: { type: "warning" | "error" | "info" }) {
  if (type === "error") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
  if (type === "warning") return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

export function AlertsFeed() {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Alerts & Flags</h3>
          <p className="mt-0.5 text-xs text-slate-400">Issues requiring attention</p>
        </div>
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
          {ALERTS.filter((a) => a.type === "error").length}
        </span>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        {ALERTS.map((alert) => {
          const cfg = alertConfig[alert.type];
          return (
            <div
              key={alert.id}
              className={`rounded-xl border px-3.5 py-3 ${cfg.bg} ${cfg.border}`}
            >
              <div className="flex items-start gap-2.5">
                <span className={`mt-0.5 shrink-0 ${cfg.icon}`}>
                  <AlertIcon type={alert.type} />
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`text-xs font-semibold leading-snug ${cfg.text}`}>{alert.message}</p>
                  <p className="mt-0.5 text-[11px] text-slate-500 truncate">{alert.product}</p>
                </div>
                <span className="shrink-0 text-[10px] text-slate-400">{alert.time}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
