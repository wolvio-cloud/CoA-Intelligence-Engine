"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { DropZone } from "@/components/upload/DropZone";
import { ProgressBar } from "@/components/upload/ProgressBar";
import { OverallStatus } from "@/components/results/OverallStatus";
import { ResultTable } from "@/components/results/ResultTable";
import { ParameterDetail } from "@/components/results/ParameterDetail";
import { ExportButtons } from "@/components/export/ExportButtons";
import { useCoaUpload } from "@/hooks/useCoaUpload";
import { useCoaStatus } from "@/hooks/useCoaStatus";
import { useCoaResult } from "@/hooks/useCoaResult";
import type { CoaParameter, PipelineStage } from "@/lib/types";
import { fetchResult } from "@/lib/api";

type Phase = "upload" | "processing" | "results";

// Ordered pipeline stages as the backend reports them.
const PIPELINE_STAGES: Exclude<PipelineStage, "idle">[] = [
  "intake",
  "extract",
  "validate",
  "store",
  "complete",
];

/**
 * Maximum progress % to display while the visual is dwelling on each stage.
 * Prevents the percentage bar jumping ahead of the step indicator.
 */
const STAGE_PROGRESS_CAP = [20, 72, 82, 94, 100];

/** Human-readable label for each stage (mirrors useCoaStatus / ProgressBar copy). */
const STAGE_LABEL_MAP: Record<Exclude<PipelineStage, "idle">, string> = {
  intake: "Intake & checksum",
  extract: "Vision + structured extract",
  validate: "Spec compare & matching",
  store: "Persist evidence package",
  complete: "Ready for QP review",
};

/**
 * Minimum milliseconds to show each stage before advancing to the next.
 * Ensures every stage is visible even when the backend processes faster than
 * the poll interval.
 */
const STAGE_DWELL_MS = 650;

export function NewCoaPage() {
  const queryClient = useQueryClient();
  const [phase, setPhase] = useState<Phase>("upload");
  const [selectedParam, setSelectedParam] = useState<CoaParameter | null>(null);

  /**
   * Visual stage index — advances one step at a time with a minimum dwell,
   * always ≤ the real backend stage. Drives what the user sees in ProgressBar.
   */
  const [visualStageIdx, setVisualStageIdx] = useState(0);

  const coaUpload = useCoaUpload();
  const pipelineActive = phase === "processing" && Boolean(coaUpload.jobId);
  const status = useCoaStatus(coaUpload.jobId ?? null, pipelineActive);
  const { data, loading } = useCoaResult(coaUpload.jobId ?? null, phase === "results");

  // Index in PIPELINE_STAGES that the backend has reached.
  const realStageIdx = useMemo(() => {
    const i = PIPELINE_STAGES.indexOf(
      status.stage as Exclude<PipelineStage, "idle">,
    );
    return i >= 0 ? i : 0;
  }, [status.stage]);

  /**
   * Advance the visual stage toward the real backend stage, one step at a time,
   * with a minimum dwell of STAGE_DWELL_MS. Never advances on failure.
   */
  useEffect(() => {
    if (phase !== "processing") return;
    if (status.hasFailed) return;
    if (visualStageIdx >= realStageIdx) return;

    const timer = window.setTimeout(() => {
      setVisualStageIdx((prev) =>
        Math.min(prev + 1, PIPELINE_STAGES.length - 1),
      );
    }, STAGE_DWELL_MS);

    return () => window.clearTimeout(timer);
  }, [phase, status.hasFailed, visualStageIdx, realStageIdx]);

  // Prefetch results as soon as the backend is done (while visual is still animating).
  useEffect(() => {
    if (phase !== "processing" || !coaUpload.jobId || !status.isComplete) return;
    if (status.hasFailed) return;
    void queryClient.prefetchQuery({
      queryKey: ["coa-result", coaUpload.jobId],
      queryFn: () => fetchResult(coaUpload.jobId!),
    });
  }, [phase, coaUpload.jobId, status.isComplete, status.hasFailed, queryClient]);

  /**
   * Transition to results ONLY after:
   *   1. Backend has completed (status.isComplete)
   *   2. Visual animation has reached the final "complete" stage
   * This guarantees the user sees every stage regardless of backend speed.
   */
  useEffect(() => {
    if (phase !== "processing" || !status.isComplete || status.hasFailed) return;
    if (visualStageIdx < PIPELINE_STAGES.length - 1) return;

    const id = window.setTimeout(() => setPhase("results"), 900);
    return () => window.clearTimeout(id);
  }, [phase, status.isComplete, status.hasFailed, visualStageIdx]);

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

  // Values derived from visual (not real) stage — what ProgressBar actually displays.
  const visualStage = PIPELINE_STAGES[visualStageIdx];
  const visualProgress = Math.min(
    status.progress,
    STAGE_PROGRESS_CAP[visualStageIdx] ?? 100,
  );
  const visualLabel = STAGE_LABEL_MAP[visualStage];

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
              stages={status.stages}
              fileName={coaUpload.fileName}
              awaitingSubmission={coaUpload.uploading && !coaUpload.jobId}
              hasJobId={Boolean(coaUpload.jobId)}
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
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Results</p>
                    <p className="truncate text-sm font-semibold text-navy sm:text-base" title={data.filename}>
                      {data.filename}
                    </p>
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
