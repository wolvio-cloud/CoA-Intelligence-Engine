"use client";

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
import type { CoaParameter } from "@/lib/types";

type Phase = "upload" | "processing" | "results";

export function NewCoaPage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [selectedParam, setSelectedParam] = useState<CoaParameter | null>(null);

  const coaUpload = useCoaUpload();
  const pipelineActive = phase === "processing" && Boolean(coaUpload.jobId);
  const status = useCoaStatus(coaUpload.jobId ?? null, pipelineActive);
  const { data, loading } = useCoaResult(coaUpload.jobId ?? null, phase === "results");

  useEffect(() => {
    if (phase !== "processing" || !status.isComplete) return;
    const id = window.setTimeout(() => setPhase("results"), 2600);
    return () => window.clearTimeout(id);
  }, [phase, status.isComplete]);

  useEffect(() => {
    if (!data?.parameters?.length) return;
    setSelectedParam((prev) => {
      if (prev && data.parameters.some((p) => p.id === prev.id)) return prev;
      return data.parameters[0];
    });
  }, [data]);

  const handleFile = async (file: File) => {
    setSelectedParam(null);
    const id = await coaUpload.upload(file);
    if (id) setPhase("processing");
  };

  const handleReset = () => {
    coaUpload.reset();
    setPhase("upload");
    setSelectedParam(null);
  };

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
          <div className="p-6">
            <ProgressBar
              progress={status.progress}
              stage={status.stage}
              label={status.stageLabel}
              stages={status.stages}
              fileName={coaUpload.fileName}
            />
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
            <div className="space-y-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M19 12H5M12 5l-7 7 7 7"/>
                  </svg>
                  New submission
                </button>
                <ExportButtons jobId={data.id} />
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/70 shadow-sm overflow-hidden">
                <div className="p-5">
                  <OverallStatus
                    status={data.overall_status}
                    productName={data.product_match.matched_product}
                    filename={data.filename}
                    matchScore={data.product_match.match_score}
                  />
                </div>
              </div>

              <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
                <ResultTable
                  parameters={data.parameters}
                  selectedId={selectedParam?.id ?? null}
                  onSelect={setSelectedParam}
                />
                <ParameterDetail
                  param={selectedParam}
                  onClose={() => setSelectedParam(null)}
                />
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
