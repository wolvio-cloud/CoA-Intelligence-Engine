import type { CoaParameter } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function ParameterDetail({
  param,
  onClose,
}: {
  param: CoaParameter | null;
  onClose: () => void;
}) {
  if (!param) {
    return (
      <div className="flex min-h-[260px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/40 px-6 py-10 text-center">
        <p className="text-sm font-medium text-navy">No selection</p>
        <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-slate-500">
          Choose a row in the table to view specification context and notes.
        </p>
      </div>
    );
  }

  const bracket =
    [
      param.spec_limit.min_value != null ?` Minimum: ${param.spec_limit.min_value}` : null,
      param.spec_limit.max_value != null ? `Maximum: ${param.spec_limit.max_value}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  const specDisplay =
    param.spec_limit.text ?? (bracket || "Qualitative specification");

  return (
    <div className="flex h-full min-h-[320px] flex-col rounded-lg border border-slate-200/90 bg-white shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-slate-400">Detail</p>
          <h3 className="mt-1.5 text-[15px] font-semibold leading-snug text-navy">{param.name}</h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="shrink-0 rounded-md px-2 py-1 text-xs font-medium text-slate-500 transition hover:bg-slate-100 hover:text-navy"
        >
          Clear
        </button>
      </div>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Observed</p>
            <p className="mt-1 text-sm leading-relaxed text-navy">{param.result_value}</p>
          </div>
          <div>
            <p className="text-[11px] font-medium text-slate-400">Unit</p>
            <p className="mt-1 text-sm text-navy">{param.unit ?? "—"}</p>
          </div>
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400">Specification</p>
          <p className="mt-1.5 rounded-md border border-slate-200/80 bg-brand-light px-3 py-2.5 text-sm leading-relaxed text-navy">
            {specDisplay}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">Status</span>
          <StatusBadge status={param.validation_status} />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-400">Extraction confidence</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-brand-light">
            <div
              className="h-full rounded-full bg-brand-blue"
              style={{ width: `${Math.round(param.confidence * 100)}%` }}
            />
          </div>
          <p className="mt-1.5 text-right font-mono text-[11px] tabular-nums text-slate-500">
            {(param.confidence * 100).toFixed(1)}%
          </p>
        </div>
        {param.notes ? (
          <div>
            <p className="text-[11px] font-medium text-slate-400">Notes</p>
            <p className="mt-1.5 text-sm leading-relaxed text-brand-slate">{param.notes}</p>
          </div>
        ) : null}
      </div>
    </div>
  );
}