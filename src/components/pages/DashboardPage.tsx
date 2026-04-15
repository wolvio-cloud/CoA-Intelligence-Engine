"use client";

import { useAuth } from "@/context/AuthContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { BarChart } from "@/components/dashboard/BarChart";
import { TrendLine } from "@/components/dashboard/TrendLine";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MOCK_RECENT_SUBMISSIONS } from "@/lib/types";

const MOCK_SUBMISSIONS = [
  ...MOCK_RECENT_SUBMISSIONS,
  {
    id: "sub-9901",
    filename: "Metformin_HCl_BP_LotF18.pdf",
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    stage: "complete" as const,
    overall_status: "PASS" as const,
    parameter_count: 14,
  },
  {
    id: "sub-9855",
    filename: "Amoxicillin_USP_batch7.pdf",
    created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
    stage: "complete" as const,
    overall_status: "FAIL" as const,
    parameter_count: 13,
  },
  {
    id: "sub-9800",
    filename: "Atorvastatin_10mg_LotA9.pdf",
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    stage: "complete" as const,
    overall_status: "PASS" as const,
    parameter_count: 11,
  },
  {
    id: "sub-9750",
    filename: "Losartan_K_USP_LotB3.pdf",
    created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
    stage: "complete" as const,
    overall_status: "REVIEW" as const,
    parameter_count: 10,
  },
];

const TREND_DATA = [
  { label: "Mon", value: 3 },
  { label: "Tue", value: 5 },
  { label: "Wed", value: 4 },
  { label: "Thu", value: 7 },
  { label: "Fri", value: 6 },
  { label: "Sat", value: 2 },
  { label: "Sun", value: 4 },
];

const SUPPLIER_PASS_RATE = [
  { label: "Teva", value: 92, color: "#10b981" },
  { label: "Cipla", value: 87, color: "#10b981" },
  { label: "Sun", value: 78, color: "#f59e0b" },
  { label: "Torrent", value: 95, color: "#10b981" },
  { label: "Lupin", value: 83, color: "#f59e0b" },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function QuickAction({ icon, label, sublabel, accent }: {
  icon: React.ReactNode;
  label: string;
  sublabel: string;
  accent: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200/70 bg-white px-4 py-3 shadow-sm hover:shadow-md hover:border-slate-300 transition-all duration-200 cursor-pointer">
      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${accent}18`, color: accent }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-slate-900 leading-tight">{label}</p>
        <p className="text-xs text-slate-400 mt-0.5">{sublabel}</p>
      </div>
    </div>
  );
}

export function DashboardPage() {
  const { user } = useAuth();

  const total = MOCK_SUBMISSIONS.length;
  const passing = MOCK_SUBMISSIONS.filter((s) => s.overall_status === "PASS").length;
  const failing = MOCK_SUBMISSIONS.filter((s) => s.overall_status === "FAIL").length;
  const reviewing = MOCK_SUBMISSIONS.filter((s) => s.overall_status === "REVIEW").length;
  const warning = MOCK_SUBMISSIONS.filter((s) => s.overall_status === "WARNING").length;
  const passRate = Math.round((passing / total) * 100);

  const donutSegments = [
    { label: "Pass", value: passing, color: "#10b981" },
    { label: "Warning", value: warning, color: "#f59e0b" },
    { label: "Review", value: reviewing, color: "#06b6d4" },
    { label: "Fail", value: failing, color: "#ef4444" },
  ].filter((s) => s.value > 0);

  const recent = [...MOCK_SUBMISSIONS]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5);

  const displayName = user?.displayName ?? user?.email?.split("@")[0] ?? "there";
  const greeting = getGreeting();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">{greeting}, {displayName}</h2>
          <p className="mt-0.5 text-sm text-slate-500">Here&apos;s a summary of your CoA activity</p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/70 bg-white px-3.5 py-2 shadow-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <span className="text-xs font-medium text-slate-600">Last 7 days</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Submissions"
          value={String(total)}
          change="+12%"
          changePositive
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
          change="+3%"
          changePositive
          accent="#10b981"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          }
        />
        <StatCard
          label="Pending Review"
          value={String(reviewing + warning)}
          change="-1"
          changePositive={false}
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
          change="+1"
          changePositive={false}
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
          <TrendLine
            data={TREND_DATA}
            title="Submission Volume"
            subtitle="CoAs submitted per day this week"
            color="#2563eb"
            fillColor="#2563eb"
          />
        </div>
        <DonutChart
          segments={donutSegments}
          title="Status Distribution"
          subtitle="All completed submissions"
          centerValue={String(total)}
          centerLabel="Total"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RecentActivity submissions={recent} />
        </div>
        <BarChart
          data={SUPPLIER_PASS_RATE}
          max={100}
          title="Supplier Pass Rate"
          subtitle="% passing by supplier"
        />
      </div>

      <div>
        <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Quick Actions</h3>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <QuickAction
            accent="#2563eb"
            label="Submit New CoA"
            sublabel="Upload and analyse a document"
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
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            }
          />
          <QuickAction
            accent="#f59e0b"
            label="Manage Settings"
            sublabel="Brands, specs, notifications"
            icon={
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
            }
          />
        </div>
      </div>
    </div>
  );
}
