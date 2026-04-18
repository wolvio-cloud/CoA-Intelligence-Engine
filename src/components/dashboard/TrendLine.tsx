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
    <div className="bg-white rounded-lg border border-slate-200 p-6 flex flex-col h-full">
      <div className="mb-4">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">{title}</h3>
        {subtitle && <p className="mt-1 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="overflow-visible flex-1 w-full relative">
        <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-[100%] h-[160px] md:h-[180px]">
          {yTicks.map((tick, i) => {
            const y = pad.top + innerH - ((tick - minV) / range) * innerH;
            return (
              <g key={`grid-${i}`}>
                <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={pad.left - 12} y={y + 3} textAnchor="end" fontSize="10" fontWeight="600" fill="#94a3b8">
                  {tick}
                </text>
              </g>
            );
          })}

          <path d={areaPath} fill={color} fillOpacity="0.03" />
          
          <path d={linePath} fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />

          {points.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="12" fill="transparent" />
              <circle cx={p.x} cy={p.y} r="3" fill="white" stroke={color} strokeWidth="1.5" className="transition-all opacity-0 group-hover:opacity-100" />
            </g>
          ))}

          {data.map((d, i) => (
            <text
              key={i}
              x={points[i].x}
              y={H - 2}
              textAnchor="middle"
              fontSize="10"
              fontWeight="600"
              fill="#94a3b8"
              className="uppercase tracking-wider"
            >
              {d.label}
            </text>
          ))}
        </svg>
      </div>
    </div>
  );
}
