import { StatCard } from "@/components/dashboard/StatCard";
import { BarChart } from "@/components/dashboard/BarChart";
import { DonutChart } from "@/components/dashboard/DonutChart";
import { TrendLine } from "@/components/dashboard/TrendLine";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { SupplierTable } from "@/components/dashboard/SupplierTable";
import { AlertsFeed } from "@/components/dashboard/AlertsFeed";

const MONTHLY_TREND = [
  { label: "Oct", value: 22 },
  { label: "Nov", value: 31 },
  { label: "Dec", value: 28 },
  { label: "Jan", value: 37 },
  { label: "Feb", value: 42 },
  { label: "Mar", value: 38 },
  { label: "Apr", value: 47 },
];

const WEEKLY_BAR = [
  { label: "Mon", value: 5, color: "#2563eb" },
  { label: "Tue", value: 9, color: "#2563eb" },
  { label: "Wed", value: 7, color: "#2563eb" },
  { label: "Thu", value: 12, color: "#2563eb" },
  { label: "Fri", value: 8, color: "#2563eb" },
  { label: "Sat", value: 3, color: "#94a3b8" },
  { label: "Sun", value: 2, color: "#94a3b8" },
];

const STATUS_DONUT = [
  { label: "Pass", value: 108, color: "#10b981" },
  { label: "Warning", value: 23, color: "#f59e0b" },
  { label: "Review", value: 14, color: "#06b6d4" },
  { label: "Fail", value: 7, color: "#ef4444" },
];

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          label="Total Submissions"
          value="152"
          change="12%"
          changePositive
          accent="#2563eb"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
            </svg>
          }
        />
        <StatCard
          label="Pass Rate"
          value="71%"
          change="3%"
          changePositive
          accent="#10b981"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          }
        />
        <StatCard
          label="Pending Review"
          value="14"
          change="2"
          changePositive={false}
          accent="#f59e0b"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
          }
        />
        <StatCard
          label="Active Suppliers"
          value="5"
          accent="#8b5cf6"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          }
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TrendLine
            data={MONTHLY_TREND}
            title="Submissions Over Time"
            subtitle="Monthly CoA submission volume"
            color="#2563eb"
          />
        </div>
        <DonutChart
          segments={STATUS_DONUT}
          title="Status Distribution"
          subtitle="All submissions this period"
          centerValue="152"
          centerLabel="Total"
        />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BarChart
            data={WEEKLY_BAR}
            title="Submissions This Week"
            subtitle="Daily volume — current week"
          />
        </div>
        <AlertsFeed />
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <SupplierTable />
        </div>
        <RecentActivity />
      </div>
    </div>
  );
}
