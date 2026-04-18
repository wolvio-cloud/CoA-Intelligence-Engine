import type { CoaParameter } from "@/lib/types";
import { brandColors } from "@/config/brand";
import { StatusBadge } from "./StatusBadge";

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
  return (
    <tr
      onClick={() => onSelect(param)}
      role="button"
      className={`group cursor-pointer transition-colors ${
        selected
          ? "bg-slate-50/80"
          : "hover:bg-slate-50/40"
      }`}
    >
      <td
        className={`px-6 py-4 text-[13px] font-bold text-slate-900 ${selected ? "text-brand-indigo" : ""}`}
      >
        {param.name}
      </td>
      <td className="max-w-[12rem] truncate px-6 py-4 text-[11px] font-bold uppercase tracking-wider text-slate-400" title={param.method ?? ""}>
        {param.method ?? "—"}
      </td>
      <td className="max-w-[min(100%,28rem)] px-6 py-4 text-[13px] font-bold text-slate-700 tabular-nums">
        {param.result_value}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={param.validation_status} />
      </td>
    </tr>
  );
}