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
  const [pendingSubmissions, setPendingSubmissions] = useState<SubmissionSummary[]>([]);
  const [completedSubmissions, setCompletedSubmissions] = useState<SubmissionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingPage, setPendingPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const itemsPerPage = 10;
  const router = useRouter();

  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      const items = await listSubmissions(1000, 0); // Fetch more to cover both sections
      setSubmissions(items);
      // Filter for items waiting for QC sign-off
      const pending = items.filter(s => {
        const st = (s.approval_status || "").toUpperCase().trim();
        return st === "WAITING_FOR_QC";
      });
      setPendingSubmissions(pending);
      // Filter for completed QC reviews
      const completed = items.filter(s => {
        const st = (s.approval_status || "").toUpperCase().trim();
        return ["RELEASED", "HELD", "REJECTED"].includes(st);
      });
      setCompletedSubmissions(completed);
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

  const pendingStart = (pendingPage - 1) * itemsPerPage;
  const pendingEnd = pendingStart + itemsPerPage;
  const pendingDisplayed = pendingSubmissions.slice(pendingStart, pendingEnd);
  const pendingTotalPages = Math.ceil(pendingSubmissions.length / itemsPerPage);

  const completedStart = (completedPage - 1) * itemsPerPage;
  const completedEnd = completedStart + itemsPerPage;
  const completedDisplayed = completedSubmissions.slice(completedStart, completedEnd);
  const completedTotalPages = Math.ceil(completedSubmissions.length / itemsPerPage);

  const handleSelect = (s: SubmissionSummary) => {
    router.push(`/recent-coa/${s.id}`);
  };

  if (user?.role !== "manager") return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="h-10 w-1 bg-navy rounded-full" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              QC Review Panel
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              Review and authorize pending submissions
            </p>
          </div>
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="ml-2 flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-900"
            title="Refresh list"
          >
            <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 12c0-4.4 3.6-8 8-8 3.3 0 6.1 2 7.3 4.9M22 12c0 4.4-3.6 8-8 8-3.3 0-6.1-2-7.3-4.9" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3 rounded bg-emerald-50 px-4 py-2 text-emerald-700 border border-emerald-100 ring-1 ring-inset ring-emerald-200/20">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
             <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
           </svg>
           <span className="text-[11px] font-bold">{pendingSubmissions.length} Pending Review</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <svg className="h-8 w-8 animate-spin text-slate-200 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-[11px] font-semibold">Querying Authorizations…</span>
            </div>
          ) : pendingSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-50 text-slate-300 mb-6 ring-1 ring-inset ring-slate-100 border border-slate-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12s-4-8-9-8-9 8-9 8 4 8 9 8 9-8 9-8z" />
                  <line x1="12" y1="9" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Items Pending Review</h3>
              <p className="mt-3 text-[13px] font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">All extractions have been successfully authorized or quarantined. No items currently require sign-off.</p>
            </div>
          ) : (
            <div>
              <div className="-mx-6 -my-6">
                <SubmissionsTable
                  submissions={pendingDisplayed}
                  onRowClick={handleSelect}
                  variant="default"
                  userRole="manager"
                />
              </div>
              {pendingTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setPendingPage(Math.max(1, pendingPage - 1))}
                    disabled={pendingPage === 1}
                    className="px-3 py-1 text-sm border border-slate-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {pendingPage} of {pendingTotalPages}
                  </span>
                  <button
                    onClick={() => setPendingPage(Math.min(pendingTotalPages, pendingPage + 1))}
                    disabled={pendingPage === pendingTotalPages}
                    className="px-3 py-1 text-sm border border-slate-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QC Completed Section */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-5">
          <div className="h-10 w-1 bg-green-500 rounded-full" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              QC Completed
            </h1>
            <p className="mt-1 text-xs font-bold uppercase tracking-widest text-slate-400">
              Previously reviewed and authorized submissions
            </p>
          </div>
          <button
            onClick={fetchSubmissions}
            disabled={loading}
            className="ml-2 flex h-8 w-8 items-center justify-center rounded border border-slate-200 bg-white text-slate-400 transition hover:bg-slate-50 hover:text-slate-900"
            title="Refresh list"
          >
            <svg className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21.5 2v6h-6M2.5 22v-6h6M2 12c0-4.4 3.6-8 8-8 3.3 0 6.1 2 7.3 4.9M22 12c0 4.4-3.6 8-8 8-3.3 0-6.1-2-7.3-4.9" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-3 rounded bg-green-50 px-4 py-2 text-green-700 border border-green-100 ring-1 ring-inset ring-green-200/20">
           <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
             <path d="M9 12l2 2 4-4"/>
           </svg>
           <span className="text-[11px] font-bold">{completedSubmissions.length} Completed Reviews</span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="px-6 py-6">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 text-slate-400">
              <svg className="h-8 w-8 animate-spin text-slate-200 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span className="text-[11px] font-semibold">Querying Completed Reviews…</span>
            </div>
          ) : completedSubmissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-32 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded bg-slate-50 text-slate-300 mb-6 ring-1 ring-inset ring-slate-100 border border-slate-200">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 12l2 2 4-4"/>
                </svg>
              </div>
              <h3 className="text-sm font-bold text-slate-900">No Completed Reviews</h3>
              <p className="mt-3 text-[13px] font-medium text-slate-500 max-w-xs mx-auto leading-relaxed">No submissions have been reviewed and authorized yet.</p>
            </div>
          ) : (
            <>
              <div className="-mx-6 -my-6">
                <SubmissionsTable
                  submissions={completedDisplayed}
                  onRowClick={handleSelect}
                  variant="default"
                  userRole="manager"
                />
              </div>
              {completedTotalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <button
                    onClick={() => setCompletedPage(Math.max(1, completedPage - 1))}
                    disabled={completedPage === 1}
                    className="px-3 py-1 text-sm border border-slate-200 rounded disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-slate-600">
                    Page {completedPage} of {completedTotalPages}
                  </span>
                  <button
                    onClick={() => setCompletedPage(Math.min(completedTotalPages, completedPage + 1))}
                    disabled={completedPage === completedTotalPages}
                    className="px-3 py-1 text-sm border border-slate-200 rounded disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
