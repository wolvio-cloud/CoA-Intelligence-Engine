"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listSubmissions } from "@/lib/api";
import { StatCard } from "@/components/dashboard/StatCard";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import type { SubmissionSummary } from "@/lib/types";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200/70 bg-white py-20 text-center shadow-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-4">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-slate-700">No submissions yet</p>
      <p className="mt-1 text-xs text-slate-400">Submit your first CoA to see analytics here</p>
    </div>
  );
}

function LoadingDashboard() {
  return (
    <div className="flex items-center justify-center rounded-2xl border border-slate-200/70 bg-white py-20 shadow-sm">
      <div className="flex flex-col items-center gap-3 text-slate-400">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        <p className="text-sm">Loading your dashboard…</p>
      </div>
    </div>
  );
}

function deriveStats(submissions: SubmissionSummary[]) {
  const total = submissions.length;
  const completed = submissions.filter((s) => s.stage === "complete");
  const passing = completed.filter((s) => s.overall_status === "PASS").length;
  const failing = completed.filter((s) => s.overall_status === "FAIL").length;
  const reviewing = completed.filter((s) => s.overall_status === "REVIEW").length;
  const warning = completed.filter((s) => s.overall_status === "WARNING").length;
  const passRate = completed.length > 0 ? Math.round((passing / completed.length) * 100) : 0;

  const donutSegments = [
    { label: "Pass", value: passing, color: "#10b981" },
    { label: "Warning", value: warning, color: "#f59e0b" },
    { label: "Review", value: reviewing, color: "#06b6d4" },
    { label: "Fail", value: failing, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  return { total, passRate, failing, reviewing, donutSegments };
}

export function DashboardPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    listSubmissions()
      .then((items) => { if (!cancelled) setSubmissions(items); })
      .catch(() => { if (!cancelled) setSubmissions([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "there";
  const greeting = getGreeting();

  if (loading) return <LoadingDashboard />;

  const { total, passRate, failing, reviewing, donutSegments } = deriveStats(submissions);
  const recent = [...submissions]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{greeting}, {displayName}</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Here&apos;s a summary of your CoA activity
        </p>
      </div>

      {total === 0 ? (
        <EmptyDashboard />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <StatCard
              label="Total Submissions"
              value={String(total)}
              accent="#2563eb"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              }
            />
            <StatCard
              label="Pass Rate"
              value={`${passRate}%`}
              accent="#10b981"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              }
            />
            <StatCard
              label="Pending Review"
              value={String(reviewing)}
              accent="#f59e0b"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              }
            />
            <StatCard
              label="Failed"
              value={String(failing)}
              accent="#ef4444"
              icon={
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              }
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <RecentActivity submissions={recent} />
            </div>
            {donutSegments.length > 0 && (
              <DonutChart
                segments={donutSegments}
                title="Status Distribution"
                subtitle="Your completed submissions"
                centerValue={String(total)}
                centerLabel="Total"
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}
