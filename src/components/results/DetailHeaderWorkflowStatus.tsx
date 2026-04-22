"use client";

import { dispositionDecisionLabel } from "@/lib/qcDisposition";

/** Single-line workflow status (AI analysis → QC → disposition), e.g. Recent CoA detail and New CoA results. */
export function DetailHeaderWorkflowStatus({
  analystAcknowledgedAt,
  isDispositionCompleted,
  disposition,
  approvalStatus,
}: {
  analystAcknowledgedAt: string | null | undefined;
  isDispositionCompleted: boolean;
  disposition: string | null;
  approvalStatus: string | null;
}) {
  if (isDispositionCompleted) {
    const label = dispositionDecisionLabel(disposition, approvalStatus);
    const display =
      label !== "—"
        ? label
        : (approvalStatus || "Submitted").replace(/_/g, " ");
    const lower = display.toLowerCase();
    const tone = lower.includes("reject")
      ? "text-rose-700"
      : lower.includes("hold")
        ? "text-amber-700"
        : "text-emerald-700";
    return (
      <p className="max-w-[min(100%,280px)] text-right text-[11px] leading-snug text-slate-600 sm:max-w-[320px] sm:text-left">
        <span className="font-semibold text-slate-500">Disposition Decision:</span>{" "}
        <span className={`font-bold ${tone}`}>{display}</span>
      </p>
    );
  }
  if (analystAcknowledgedAt) {
    return (
      <p className="max-w-[min(100%,280px)] text-right text-[11px] leading-snug text-slate-600 sm:max-w-[320px] sm:text-left">
        <span className="font-semibold text-slate-500">QC:</span>{" "}
        <span className="font-bold text-amber-700">Pending</span>
      </p>
    );
  }
  return (
    <p className="max-w-[min(100%,280px)] text-right text-[11px] leading-snug text-slate-600 sm:max-w-[320px] sm:text-left">
      <span className="font-semibold text-slate-500">AI Analysis:</span>{" "}
      <span className="font-bold text-emerald-700">Complete</span>
    </p>
  );
}
