"use client";

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  max?: number;
  title: string;
  subtitle?: string;
}

export function BarChart({ data, max, title, subtitle }: BarChartProps) {
  const maxVal = max ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="flex items-end gap-2.5 h-40">
        {data.map((item) => {
          const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
          return (
            <div key={item.label} className="flex flex-1 flex-col items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-700">{item.value}</span>
              <div className="relative w-full flex items-end" style={{ height: "100px" }}>
                <div
                  className="w-full rounded-t-lg transition-all duration-500"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    backgroundColor: item.color,
                    opacity: 0.85,
                  }}
                />
              </div>
              <span className="text-[10px] text-slate-400 text-center leading-tight">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
