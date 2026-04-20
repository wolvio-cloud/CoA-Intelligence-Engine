"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProgressBar } from "@/components/upload/ProgressBar";
import { OverallStatus } from "@/components/results/OverallStatus";
import { ResultTable } from "@/components/results/ResultTable";
import { ParameterDetail } from "@/components/results/ParameterDetail";
import { ExportButtons } from "@/components/export/ExportButtons";
import { useCoaUpload } from "@/hooks/useCoaUpload";
import { useCoaStatus } from "@/hooks/useCoaStatus";
import { useCoaResult } from "@/hooks/useCoaResult";
import { useAuth } from "@/context/AuthContext";
import type { CoaParameter, PipelineStage } from "@/lib/types";
import { acknowledgeSubmission, fetchResult } from "@/lib/api";

type Phase = "upload" | "processing" | "results";

/** Five UI-only steps (browser-side timer); no “Done” circle — API completion opens results. */
const PIPELINE_STAGES_VISUAL: Exclude<PipelineStage, "idle" | "complete">[] = [
  "queue",
  "intake",
  "extract",
  "validate",
  "store",
];

/** Progress caps for each visual index (used if full ProgressBar is shown elsewhere). */
const STAGE_PROGRESS_CAP = [12, 28, 52, 72, 94];

const AUTO_STAGE_INTERVAL_MS = 6000;

/** Last step index (Store). Timer stops here; API completion navigates to results. */
const LAST_VISUAL_INDEX = PIPELINE_STAGES_VISUAL.length - 1;

const STAGE_LABEL_MAP: Record<(typeof PIPELINE_STAGES_VISUAL)[number], string> = {
  queue: "Queued — preparing handoff",
  intake: "Intake & checksum",
  extract: "Vision + structured extract",
  validate: "Spec compare & matching",
  store: "Persist evidence package",
};

