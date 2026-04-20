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
    <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
      <div className="border-b border-slate-100 bg-slate-50/30 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold tracking-tight text-slate-900">
              Disposition Decision
            </h3>
            <p className="mt-1 text-[11px] font-semibold text-slate-400">
              Select the appropriate disposition for this lot and provide any relevant remarks.
            </p>
          </div>
          {isCompleted && (
            <div className="flex items-center gap-1.5 rounded bg-emerald-50 px-3 py-1 text-[11px] font-bold text-emerald-700 border border-emerald-100">
               <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
               Authorized
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        <div className="space-y-8">
          {/* Decisions */}
          <div>
            <label className="mb-4 block text-[11px] font-semibold text-slate-400">
              Select Disposition
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {(["RELEASE", "HOLD", "REJECT"] as Disposition[]).map((opt) => (
                <button
                  key={opt}
                  type="button"
                  disabled={isCompleted || busy}
                  onClick={() => setDisposition(opt)}
                  className={`flex flex-col items-center justify-center gap-3 rounded-lg border p-5 transition-all ${
                    disposition === opt
                      ? opt === "RELEASE" 
                        ? "border-emerald-200 bg-emerald-50/50 text-emerald-700 ring-1 ring-emerald-200" 
                        : opt === "HOLD" 
                          ? "border-amber-200 bg-amber-50/50 text-amber-700 ring-1 ring-amber-200"
                          : "border-rose-200 bg-rose-50/50 text-rose-700 ring-1 ring-rose-200"
                      : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50"
                  }`}
                >
                  <div className={`h-2.5 w-2.5 rounded-xl ${
                    disposition === opt
                      ? opt === "RELEASE" ? "bg-emerald-500" : opt === "HOLD" ? "bg-amber-500" : "bg-rose-500"
                      : "bg-slate-200"
                  }`} />
                  <span className="text-[12px] font-bold">{opt.charAt(0) + opt.slice(1).toLowerCase()}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-4">
            <div>
              <label className="mb-4 block text-[11px] font-semibold text-slate-400">
                Decision Remarks
              </label>
              <textarea
                className="w-full min-h-[140px] rounded-lg border border-slate-200 bg-white p-4 text-[13px] font-medium text-slate-900 outline-none transition focus:border-slate-400 focus:ring-1 focus:ring-slate-400/10 disabled:bg-slate-50 disabled:text-slate-400 placeholder:text-slate-300"
                placeholder="Include justification for this compliance decision..."
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
                  className="flex min-w-[220px] items-center justify-center gap-2 rounded bg-navy px-8 py-3.5 text-[11px] font-bold text-white transition hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50"
                >
                  {busy && (
                     <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                       <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                     </svg>
                  )}
                  Submit Decision
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
