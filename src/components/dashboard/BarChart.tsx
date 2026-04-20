"use client";

interface BarChartProps {
  data: { label: string; value: number; color: string }[];
  max?: number;
  title: string;
  subtitle?: string;
  onBarClick?: (label: string) => void;
}

export function BarChart({ data, max, title, subtitle, onBarClick }: BarChartProps) {
  const maxVal = max ?? Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col h-full">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
        )}
      </div>

      {/* Chart */}
      <div className="flex items-end justify-between gap-2 h-40 mt-auto flex-1 w-full">
        {data.map((item) => {
          const pct = maxVal > 0 ? (item.value / maxVal) * 100 : 0;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => onBarClick?.(item.label)}
              className={`group flex flex-1 flex-col items-center gap-2 h-full justify-end rounded transition ${
                onBarClick ? "cursor-pointer hover:opacity-75" : ""
              }`}
            >
              {/* Bar container */}
              <div
                className="relative w-full max-w-[40px] flex flex-col justify-end items-center"
                style={{ height: "100px" }}
              >
                {/* Tooltip */}
                <div className="absolute bottom-full mb-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-slate-900 text-white rounded px-2 py-1 text-[10px] font-bold z-10 pointer-events-none whitespace-nowrap">
                  {item.value} {item.label}
                </div>

                {/* Bar */}
                <div
                  className="w-full rounded-t-[4px] transition-all duration-200 group-hover:brightness-110"
                  style={{
                    height: `${Math.max(pct, 4)}%`,
                    backgroundColor: item.color,
                  }}
                />
              </div>

              {/* Label */}
              <span className="text-[10px] font-bold text-slate-400 text-center uppercase tracking-wider mt-1 truncate w-full px-1">
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}