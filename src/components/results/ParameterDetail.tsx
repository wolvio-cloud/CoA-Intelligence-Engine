import type { ReactNode } from "react";
import type { CoaParameter } from "@/lib/types";
import { brandColors } from "@/config/brand";
import { StatusBadge } from "./StatusBadge";

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-50 py-3.5 last:border-0 sm:flex-row sm:items-start sm:gap-6">
      <dt className="shrink-0 w-24 text-[10px] font-bold uppercase tracking-widest text-slate-400 pt-0.5">{label}</dt>
      <dd className="min-w-0 text-[13px] font-bold text-slate-900">{children}</dd>
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
      <div className="flex min-h-[280px] flex-col items-center justify-center rounded-lg border border-dashed border-slate-200 bg-slate-50/30 px-6 py-12 text-center">
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded bg-white border border-slate-200 text-slate-300 ring-1 ring-inset ring-slate-100 shadow-sm">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" />
          </svg>
        </div>
        <p className="text-sm font-bold text-slate-900 tracking-tight">Select Parameter</p>
        <p className="mt-2 max-w-[200px] text-xs font-medium text-slate-400 leading-relaxed">
          Select a test parameter from the table to view its detailed documentation results.
        </p>
      </div>
    );
  }

  const bracket = [
    param.spec_limit.min_value != null ? `Min: ${param.spec_limit.min_value}` : null,
    param.spec_limit.max_value != null ? `Max: ${param.spec_limit.max_value}` : null,
  ]
    .filter(Boolean)
    .join(" · ");
  const specDisplay = param.spec_limit.text ?? (bracket || "Qualitative standard");
  const confidencePercent = Math.round(param.confidence * 100);

  return (
    <div className="flex flex-col h-full bg-slate-50 border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <header className="px-6 py-5 bg-white border-b border-slate-100">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide">Parameter Identity</p>
            <h3 className="mt-2 text-xl font-bold tracking-tight text-slate-900">{param.name}</h3>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <StatusBadge status={param.validation_status} />
            <button
              type="button"
              onClick={onClose}
              className="rounded-sm border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-colors"
              title="Close panel"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-[11px] font-semibold text-slate-400 tracking-wide">Observed Result</p>
          <div className="mt-2 text-center items-baseline gap-2">
            <span className="text-3xl font-bold text-slate-900 tabular-nums">{param.result_value}</span>
            {param.unit ? (
              <span className="text-[11px] font-semibold text-slate-400 tracking-wide ml-1.5">{param.unit}</span>
            ) : null}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-[11px] font-semibold text-slate-400 tracking-wide mb-4">Verification Context</p>
          <dl className="space-y-0">
            <Row label="Method">{param.method ?? "—"}</Row>
            <Row label="Specification">{specDisplay}</Row>
            <Row label="Detection">{param.id.slice(0, 12).toUpperCase()}</Row>
            <Row label="Certainty">
              <div className="flex flex-col gap-2 pt-1.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-slate-900 tabular-nums">{confidencePercent}% System Confidence</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-brand-emerald rounded-sm shadow-[0_0_8px_rgba(16,185,129,0.1)]"
                    style={{ width: `${confidencePercent}%` }}
                  />
                </div>
              </div>
            </Row>
          </dl>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-5">
          <p className="text-[11px] font-semibold text-slate-400 tracking-wide">Technical Notes</p>
          <p className="mt-3 text-[13px] font-medium leading-relaxed text-slate-600">
            {param.notes ??
              "No extraction anomalies detected. Data matches target document segments."}
          </p>
        </div>
      </div>
    </div>
  );
}
