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
const STATUS_DESCRIPTIONS: Record<ValidationStatusKey, { title: string; desc: string }> = {
  PASS: {
    title: "Clear for Release",
    desc: "All extracted parameters conform to specifications. Document matches catalog standards.",
  },
  WARNING: {
    title: "Caution Advised",
    desc: "One or more parameters are near-limit or require secondary verification.",
  },
  FAIL: {
    title: "Quarantine Required",
    desc: "Critical parameters have failed validation. Do not release until internal review.",
  },
  REVIEW: {
    title: "Pending SME Review",
    desc: "System was unable to definitively validate all parameters. Manual sign-off required.",
  },
  ERROR: {
    title: "Extraction Failed",
    desc: "The document structure was irregular. Please re-upload or process manually.",
  },
};

export function OverallStatus({
  status,
  productName,
  filename,
  submissionId,
  matchScore,
  statusSummary,
  header,
  onAcknowledge,
  isAcknowledged,
  showAcknowledgeButton,
}: {
  status: string;
  productName: string;
  filename: string;
  submissionId: string;
  matchScore: number;
  statusSummary?: StatusSummary;
  header?: any;
  onAcknowledge?: () => void;
  isAcknowledged?: boolean;
  showAcknowledgeButton?: boolean;
}) {
  const key = isStatusKey(status) ? status : "REVIEW";
  const { title: statusTitle, desc: statusDesc } = STATUS_DESCRIPTIONS[key];
  const fileLabel = looksLikeUuidSegment(filename) ? "Uploaded document" : filename;

  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="grid lg:grid-cols-12">
        <div className="min-w-0 px-8 py-8 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">Analysis Summary</span>
            <div className="h-3 w-px bg-slate-200" />
            <span className="text-[11px] font-semibold text-slate-400 tracking-wide">
              Ref: {submissionId.slice(0, 8).toUpperCase()}
            </span>
          </div>

          <h2 className="mt-4 text-3xl font-bold tracking-tight text-slate-900 leading-tight">
            {productName || "Unknown Product"}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-y-6 gap-x-12 border-y border-slate-100 py-8 sm:grid-cols-2">
            <div>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wide">Batch Number</p>
              <p className="mt-1 text-[15px] font-bold text-slate-900">{header?.batch_number || "—"}</p>
            </div>
            <div>
              <p className="text-[11px] font-semibold text-slate-400 tracking-wide">CoA Date</p>
              <p className="mt-1 text-[15px] font-bold text-slate-900">{header?.coa_date || "—"}</p>
            </div>
          </div>

          {statusSummary && (
            <div className="mt-8">
              <div className="flex items-center gap-3">
                <p className="text-[11px] font-semibold text-slate-400 tracking-wide">Parameter Metrics</p>
                <div className="h-px flex-1 bg-slate-100" />
              </div>
              <div className="mt-5 flex flex-wrap gap-2.5">
                {SUMMARY_ORDER.map((k) => {
                  const n = statusSummary[k];
                  if (n == null || n <= 0) return null;
                  const stripe = brandColors.statusStripe[k];
                  return (
                    <span
                      key={k}
                      className="inline-flex items-center gap-2.5 rounded border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold ring-1 ring-inset ring-slate-100"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-sm" style={{ backgroundColor: stripe }} />
                      <span className="text-slate-500">{k.charAt(0) + k.slice(1).toLowerCase()}</span>
                      <span className="text-slate-900">{n}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <aside className="relative flex flex-col items-center justify-center bg-slate-50/30 px-8 py-10 lg:col-span-4 border-l border-slate-100">
          <div className="relative w-full text-center">
            <p className="text-[11px] font-semibold text-slate-400 tracking-wide">Compliance Status</p>

            <div className="mt-8 flex flex-col items-center rounded-lg border border-slate-200 bg-white p-8">
              <StatusBadge status={status} />

              <div className="mt-6 text-center">
                <p className="text-sm font-bold text-slate-900 tracking-tight">{statusTitle}</p>
                <p className="mt-2 text-[12px] leading-relaxed text-slate-500 font-medium">
                  {statusDesc}
                </p>
              </div>
            </div>

            {showAcknowledgeButton && !isAcknowledged && (
              <button
                type="button"
                onClick={onAcknowledge}
                className="mt-6 flex w-full items-center justify-center gap-2 rounded bg-navy py-3 text-[11px] font-bold text-white transition hover:bg-slate-800 active:scale-[0.98]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
                Sign Off
              </button>
            )}

            {isAcknowledged && (
              <div className="mt-6 flex items-center justify-center gap-2 rounded bg-emerald-50 px-4 py-2.5 text-[10px] font-bold text-emerald-700 border border-emerald-100">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Analyst Sign-Off
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
