import { brandColors } from "@/config/brand";
import type { ValidationStatusKey } from "@/config/brand";
import { StatusBadge } from "./StatusBadge";
import type { StatusSummary } from "@/lib/types";

const keys: ValidationStatusKey[] = ["PASS", "WARNING", "FAIL", "REVIEW", "ERROR"];

function isStatusKey(s: string): s is ValidationStatusKey {
  return keys.includes(s as ValidationStatusKey);
}

function looksLikeUuidSegment(name: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}(\.|$)/i.test(name.trim());
}

const SUMMARY_ORDER: ValidationStatusKey[] = ["PASS", "WARNING", "FAIL", "REVIEW", "ERROR"];

export function OverallStatus({
  status,
  productName,
  filename,
  submissionId,
  matchScore,
  statusSummary,
}: {
  status: string;
  productName: string;
  filename: string;
  submissionId: string;
  matchScore: number;
  statusSummary?: StatusSummary;
}) {
  const key = isStatusKey(status) ? status : "REVIEW";
  const accent = brandColors.statusStripe[key];
  const matchPct = Math.min(100, (matchScore > 1 ? matchScore / 100 : matchScore) * 100);
  const fileLabel = looksLikeUuidSegment(filename) ? "Uploaded document" : filename;
  const showId = looksLikeUuidSegment(filename) || filename === submissionId;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.08)]">
      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${brandColors.blue})` }} />

      <div className="grid lg:grid-cols-12 lg:divide-x lg:divide-slate-100">
        <div className="min-w-0 px-6 py-7 sm:px-8 sm:py-8 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Validation summary</span>
            <span className="hidden h-3 w-px bg-slate-200 sm:block" aria-hidden />
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">CoA review</span>
          </div>

          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-[1.75rem] sm:leading-tight">
            {productName || "Unknown product"}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex max-w-full items-center rounded-md border border-slate-200/90 bg-slate-50/90 px-2.5 py-1 text-xs font-medium text-slate-800">
              <span className="truncate" title={filename}>
                {fileLabel}
              </span>
            </span>
            {showId ? (
              <code
                className="rounded-md border border-slate-100 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-500"
                title={submissionId}
              >
                {submissionId.slice(0, 8)}…{submissionId.slice(-4)}
              </code>
            ) : null}
          </div>

          <div className="mt-8 max-w-xl">
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-xs font-medium text-slate-500">Catalogue match</span>
              <span className="text-sm font-semibold tabular-nums text-navy">{matchPct.toFixed(1)}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full transition-[width] duration-700 ease-out"
                style={{
                  width: `${matchPct}%`,
                  background: `linear-gradient(90deg, ${brandColors.navy}, ${brandColors.blue})`,
                }}
              />
            </div>
            <p className="mt-2.5 text-xs leading-relaxed text-slate-500">
              Textual alignment between this CoA and your product catalogue. Lower scores still list every test for
              qualified-person review.
            </p>
          </div>

          {statusSummary ? (
            <div className="mt-8 border-t border-slate-100 pt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Parameter outcomes</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {SUMMARY_ORDER.map((k) => {
                  const n = statusSummary[k];
                  if (n == null || n <= 0) return null;
                  const stripe = brandColors.statusStripe[k];
                  return (
                    <span
                      key={k}
                      className="inline-flex items-center gap-2 rounded-md border border-slate-200/80 bg-white px-2.5 py-1.5 text-xs font-medium text-navy shadow-sm"
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: stripe }} aria-hidden />
                      <span className="uppercase tracking-wide text-slate-600">{k.toLowerCase()}</span>
                      <span className="tabular-nums text-slate-900">{n}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="flex flex-col justify-between gap-6 bg-slate-50/50 px-6 py-7 sm:px-8 sm:py-8 lg:col-span-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-400">Lot disposition</p>
            <p className="mt-1 text-xs text-slate-500">Release decision support — not a final batch disposition.</p>
            <div className="mt-5 inline-flex flex-col items-start gap-2 rounded-xl border border-slate-200/80 bg-white p-4 shadow-sm">
              <StatusBadge status={status} />
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-500">
            Open the parameters grid to inspect each test against specification limits and captured notes.
          </p>
        </aside>
      </div>
    </div>
  );
}
