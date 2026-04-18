interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changePositive?: boolean;
  icon: React.ReactNode;
  accent: string;
}

export function StatCard({ label, value, change, changePositive, icon, accent }: StatCardProps) {
  const showDelta = change != null && change !== "";

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 transition-all hover:border-slate-300">
      <div className="flex items-center gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ring-1 ring-inset ring-slate-200/50"
          style={{ backgroundColor: `${accent}08`, color: accent }}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{label}</p>
          <div className="flex items-baseline gap-2 mt-0.5">
            <h3 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h3>
            {showDelta && (
              <span
                className={`inline-flex items-center gap-0.5 text-xs font-bold ${
                  changePositive ? "text-emerald-600" : "text-red-600"
                }`}
              >
                {changePositive ? "+" : ""}{change}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
