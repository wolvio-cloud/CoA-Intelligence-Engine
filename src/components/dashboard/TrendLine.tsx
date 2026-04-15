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
  const W = 340;
  const H = 100;
  const pad = { top: 10, right: 12, bottom: 24, left: 32 };
  const innerW = W - pad.left - pad.right;
  const innerH = H - pad.top - pad.bottom;

  const vals = data.map((d) => d.value);
  const minV = Math.min(...vals);
  const maxV = Math.max(...vals);
  const range = maxV - minV || 1;

  const xStep = innerW / Math.max(data.length - 1, 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * xStep,
    y: pad.top + innerH - ((d.value - minV) / range) * innerH,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${pad.top + innerH} L ${pad.left} ${pad.top + innerH} Z`;

  const yTicks = [minV, Math.round((minV + maxV) / 2), maxV];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/70 p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      <div className="overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ height: 120 }}>
          {yTicks.map((tick) => {
            const y = pad.top + innerH - ((tick - minV) / range) * innerH;
            return (
              <g key={tick}>
                <line x1={pad.left} y1={y} x2={W - pad.right} y2={y} stroke="#f1f5f9" strokeWidth="1" />
                <text x={pad.left - 6} y={y + 4} textAnchor="end" fontSize="9" fill="#94a3b8">
                  {tick}
                </text>
              </g>
            );
          })}
          <path d={areaPath} fill={fillColor} fillOpacity="0.08" />
          <path d={linePath} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          {points.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="3" fill={color} stroke="white" strokeWidth="1.5" />
          ))}
          {data.map((d, i) => (
            <text
              key={i}
              x={points[i].x}
              y={H - 4}
              textAnchor="middle"
              fontSize="9"
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