export function NewCoaPage() {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("upload");
  const [selectedParam, setSelectedParam] = useState<CoaParameter | null>(null);

  /** Stepper index 0–4 (Queue → Store). */
  const [visualStageIdx, setVisualStageIdx] = useState(0);

  const { user } = useAuth();
  const [acknowledging, setAcknowledging] = useState(false);
  const coaUpload = useCoaUpload();
  const pipelineActive = phase === "processing" && Boolean(coaUpload.jobId);
  const status = useCoaStatus(coaUpload.jobId ?? null, pipelineActive);
  const { data, loading, refetch } = useCoaResult(coaUpload.jobId ?? null, phase === "results");

  /** Advance queue → … → store every 6s for the whole processing phase (frontend-only; not tied to job id). */
  useEffect(() => {
    if (phase !== "processing") return;
    if (status.hasFailed) return;

    const id = window.setInterval(() => {
      setVisualStageIdx((prev) => {
        if (prev >= LAST_VISUAL_INDEX) return prev;
        return prev + 1;
      });
    }, AUTO_STAGE_INTERVAL_MS);

    return () => window.clearInterval(id);
  }, [phase, status.hasFailed]);

  // Prefetch results as soon as the backend is done (while visual is still animating).
  useEffect(() => {
    if (phase !== "processing" || !coaUpload.jobId || !status.isComplete) return;
    if (status.hasFailed) return;
    void queryClient.prefetchQuery({
      queryKey: ["coa-result", coaUpload.jobId],
      queryFn: () => fetchResult(coaUpload.jobId!),
    });
  }, [phase, coaUpload.jobId, status.isComplete, status.hasFailed, queryClient]);

  /** Open results when the API finishes (independent of stepper position). */
  useEffect(() => {
    if (phase !== "processing" || !status.isComplete || status.hasFailed) return;

    const id = window.setTimeout(async () => {
      // Force a fresh fetch to ensure metadata grid is populated
      await queryClient.refetchQueries({ queryKey: ["coa-result", coaUpload.jobId] });
      setPhase("results");
    }, 900);
    return () => window.clearTimeout(id);
  }, [phase, status.isComplete, status.hasFailed, coaUpload.jobId, queryClient]);

  useEffect(() => {
    if (!data?.parameters?.length) return;
    setSelectedParam((prev) => {
      if (prev && data.parameters.some((p) => p.id === prev.id)) return prev;
      return data.parameters[0];
    });
  }, [data]);

  const handleFile = async (file: File) => {
    setSelectedParam(null);
    setVisualStageIdx(0);
    setPhase("processing");
    const id = await coaUpload.upload(file);
    if (id) {
      void queryClient.invalidateQueries({ queryKey: ["coa-submissions"] });
    } else {
      setPhase("upload");
    }
  };

  const handleReset = () => {
    coaUpload.reset();
    setPhase("upload");
    setSelectedParam(null);
    setVisualStageIdx(0);
  };

  const safeIdx = Math.min(Math.max(visualStageIdx, 0), LAST_VISUAL_INDEX);
  const visualStage = PIPELINE_STAGES_VISUAL[safeIdx];
  const visualLabel = STAGE_LABEL_MAP[visualStage];
  const visualProgress = status.hasFailed
    ? Math.min(status.progress, STAGE_PROGRESS_CAP[safeIdx] ?? 100)
    : status.isComplete
      ? 100
      : STAGE_PROGRESS_CAP[safeIdx] ?? 0;

  return (
    <div className="space-y-5">
      {phase === "upload" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-6 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Submit Certificate of Analysis</h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Upload a CoA document — PDF or image format. Results are typically ready within 30–60 seconds.
              </p>
            </div>
            <div className="p-6">
              <DropZone
                onFile={handleFile}
                disabled={coaUpload.uploading}
                className="min-h-[320px]"
              />
            </div>
          </div>
          {coaUpload.error && (
            <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
              <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p className="text-sm text-red-700">{coaUpload.error}</p>
            </div>
          )}
        </div>
      )}

      {phase === "processing" && (
        <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Processing CoA</h2>
              <p className="mt-0.5 text-xs text-slate-400">Pipeline is running — this typically takes under a minute</p>
            </div>
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors"
            >
              Cancel
            </button>
          </div>
          <div className="p-6 space-y-4">
            <ProgressBar
              progress={visualProgress}
              stage={visualStage}
              label={visualLabel}
              stages={PIPELINE_STAGES_VISUAL}
              fileName={coaUpload.fileName}
              awaitingSubmission={coaUpload.uploading && !coaUpload.jobId}
              hasJobId={Boolean(coaUpload.jobId)}
              visualStepIndex={safeIdx}
              stepperOnly
            />
            {status.fetchError ? (
              <p className="text-center text-xs text-amber-700">
                Progress updates unavailable ({status.fetchError}). Results will still open when processing finishes.
              </p>
            ) : null}
            {status.hasFailed && (
              <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5">
                <svg className="mt-0.5 h-4 w-4 shrink-0 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-red-800">Processing failed</p>
                  <p className="mt-1 text-sm text-red-700 break-words">
                    {status.errorMessage || "The pipeline could not finish. Check API keys, Supabase bucket, and server logs."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {phase === "results" && (
        <>
          {loading || !data ? (
            <div className="flex min-h-[200px] items-center justify-center rounded-2xl border border-slate-200/70 bg-white shadow-sm">
              <div className="flex flex-col items-center gap-3 text-slate-400">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
                </svg>
                <p className="text-sm">Loading results…</p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <header className="flex flex-col gap-4 rounded-2xl border border-slate-200/70 bg-white px-4 py-3.5 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:px-5">
                <div className="flex min-w-0 flex-1 flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-white sm:text-sm"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                      <path d="M19 12H5M12 5l-7 7 7 7"/>
                    </svg>
                    New submission
                  </button>
                  <div className="hidden h-9 w-px shrink-0 bg-slate-200 sm:block" aria-hidden />
                  <div className="min-w-0 flex flex-col justify-center">
                    {data.header?.product_name || data.header?.supplier_name ? (
                      <>
                        <p className="truncate text-sm font-semibold text-navy sm:text-base" title={data.header.product_name ?? undefined}>
                          {data.header.product_name || "Product Unknown"}
                        </p>
                        <p className="mt-0.5 truncate text-[11px] font-medium text-slate-500" title={data.header.supplier_name ?? undefined}>
                          {data.header.supplier_name || "Supplier Unknown"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Results</p>
                        <p className="truncate text-sm font-semibold text-navy sm:text-base" title={data.filename}>
                          {data.filename}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <ExportButtons jobId={data.id} compact />
              </header>

              <OverallStatus
                status={data.overall_status}
                productName={data.product_match.matched_product}
                filename={data.filename}
                submissionId={data.id}
                matchScore={data.product_match.match_score}
                statusSummary={data.status_summary}
                header={data.header}
                isAcknowledged={!!data.analyst_acknowledged_at}
                showAcknowledgeButton={
                  (user?.role || "analyst") !== "manager" && !data.analyst_acknowledged_at
                }
                acknowledging={acknowledging}
                onAcknowledge={async () => {
                  if (!window.confirm("Acknowledge that extraction is verified? This moves the item to Tier 2 (Manager Approval).")) return;
                  try {
                    setAcknowledging(true);
                    await acknowledgeSubmission(data.id);
                    await refetch();
                  } catch (e) {
                    alert("Failed to acknowledge: " + (e instanceof Error ? e.message : String(e)));
                  } finally {
                    setAcknowledging(false);
                  }
                }}
              />

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_min(100%,400px)] xl:items-start xl:gap-8">
                <ResultTable
                  parameters={data.parameters}
                  selectedId={selectedParam?.id ?? null}
                  onSelect={setSelectedParam}
                />
                <div className="xl:sticky xl:top-4">
                  <ParameterDetail
                    param={selectedParam}
                    onClose={() => setSelectedParam(null)}
                  />
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
