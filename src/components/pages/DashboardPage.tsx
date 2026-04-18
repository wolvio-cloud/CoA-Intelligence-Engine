"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { BarChart } from "@/components/dashboard/BarChart";
import { TrendLine } from "@/components/dashboard/TrendLine";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { listSubmissions } from "@/lib/api";
import { buildLastSevenDayTrend, buildOutcomeBars, computeDashboardStats } from "@/lib/dashboardMetrics";

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function QuickAction({ icon, label, sublabel, accent, href }: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  accent: string;
  href: string;
}) {
  return (
    <Link href={href} className="flex cursor-pointer items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm transition-all duration-200 hover:border-slate-300 hover:shadow-md">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}18`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold leading-tight text-slate-900">{label}</p>
        <p className="mt-0.5 text-xs text-slate-400">{sublabel}</p>
      </div>
    </Link>
  );
}

export function DashboardPage({ onNavigate }: { onNavigate?: (page: any) => void }) {
  const { user } = useAuth();

  const submissionsQuery = useQuery({
    queryKey: ["coa-submissions", user?.id ?? "none"],
    queryFn: () => listSubmissions(200),
    enabled: Boolean(user?.id),
    staleTime: 30_000,
    refetchInterval: 45_000,
  });

  const submissions = submissionsQuery.data ?? [];
  const stats = useMemo(() => computeDashboardStats(submissions), [submissions]);
  const trendData = useMemo(() => buildLastSevenDayTrend(submissions), [submissions]);
  const outcomeBars = useMemo(() => buildOutcomeBars(submissions), [submissions]);

  const donutSegments = useMemo(
    () =>
      [
        { label: "Pass", value: stats.passing, color: "#10b981" },
        { label: "Warning", value: stats.warning, color: "#f59e0b" },
        { label: "Review", value: stats.reviewing, color: "#06b6d4" },
        { label: "Fail", value: stats.failing, color: "#ef4444" },
        { label: "Error", value: stats.errors, color: "#ea580c" },
      ].filter((s) => s.value > 0),
    [stats],
  );

  const recent = useMemo(
    () =>
      [...submissions]
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 3),
    [submissions],
  );

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "there";
  const greeting = getGreeting();

  const showCharts = submissions.length > 0 || submissionsQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            {greeting}, {displayName}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500">Summary from your latest CoA submissions (live data)</p>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-3.5 py-2 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-xs font-medium text-slate-600">Last 7 days trend</span>
          {submissionsQuery.isFetching ? (
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-400">Updating…</span>
          ) : null}
        </div>
      </div>

      {submissionsQuery.isError ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Could not load submissions. Check that the API is running and{" "}
          <code className="rounded bg-white/80 px-1">NEXT_PUBLIC_API_BASE_URL</code> is set.
        </div>
      ) : null}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total (loaded)"
          value={submissionsQuery.isLoading ? "…" : String(stats.total)}
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
          label="Pass rate (all checks)"
          value={submissionsQuery.isLoading ? "…" : `${stats.passRate}%`}
          accent="#10b981"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <StatCard
          label="Review / warning"
          value={submissionsQuery.isLoading ? "…" : String(stats.pendingReview)}
          accent="#f59e0b"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard
          label="Failed / error"
          value={submissionsQuery.isLoading ? "…" : String(stats.failed)}
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
          {showCharts ? (
            <TrendLine
              data={trendData}
              title="Submission volume"
              subtitle="New submissions per day (last 7 days, UTC)"
              color="#2563eb"
              fillColor="#2563eb"
            />
          ) : (
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
              <p className="text-sm font-medium text-slate-600">No submission history yet</p>
              <p className="mt-1 max-w-sm text-xs text-slate-500">Upload a CoA to populate this trend chart.</p>
            </div>
          )}
        </div>
        {showCharts && donutSegments.length > 0 ? (
          <DonutChart
            segments={donutSegments}
            title="Status distribution"
            subtitle="By rolled-up lot outcome"
            centerValue={submissionsQuery.isLoading ? "…" : String(stats.total)}
            centerLabel="In view"
          />
        ) : !submissionsQuery.isLoading ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">No status breakdown</p>
            <p className="mt-1 text-xs text-slate-500">Submit at least one CoA to see the distribution.</p>
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200/70 bg-white text-sm text-slate-400">
            Loading…
          </div>
        )}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity submissions={recent} />
        </div>
        {showCharts && outcomeBars.length > 0 ? (
          <BarChart
            data={outcomeBars}
            max={Math.max(...outcomeBars.map((d) => d.value), 1)}
            title="Outcome mix"
            subtitle="Submissions per outcome (loaded set)"
          />
        ) : !submissionsQuery.isLoading ? (
          <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-6 py-12 text-center">
            <p className="text-sm font-medium text-slate-600">No outcome bars yet</p>
            <p className="mt-1 text-xs text-slate-500">Outcomes appear after submissions are processed.</p>
          </div>
        ) : (
          <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200/70 bg-white text-sm text-slate-400">
            Loading…
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Quick actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-2">
          <QuickAction
            accent="#2563eb"
            label="Submit New CoA"
            sublabel="Upload and analyse a document"
            href="/new-coa"
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            }
          />
          <QuickAction
            accent="#10b981"
            label="View Recent CoAs"
            sublabel="Browse all past submissions"
            href="/recent-coa"
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
