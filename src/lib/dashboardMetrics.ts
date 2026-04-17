import { brandColors } from "@/config/brand";
import type { ValidationStatusKey } from "@/config/brand";
import type { SubmissionSummary } from "@/lib/types";

export type TrendPoint = { label: string; value: number };

/** Rolling last 7 calendar days (UTC date keys) submission counts. */
export function buildLastSevenDayTrend(submissions: SubmissionSummary[]): TrendPoint[] {
  const buckets: { key: string; label: string; count: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
    buckets.push({ key, label, count: 0 });
  }
  const byKey = new Map(buckets.map((b) => [b.key, b]));
  for (const s of submissions) {
    const k = new Date(s.created_at).toISOString().slice(0, 10);
    const b = byKey.get(k);
    if (b) b.count += 1;
  }
  return buckets.map((b) => ({ label: b.label, value: b.count }));
}

export type OutcomeBar = { label: string; value: number; color: string };

export function buildOutcomeBars(submissions: SubmissionSummary[]): OutcomeBar[] {
  const order: ValidationStatusKey[] = ["PASS", "WARNING", "FAIL", "REVIEW", "ERROR"];
  const counts: Record<ValidationStatusKey, number> = {
    PASS: 0,
    WARNING: 0,
    FAIL: 0,
    REVIEW: 0,
    ERROR: 0,
  };
  for (const s of submissions) {
    const k = s.overall_status;
    if (k in counts) counts[k as ValidationStatusKey] += 1;
  }
  return order
    .filter((k) => counts[k] > 0)
    .map((k) => ({
      label: k.charAt(0) + k.slice(1).toLowerCase(),
      value: counts[k],
      color: brandColors.statusStripe[k],
    }));
}

export function computeDashboardStats(submissions: SubmissionSummary[]) {
  const total = submissions.length;
  const completed = submissions.filter((s) => s.stage === "complete");
  
  let totalParams = 0;
  let passedParams = 0;
  for (const s of completed) {
    if (s.parameter_count > 0) {
      totalParams += s.parameter_count;
      if (s.status_summary?.PASS !== undefined) {
        passedParams += s.status_summary.PASS;
      } else if (s.overall_status === "PASS") {
        passedParams += s.parameter_count; // Fallback
      }
    }
  }
  
  const passRate = totalParams > 0 ? Math.round((passedParams / totalParams) * 100) : 0;
  
  const failed = submissions.filter((s) => s.overall_status === "FAIL" || s.overall_status === "ERROR").length;
  const pendingReview = submissions.filter(
    (s) => s.overall_status === "REVIEW" || s.overall_status === "WARNING",
  ).length;

  const passing = submissions.filter((s) => s.overall_status === "PASS").length;
  const warning = submissions.filter((s) => s.overall_status === "WARNING").length;
  const reviewing = submissions.filter((s) => s.overall_status === "REVIEW").length;
  const failing = submissions.filter((s) => s.overall_status === "FAIL").length;
  const errors = submissions.filter((s) => s.overall_status === "ERROR").length;

  return {
    total,
    passRate,
    failed,
    pendingReview,
    passing,
    warning,
    reviewing,
    failing,
    errors,
    completedCount: completed.length,
  };
}
