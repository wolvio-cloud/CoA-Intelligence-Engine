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
}: {
  status: string;
  productName: string;
  filename: string;
  submissionId: string;
  matchScore: number;
  statusSummary?: StatusSummary;
  header?: any;
}) {
  const key = isStatusKey(status) ? status : "REVIEW";
  const accent = brandColors.statusStripe[key];
  const { title: statusTitle, desc: statusDesc } = STATUS_DESCRIPTIONS[key];
  const matchPct = Math.min(100, (matchScore > 1 ? matchScore / 100 : matchScore) * 100);
  const fileLabel = looksLikeUuidSegment(filename) ? "Uploaded document" : filename;
  const showId = looksLikeUuidSegment(filename) || filename === submissionId;

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04),0_8px_24px_-4px_rgba(15,23,42,0.08)]">
      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${accent}, ${brandColors.blue})` }} />

      <div className="grid lg:grid-cols-12 lg:divide-x lg:divide-slate-100">
        <div className="min-w-0 px-6 py-7 sm:px-8 sm:py-8 lg:col-span-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Validation Summary</span>
            <span className="hidden h-3 w-px bg-slate-200 sm:block" aria-hidden />
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Audit Reference: {submissionId.slice(0, 8).toUpperCase()}</span>
          </div>

          <h2 className="mt-3 text-2xl font-bold tracking-tight text-navy sm:text-[2.25rem] sm:leading-none">
            {productName || "Unknown product"}
          </h2>

          <div className="mt-8 grid grid-cols-1 gap-y-6 gap-x-10 border-t border-slate-100 pt-7 sm:grid-cols-2">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Batch Number</p>
              <p className="mt-1.5 text-sm font-bold text-navy">{header?.batch_number || "—"}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">CoA Date</p>
              <p className="mt-1.5 text-sm font-bold text-navy">{header?.coa_date || "—"}</p>
            </div>
          </div>

          {statusSummary ? (
            <div className="mt-10 border-t border-slate-100 pt-7">
              <div className="flex items-center gap-3">
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Parameter Outcomes</p>
                <div className="h-px flex-1 bg-slate-100/50" />
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                {SUMMARY_ORDER.map((k) => {
                  const n = statusSummary[k];
                  if (n == null || n <= 0) return null;
                  const stripe = brandColors.statusStripe[k];
                  return (
                    <span
                      key={k}
                      className="inline-flex items-center gap-2.5 rounded-xl border border-slate-200/60 bg-white px-4 py-2.5 text-xs font-bold text-navy shadow-sm transition hover:border-slate-300 hover:shadow-md"
                    >
                      <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: stripe }} aria-hidden />
                      <span className="uppercase tracking-tight text-slate-500">{k.toLowerCase()}</span>
                      <span className="tabular-nums text-navy">{n}</span>
                    </span>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>

        <aside className="relative flex flex-col items-center justify-center bg-slate-50/40 px-8 py-10 lg:col-span-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-100/20 to-transparent pointer-events-none" />
          
          <div className="relative w-full text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-slate-400">Lot Disposition</p>
            
            <div className="mt-6 flex flex-col items-center rounded-2xl border border-slate-200/80 bg-white p-8 shadow-[0_4px_12px_rgba(0,0,0,0.03)] transition hover:shadow-lg">
              <StatusBadge status={status} />
              
              <div className="mt-6 text-center">
                <p className="text-sm font-bold text-navy">{statusTitle}</p>
                <p className="mt-2 text-[11px] leading-relaxed text-slate-500 max-w-[180px]">
                  {statusDesc}
                </p>
              </div>
            </div>
            
            <p className="mt-6 text-[10px] font-medium text-slate-400 italic">
              * AI-assisted release decision support
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
