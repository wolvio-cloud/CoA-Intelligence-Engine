import type { CoaParameter } from "@/lib/types";
import { brandColors } from "@/config/brand";
import { StatusBadge } from "./StatusBadge";

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  return (
    <div className="h-2 w-full max-w-[120px] overflow-hidden rounded-full bg-brand-light lg:max-w-[140px]">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pct}%`, backgroundColor: brandColors.blue, opacity: 0.88 }}
      />
    </div>
  );
}

export function ParameterRow({
  param,
  selected,
  zebra,
  onSelect,
}: {
  param: CoaParameter;
  selected: boolean;
  zebra?: boolean;
  onSelect: (p: CoaParameter) => void;
}) {
  const specBracket = [
    param.spec_limit.min_value != null ? `≥ ${param.spec_limit.min_value}` : null,
    param.spec_limit.max_value != null ? `≤ ${param.spec_limit.max_value}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const specCell = param.spec_limit.text ?? (specBracket || "—");

  return (
    <tr
      onClick={() => onSelect(param)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(param);
        }
      }}
      tabIndex={0}
      role="button"
      className={`cursor-pointer transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-blue-400/30 ${
        selected
          ? "bg-sky-50/90 ring-1 ring-inset ring-blue-200/60"
          : zebra
            ? "bg-slate-50/40 hover:bg-sky-50/40"
            : "hover:bg-slate-50/80"
      }`}
    >
      <td
        className={`px-4 py-4 text-sm leading-snug text-navy sm:px-5 lg:text-[12px] ${selected ? "border-l-[3px] border-l-navy" : "border-l-[3px] border-l-transparent"}`}
      >
        {param.name}
      </td>
      <td className="max-w-[min(100%,28rem)] px-4 py-4 text-sm leading-snug text-navy sm:px-5 lg:text-[12px]">
        {param.result_value}
      </td>
      <td className="px-4 py-4 text-sm text-brand-slate sm:px-5 lg:text-[12px]">{param.unit ?? "—"}</td>
      <td className="hidden px-4 py-4 text-sm text-brand-slate sm:px-5 lg:table-cell lg:text-[12px]">
        {specCell}
      </td>
      <td className="px-4 py-4 sm:px-5">
        <StatusBadge status={param.validation_status} />
      </td>
      <td className="px-4 py-4 sm:px-5">
        <div className="flex items-center gap-3">
          <ConfidenceBar value={param.confidence} />
          <span className="w-10 text-right font-mono text-xs tabular-nums text-slate-500 lg:text-sm">
            {Math.round(param.confidence * 100)}
          </span>
        </div>
      </td>
    </tr>
  );
}