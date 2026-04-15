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
      param.spec_limit.min_value != null ? `Minimum: ${param.spec_limit.min_value}` : null,
      param.spec_limit.max_value != null ? `Maximum: ${param.spec_limit.max_value}` : null,
    ]
      .filter(Boolean)
      .join(" · ");
  const specDisplay = param.spec_limit.text ?? (bracket || "Qualitative specification");
  const confidencePercent = Math.round(param.confidence * 100);

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-lg border border-slate-200/90 bg-white shadow-card">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">Parameter detail</p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight text-navy sm:text-2xl">{param.name}</h3>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={param.validation_status} />
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
          >
            Clear
          </button>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-5">
        <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
          <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">Observed result</p>
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-3xl font-semibold tracking-tight text-navy">{param.result_value}</p>
            {param.unit ? (
              <span className="text-sm uppercase tracking-[0.18em] text-slate-500">{param.unit}</span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-600">Parameter</p>
              <p className="text-sm font-semibold text-navy">{param.id}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-600">Extraction confidence</p>
              <p className="text-sm font-semibold text-navy">{confidencePercent}%</p>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
              <div className="h-full rounded-full bg-brand-blue" style={{ width: `${confidencePercent}%` }} />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-600">Units</p>
              <p className="text-sm font-semibold text-navy">{param.unit ?? "Not specified"}</p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
            <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-400">Specification</p>
            <p className="mt-3 text-sm leading-relaxed text-navy">{specDisplay}</p>
            {(param.spec_limit.min_value != null || param.spec_limit.max_value != null) && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {param.spec_limit.min_value != null ? (
                  <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Minimum</p>
                    <p className="mt-1 font-semibold text-navy">{param.spec_limit.min_value}</p>
                  </div>
                ) : null}
                {param.spec_limit.max_value != null ? (
                  <div className="rounded-2xl bg-white p-3 text-sm text-slate-700 shadow-sm">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">Maximum</p>
                    <p className="mt-1 font-semibold text-navy">{param.spec_limit.max_value}</p>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200/80 bg-slate-50 p-5">
            <div className="flex items-center justify-between gap-4">
              <p className="text-sm font-medium text-slate-600">Notes</p>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                {param.notes ? "Included" : "None"}
              </span>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-slate-700">
              {param.notes ?? "No notes were extracted for this parameter. If the result looks unexpected, please review the source document or confirm with the lab."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

