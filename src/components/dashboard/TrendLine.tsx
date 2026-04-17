"use client";

interface TrendPoint {
  label: string;
  value: number;
}

interface TrendLineProps {
  data: TrendPoint[];
  title: string;
  subtitle?: string;
  color?: string;
  fillColor?: string;
}

export function TrendLine({ data, title, subtitle, color = "#2563eb", fillColor = "#2563eb" }: TrendLineProps) {
  const W = 600;
  const H = 200;
  const pad = { top: 20, right: 30, bottom: 30, left: 40 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const vals = data.map((d) => d.value);
  const minV = Math.min(0, ...vals);
  const maxV = Math.max(1, ...vals);
  const range = maxV - minV || 1;

  const xStep = innerW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + innerH - ((d.value - minV) / range) * innerH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad.top + innerH} L ${pad.left} ${pad.top + innerH} Z`;

  const yTicks = [minV, Math.round(minV + range * 0.33), Math.round(minV + range * 0.66), maxV];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/60 p-6 shadow-sm flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-[15px] font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="mt-1 text-[13px] text-slate-500">{subtitle}</p>}
      </div>
      <div className="overflow-visible flex-1 w-full pl-2 pr-4 pt-2 pb-1 relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-[102%] h-[160px] md:h-[180px] -ml-[1%]">
          <defs>
            <linearGradient id="trendAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={fillColor} stopOpacity="0.10" />
              <stop offset="100%" stopColor={fillColor} stopOpacity="0.0" />
            </linearGradient>
            <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor={color} floodOpacity="0.15" />
            </filter>
          </defs>

          {yTicks.map((tick, i) => {
            const y = pad.top + innerH - ((tick - minV) / range) * innerH;
            return (
              <g key={`grid-${i}`}>
                <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#f8fafc" strokeWidth="2" strokeDasharray="6 6" />
                <text x={pad.left - 12} y={y + 4} textAnchor="end" fontSize="12" fontWeight="600" fill="#cbd5e1">
                  {tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill="url(#trendAreaGradient)" />
          
          <path d={linePath} fill="none" stroke={color} strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" filter="url(#lineGlow)" className="transition-all duration-700 ease-out" />

          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="18" fill="transparent" />
              <circle cx={p.x} cy={p.y} r="5" fill="white" stroke={color} strokeWidth="3" className="transition-all duration-300 group-hover:r-[6.5px] group-hover:stroke-[4px]" />
            </g>
          ))}

          {data.map((d, i) => (
            <text
              key={i}
              x={points[i].x}
              y={H - 2}
              textAnchor="middle"
              fontSize="12"
              fontWeight="600"
              fill="#94a3b8"
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
