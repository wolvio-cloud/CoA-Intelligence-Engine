"use client";

interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  title: string;
  subtitle?: string;
  centerLabel?: string;
  centerValue?: string | number;
}

export function DonutChart({ segments, title, subtitle, centerLabel, centerValue }: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const size = 140;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativeDist = 0;

  const arcs = segments.map((seg) => {
    const pct = total > 0 ? seg.value / total : 0;
    const dash = circumference * pct;
    const offset = -cumulativeDist;
    cumulativeDist += dash;
    return { ...seg, offset, dash, pct };
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-10 sm:justify-center flex-1">
        <div className="relative shrink-0 transition-transform duration-300 hover:scale-105" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", overflow: 'visible' }}>
            <defs>
              <filter id="donut-shadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="8" stdDeviation="6" floodOpacity="0.1" />
              </filter>
            </defs>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {arcs.map((arc, i) => (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={arc.color}
                strokeWidth={strokeWidth}
                strokeDasharray={`${arc.dash} ${circumference}`}
                strokeDashoffset={arc.offset}
                strokeLinecap="round"
                filter="url(#donut-shadow)"
                className="transition-all duration-700 ease-out cursor-pointer hover:stroke-[28px]"
                style={{ strokeOpacity: 0.95 }}
              />
            ))}
          </svg>
          {(centerLabel || centerValue) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 pointer-events-none">
              <span className="text-2xl font-black text-slate-900 leading-none tracking-tight">{centerValue}</span>
              {centerLabel && <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1">{centerLabel}</span>}
            </div>
          )}
        </div>
        <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto">
          {segments.map((seg) => (
            <div key={seg.label} className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-slate-50 transition-colors">
              <div className="relative flex items-center justify-center shrink-0">
                <div className="h-3.5 w-3.5 rounded-full absolute opacity-20" style={{ backgroundColor: seg.color }} />
                <div className="h-2 w-2 rounded-full relative" style={{ backgroundColor: seg.color }} />
              </div>
              <span className="text-[13px] font-medium text-slate-600 truncate mr-4">{seg.label}</span>
              <span className="ml-auto text-[13px] font-bold text-slate-900 shrink-0">{seg.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
