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
  onSegmentClick?: (label: string) => void;
}

export function DonutChart({ segments, title, subtitle, centerLabel, centerValue, onSegmentClick }: DonutChartProps) {
  const total = segments.reduce((s, seg) => s + seg.value, 0);
  const size = 130;
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
    <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col h-full">
      <div className="mb-6">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-col items-center gap-8 sm:flex-row sm:items-center sm:gap-8 sm:justify-center flex-1">
        <div className="relative shrink-0" style={{ width: size, height: size }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: "rotate(-90deg)", overflow: 'visible' }}>
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
                className="transition-all duration-500"
                style={{ strokeOpacity: 0.9 }}
              />
            ))}
          </svg>
          {(centerLabel || centerValue) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pt-1 pointer-events-none">
              <span className="text-2xl font-bold text-slate-900 leading-none tracking-tight">{centerValue}</span>
              {centerLabel && <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mt-1.5">{centerLabel}</span>}
            </div>
          )}
        </div>
        <div className="flex w-full min-w-0 flex-col gap-2.5 sm:w-auto">
          {segments.map((seg) => (
            <button
              key={seg.label}
              type="button"
              onClick={() => onSegmentClick?.(seg.label)}
              className={`flex items-center gap-3 rounded px-2 py-1 transition ${
                onSegmentClick ? "cursor-pointer hover:bg-slate-50" : ""
              }`}
            >
              <div className="h-2 w-2 rounded-sm shrink-0" style={{ backgroundColor: seg.color }} />
              <span className="text-xs font-semibold text-slate-500 truncate mr-6 uppercase tracking-wider">{seg.label}</span>
              <span className="ml-auto text-xs font-bold text-slate-900 shrink-0">{seg.value}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
