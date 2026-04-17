import type { ReactNode } from "react";
import type { CoaParameter } from "@/lib/types";
import { brandColors } from "@/config/brand";
import { StatusBadge } from "./StatusBadge";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 gap-1 border-b border-slate-100 py-3 last:border-0 sm:grid-cols-[minmax(0,7rem)_1fr] sm:gap-4 sm:py-3.5">
      <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="min-w-0 text-sm text-navy">{children}</dd>
    </div>
  );
}

export function ParameterDetail({
  param,
  onClose,
}: {
  param: CoaParameter | null;
  onClose: () => void;
}) {
  if (!param) {
    return (
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200/90 bg-slate-50/30 px-6 py-12 text-center">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-navy">No row selected</p>
        <p className="mt-2 max-w-[240px] text-xs leading-relaxed text-slate-500">
          Select a test in the parameters table to view specification context, confidence, and notes.
        </p>
      </div>
    );
  }

  const bracket = [
    param.spec_limit.min_value != null ? `Minimum: ${param.spec_limit.min_value}` : null,
    param.spec_limit.max_value != null ? `Maximum: ${param.spec_limit.max_value}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const specDisplay = param.spec_limit.text ?? (bracket || "Qualitative specification");
  const confidencePercent = Math.round(param.confidence * 100);

  return (
    <div className="flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.06)]">
      <div className="border-b border-slate-100 bg-slate-50/80 px-5 py-4 sm:px-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Parameter</p>
            <h3 className="mt-1.5 text-lg font-semibold leading-snug tracking-tight text-navy sm:text-xl">{param.name}</h3>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <StatusBadge status={param.validation_status} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-y-auto px-5 py-5 sm:px-6">
        <div className="rounded-xl border border-slate-200/80 bg-slate-50/50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Observed result</p>
          <div className="mt-2 flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className="text-2xl font-semibold tracking-tight text-navy sm:text-[1.65rem]">{param.result_value}</span>
            {param.unit ? (
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">{param.unit}</span>
            ) : null}
          </div>
        </div>

        <dl className="mt-5 rounded-xl border border-slate-100 bg-white px-4 sm:px-5">
          <Row label="Method">{param.method ?? "—"}</Row>
          <Row label="Specification">{specDisplay}</Row>
          {(param.spec_limit.min_value != null || param.spec_limit.max_value != null) && (
            <Row label="Limits">
              <div className="flex flex-wrap gap-3">
                {param.spec_limit.min_value != null ? (
                  <span className="rounded-md bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                    Min {param.spec_limit.min_value}
                  </span>
                ) : null}
                {param.spec_limit.max_value != null ? (
                  <span className="rounded-md bg-slate-50 px-2 py-1 font-mono text-xs text-slate-700">
                    Max {param.spec_limit.max_value}
                  </span>
                ) : null}
              </div>
            </Row>
          )}
          <Row label="Unit">{param.unit ?? "—"}</Row>
          <Row label="Extraction ID">
            <code className="text-xs text-slate-600">{param.id}</code>
          </Row>
          <Row label="Confidence">
            <div className="flex max-w-xs flex-col gap-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium tabular-nums text-slate-600">{confidencePercent}%</span>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${confidencePercent}%`, backgroundColor: brandColors.blue }}
                />
              </div>
            </div>
          </Row>
        </dl>

        <div className="mt-5 rounded-xl border border-slate-200/80 bg-white p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Notes</p>
          <p className="mt-2 text-sm leading-relaxed text-slate-700">
            {param.notes ??
              "No notes were captured for this parameter. If the reading looks unexpected, verify against the source CoA image or lab record."}
          </p>
        </div>
      </div>
    </div>
  );
}
