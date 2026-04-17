import type { SubmissionSummary } from "@/lib/types";
import { SubmissionsTable } from "@/components/submissions/SubmissionsTable";
import { useRouter } from "next/navigation";

interface RecentActivityProps {
  submissions: SubmissionSummary[];
}

export function RecentActivity({ submissions }: RecentActivityProps) {
  const router = useRouter();
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">Recent Submissions</h3>
          <p className="mt-0.5 text-xs text-slate-400">Latest CoA analysis results</p>
        </div>
      </div>
      {submissions.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-slate-400">No submissions yet</div>
      ) : (
        <div className="p-4 sm:p-5">
           <SubmissionsTable 
            submissions={submissions} 
            variant="compact" 
            onRowClick={(s) => router.push(`/recent-coa/${s.id}`)}
          />
        </div>
      )}
    </div>
  );
}
