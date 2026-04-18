"use client";

import { useState } from "react";
import { signOffSubmission } from "@/lib/api";

type Disposition = "RELEASE" | "HOLD" | "REJECT";

interface DispositionPanelProps {
  submissionId: string;
  onSuccess: () => Promise<void>;
  currentDisposition?: string | null;
  currentNotes?: string | null;
}

export function DispositionPanel({
  submissionId,
  onSuccess,
  currentDisposition,
  currentNotes,
}: DispositionPanelProps) {
  const [disposition, setDisposition] = useState<Disposition>((currentDisposition as Disposition) || "RELEASE");
  const [notes, setNotes] = useState(currentNotes || "");
  const [busy, setBusy] = useState(false);

  const handleSubmit = async () => {
    if (!window.confirm(`Are you sure you want to ${disposition.toLowerCase()} this lot?`)) return;
    setBusy(true);
    try {
      await signOffSubmission(submissionId, disposition, notes);
      await onSuccess();
    } catch (e) {
      alert("Failed to submit sign-off: " + (e instanceof Error ? e.message : String(e)));
    } finally {
      setBusy(false);
    }
  };

  const isCompleted = Boolean(currentDisposition);

  return (
    <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50/50 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-navy">Management Authorization</h3>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-400">Tier 2: Final Sign-Off</p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-bold text-emerald-600 border border-emerald-100">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
               AUTHORIZED
            </div>
          )}
        </div>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          {/* Row 1: Decisions */}
          <div>
            <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Select Decision
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(["RELEASE", "HOLD", "REJECT"] as Disposition[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={isCompleted || busy}
                  onClick={() => setDisposition(opt)}
                  className={`flex items-center justify-center gap-3 rounded-xl border px-4 py-3.5 transition-all ${
                    disposition === opt
                      ? opt === "RELEASE" 
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700 font-bold ring-2 ring-emerald-500/10" 
                        : opt === "HOLD" 
                          ? "border-amber-200 bg-amber-50 text-amber-700 font-bold ring-2 ring-amber-500/10"
                          : "border-red-200 bg-red-50 text-red-700 font-bold ring-2 ring-red-500/10"
                      : "border-slate-100 bg-white text-slate-500 hover:border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <div className={`h-2 w-2 rounded-full ${
                    disposition === opt
                      ? opt === "RELEASE" ? "bg-emerald-500" : opt === "HOLD" ? "bg-amber-500" : "bg-red-500"
                      : "bg-slate-200"
                  }`} />
                  <span className="text-xs font-bold uppercase tracking-wide">{opt.toLowerCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Row 2: Notes & Submit */}
          <div className="space-y-4">
            <div>
              <label className="mb-3 block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Reviewer Notes & Authorization Remarks
              </label>
              <textarea
                className="w-full min-h-[120px] rounded-xl border border-slate-200 bg-white p-4 text-sm outline-none transition focus:border-blue-400 focus:ring-4 focus:ring-blue-50 disabled:bg-slate-50 disabled:text-slate-400"
                placeholder="Enter release justification or compliance notes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={isCompleted || busy}
              />
            </div>
            
            {!isCompleted && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={busy}
                  className="flex min-w-[200px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-500/20 transition hover:bg-blue-700 active:scale-[0.98] disabled:opacity-50"
                >
                  {busy && (
                     <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                       <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                     </svg>
                  )}
                  Confirm Authorization
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
