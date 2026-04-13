import { brandColors } from "@/config/brand";
import type { ValidationStatusKey } from "@/config/brand";
import { StatusBadge } from "./StatusBadge";

const keys: ValidationStatusKey[] = ["PASS", "WARNING", "FAIL", "REVIEW", "ERROR"];

function isStatusKey(s: string): s is ValidationStatusKey {
  return keys.includes(s as ValidationStatusKey);
}

export function OverallStatus({
  status,
  productName,
  filename,
  matchScore,
}: {
  status: string;
  productName: string;
  filename: string;
  matchScore: number;
}) {
  const key = isStatusKey(status) ? status : "REVIEW";
  const accent = brandColors.statusStripe[key];
  return (
    <div
      className="rounded-lg border border-slate-200/90 bg-white p-6 shadow-card sm:p-7"
      style={{ borderLeftWidth: "3px", borderLeftColor: accent }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-brand-slate">
            Batch summary
          </p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-navy sm:text-2xl lg:text-[1.75rem] lg:leading-tight">
            {productName}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-brand-slate lg:text-base">
            <span className="font-mono text-[12px] text-navy lg:text-sm">{filename}</span>
            <span className="text-slate-400"> · </span>
            Product match score {(matchScore * 100).toFixed(1)}%
          </p>
        </div>
        <div className="flex shrink-0 flex-col gap-2 border-t border-slate-100 pt-4 lg:border-t-0 lg:border-l lg:pl-8 lg:pt-0">
          <span className="text-[11px] font-medium uppercase tracking-wider text-brand-slate">
            Outcome
          </span>
          <StatusBadge status={status} />
        </div>
      </div>
    </div>
  );
}