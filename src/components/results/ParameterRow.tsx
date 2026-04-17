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
      <td className="max-w-[12rem] truncate px-4 py-4 text-xs text-brand-slate sm:px-5 lg:text-[11px]" title={param.method ?? ""}>
        {param.method ?? "—"}
      </td>
      <td className="max-w-[min(100%,28rem)] px-4 py-4 text-sm leading-snug text-navy sm:px-5 lg:text-[12px]">
        {param.result_value}
      </td>
      <td className="px-4 py-4 sm:px-5">
        <StatusBadge status={param.validation_status} />
      </td>
    </tr>
  );
}