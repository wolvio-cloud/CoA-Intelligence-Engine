"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { listSubmissions, deleteSubmission } from "@/lib/api";
import { SubmissionsTable } from "@/components/submissions/SubmissionsTable";
import type { SubmissionSummary } from "@/lib/types";
import { useRouter } from "next/navigation";

export function QCPanelPage() {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const items = await listSubmissions();
      // Filter for items waiting for QC sign-off
      const pending = items.filter(s => {
        const st = (s.approval_status || "").toUpperCase().trim();
        return st === "WAITING_FOR_QC";
      });
      setSubmissions(pending);
    } catch (err) {
      console.error("Failed to load submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role !== "manager") {
      router.push("/dashboard");
      return;
    }

    fetchSubmissions();
  }, [user, router]);

  const handleSelect = (s: SubmissionSummary) => {
    router.push(`/recent-coa/${s.id}`);
  };

  if (user?.role !== "manager") return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Management QC Panel</h1>
            <p className="mt-1 text-sm text-slate-500">Review and authorize batch release for extracted CoAs</p>
          </div>
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 disabled:opacity-50"
            title="Refresh list"
          >
            <svg className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 12c0-4.4 3.6-8 8-8 3.3 0 6.1 2 7.3 4.9M22 12c0 4.4-3.6 8-8 8-3.3 0-6.1-2-7.3-4.9" />
            </svg>
          </button>
        </div>
        <div className="flex h-11 items-center gap-2 rounded-2xl bg-blue-50 px-4 text-blue-700 border border-blue-100">
           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
             <polyline points="9 12 11 14 15 10"/>
           </svg>
           <span className="text-xs font-bold uppercase tracking-wider">{submissions.length} Pending Review</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200/70 bg-white shadow-sm">
        <div className="p-4 sm:p-5">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-slate-400">
              <svg className="h-6 w-6 animate-spin mr-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-sm font-medium">Loading pending approvals…</span>
            </div>
          ) : submissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500 mb-6 border border-emerald-100">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-slate-900">Queue is Clear</h3>
              <p className="mt-2 text-sm text-slate-500 max-w-xs mx-auto">All recent extractions have been processed or released. No items are currently awaiting QC sign-off.</p>
            </div>
          ) : (
            <SubmissionsTable
              submissions={submissions}
              onRowClick={handleSelect}
              variant="default"
              userRole="manager"
            />
          )}
        </div>
      </div>
    </div>
  );
}
