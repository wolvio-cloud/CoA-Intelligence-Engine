import type { CoaJobResult, SubmissionSummary } from "./types";

/**
 * `/submissions` often includes QC fields before `/result` is updated (or older APIs omit them on result).
 * Prefer `result` when present; otherwise fall back to the list-row summary.
 */
export function mergeListQcWithResult(
  submission: SubmissionSummary,
  result: CoaJobResult,
): {
  disposition: string | null;
  manager_signed_at: string | null;
  manager_notes: string | null;
  manager_name: string | null;
  approval_status: string | null;
  analyst_acknowledged_at: string | null;
} {
  return {
    disposition: result.disposition ?? submission.disposition ?? null,
    manager_signed_at: result.manager_signed_at ?? submission.manager_signed_at ?? null,
    manager_notes: result.manager_notes ?? submission.manager_notes ?? null,
    manager_name: result.manager_name ?? submission.manager_name ?? null,
    approval_status: result.approval_status ?? submission.approval_status ?? null,
    analyst_acknowledged_at:
      result.analyst_acknowledged_at ?? submission.analyst_acknowledged_at ?? null,
  };
}

/** QC sign-off is done — hide the disposition form and show read-only details. */
export function isDispositionAlreadySubmitted(input: {
  disposition?: string | null;
  manager_signed_at?: string | null;
  approval_status?: string | null;
}): boolean {
  if (input.manager_signed_at) return true;
  const disp = (input.disposition || "").trim();
  if (disp.length > 0) return true;
  const st = (input.approval_status || "").toUpperCase().trim();
  return ["RELEASED", "HELD", "REJECTED"].includes(st);
}

export function dispositionDecisionLabel(
  disposition?: string | null,
  approval_status?: string | null,
): string {
  const d = (disposition || "").toUpperCase().trim();
  if (d === "RELEASE") return "Release";
  if (d === "HOLD") return "Hold";
  if (d === "REJECT") return "Reject";
  const a = (approval_status || "").toUpperCase().trim();
  if (a === "RELEASED") return "Release";
  if (a === "HELD" || a === "HOLD") return "Hold";
  if (a === "REJECTED") return "Reject";
  return "—";
}
