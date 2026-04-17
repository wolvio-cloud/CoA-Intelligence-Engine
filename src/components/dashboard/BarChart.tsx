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
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-end justify-between gap-3 h-40 mt-auto flex-1 w-full px-2">
        {data.map((item) => {
          const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;
          return (
            <div key={item.label} className="group relative flex flex-1 flex-col items-center gap-2 cursor-pointer h-full justify-end">
              
              {/* Tooltip on Hover */}
              <div className="absolute -top-10 scale-0 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-300 z-10 bg-slate-900 text-white rounded-lg px-2.5 py-1 text-xs font-bold shadow-lg pointer-events-none whitespace-nowrap">
                {item.value} {item.label}
              </div>

              <span className="text-[13px] font-bold text-slate-700 transition-transform duration-300 group-hover:-translate-y-1">{item.value}</span>
              
              <div className="relative w-full max-w-[48px] flex flex-col justify-end items-center" style={{ height: "100px" }}>
                <div
                  className="w-full rounded-full transition-all duration-500 ease-out group-hover:w-[110%] group-hover:shadow-[0_0_15px_rgba(0,0,0,0.15)] relative overflow-hidden flex flex-col justify-end"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    background: `linear-gradient(180deg, ${item.color} 0%, ${item.color}33 100%)`,
                    borderTop: `2px solid ${item.color}`,
                    opacity: 0.9,
                  }}
                >
                  <div className="w-full h-1 bg-white/30 rounded-full mt-1 mx-auto" style={{ width: '40%' }} />
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400 text-center leading-tight mt-1 uppercase tracking-wider">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
