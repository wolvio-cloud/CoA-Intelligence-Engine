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
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-xl"
          style={{ backgroundColor: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
        {showDelta ? (
          <span
            className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
              changePositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-red-50 text-red-600"
            }`}
          >
            {changePositive ? (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M18 15l-6-6-6 6" />
              </svg>
            ) : (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
                <path d="M6 9l6 6 6-6" />
              </svg>
            )}
            {change}
          </span>
        ) : null}
      </div>
      <div className="mt-4">
        <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
        <p className="mt-1.5 text-sm text-slate-500">{label}</p>
      </div>
    </div>
  );
}
