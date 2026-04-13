"use client";

import { useEffect, useState } from "react";
import { ExportButtons } from "@/components/export/ExportButtons";
import { OverallStatus } from "@/components/results/OverallStatus";
import { ParameterDetail } from "@/components/results/ParameterDetail";
import { ResultTable } from "@/components/results/ResultTable";
import { RecentSubmissions } from "@/components/sidebar/RecentSubmissions";
import { DropZone } from "@/components/upload/DropZone";
import { ProgressBar } from "@/components/upload/ProgressBar";
import { brand, brandColors } from "@/config/brand";
import { useCoaResult } from "@/hooks/useCoaResult";
import { useCoaStatus } from "@/hooks/useCoaStatus";
import { useCoaUpload } from "@/hooks/useCoaUpload";
import type { CoaParameter, SubmissionSummary } from "@/lib/types";

type Phase = "upload" | "processing" | "results";

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [sidebarJobId, setSidebarJobId] = useState<string | null>(null);
  const [selectedParam, setSelectedParam] = useState<CoaParameter | null>(null);
  /** Hide list column for more main width; auto-expand when opening results from upload. */
  const [activityCollapsed, setActivityCollapsed] = useState(false);

  const coaUpload = useCoaUpload();
  const pipelineActive = phase === "processing";
  const status = useCoaStatus(pipelineActive);

  const activeJobId = coaUpload.jobId ?? sidebarJobId;
  const loadResults = phase === "results";
  const { data, loading } = useCoaResult(activeJobId, loadResults);

  useEffect(() => {
    if (phase !== "processing" || !status.isComplete) return;
    const id = window.setTimeout(() => {
      setPhase("results");
    }, 2600);
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
    setSidebarJobId(null);
    setSelectedParam(null);
    const id = await coaUpload.upload(file);
    if (id) setPhase("processing");
  };

  const handleSidebarSelect = (s: SubmissionSummary) => {
    coaUpload.reset();
    setSidebarJobId(s.id);
    setSelectedParam(null);
    setActivityCollapsed(false);
    setPhase("results");
  };

  const newAssessment = () => {
    coaUpload.reset();
    setSidebarJobId(null);
    setSelectedParam(null);
    setPhase("upload");
  };

  const showActivityColumn = phase !== "processing" && !activityCollapsed;

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col">
      <header
        className="sticky top-0 z-30 border-b border-white/10 shadow-md backdrop-blur-md"
        style={{ backgroundColor: brandColors.navy }}
      >
        <div className="flex w-full flex-col gap-4 px-4 py-3.5 sm:flex-row sm:items-center sm:justify-between sm:px-5 md:px-6 lg:px-8">
          <div className="flex items-center gap-3.5">
            {brand.logoSrc ? (
              <img
                src={brand.logoSrc}
                alt={brand.logoAlt}
                className="h-9 max-h-9 w-auto max-w-[min(200px,42vw)] shrink-0 object-contain object-left sm:h-10 sm:max-h-10"
                decoding="async"
              />
            ) : (
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-white/20 bg-white/5 text-xs font-semibold tracking-tight text-white">
                {brand.logoMark}
              </div>
            )}
            <div className="min-w-0">
              <h1 className="truncate text-base font-semibold tracking-tight text-white lg:text-lg">
                {brand.productName}
              </h1>
              <p className="mt-0.5 text-xs leading-snug text-slate-300 sm:text-sm">
                {brand.tagline}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 sm:justify-end">
            {phase !== "processing" && activityCollapsed ? (
              <button
                type="button"
                onClick={() => setActivityCollapsed(false)}
                className="rounded-md border border-white/25 bg-white/5 px-2.5 py-1.5 text-[11px] font-medium text-slate-100 transition hover:bg-white/10"
              >
                Show recent activity
              </button>
            ) : null}
            <button
              type="button"
              onClick={newAssessment}
              className="inline-flex items-center gap-1.5 rounded-md px-3.5 py-2 text-md font-medium text-white shadow-sm transition hover:brightness-110"
              style={{ backgroundColor: brandColors.blue,fontSize: "12px" }}
            >
              <span className="text-base leading-none text-[12px]">+</span>
              New assessment
            </button>
          </div>
        </div>
      </header>

      <main
        className={`mx-auto flex w-full max-w-[1440px] flex-1 flex-col px-4 py-5 sm:px-5 md:px-6 lg:px-8 lg:py-6 ${phase === "upload" || phase === "processing" ? "min-h-0" : ""}`}
      >
        <div
          className={`grid gap-5 lg:gap-6 xl:gap-8 ${
            showActivityColumn
              ? "lg:grid-cols-[minmax(220px,min(15vw,280px))_minmax(0,1fr)]"
              : "lg:grid-cols-1"
          } ${phase === "upload" || phase === "processing" ? "flex-1 lg:min-h-0 lg:items-stretch" : ""}`}
        >
          {showActivityColumn ? (
            <aside
              className={`space-y-5 lg:sticky lg:top-24 ${phase === "upload" ? "lg:self-stretch" : "lg:self-start"}`}
            >
              <RecentSubmissions
                activeId={activeJobId}
                onSelect={handleSidebarSelect}
                onRequestCollapse={() => setActivityCollapsed(true)}
                className={phase === "upload" ? "h-full min-h-0" : ""}
              />
              {phase === "results" && data ? <ExportButtons jobId={data.id} /> : null}
            </aside>
          ) : null}

          <section
            className={`min-w-0 ${phase === "upload" || phase === "processing" ? "flex min-h-0 flex-1 flex-col" : "space-y-8"}`}
          >
            {phase === "upload" && (
              <div className="flex min-h-0 flex-1 flex-col gap-5 lg:min-h-[calc(100dvh-5.5rem)]">
                <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_40px_rgba(26,35,50,0.08)]">
                  <div
                    className="h-1 w-full shrink-0"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${brandColors.blue}, transparent)`,
                      opacity: 0.65,
                    }}
                  />
                  <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6 lg:p-8">
                    <DropZone
                      onFile={handleFile}
                      disabled={coaUpload.uploading}
                      className="min-h-[min(52vh,480px)] flex-1 lg:min-h-0"
                    />
                  </div>
                </div>
                {coaUpload.error ? (
                  <p className="shrink-0 rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
                    {coaUpload.error}
                  </p>
                ) : null}
              </div>
            )}

            {phase === "processing" && (
              <div className="flex min-h-0 flex-1 flex-col lg:min-h-[calc(100dvh-5.5rem)]">
                <ProgressBar
                  progress={status.progress}
                  stage={status.stage}
                  label={status.stageLabel}
                  stages={status.stages}
                  fileName={coaUpload.fileName}
                />
              </div>
            )}

            {phase === "results" && (
              <div className="space-y-8">
                {loading || !data ? (
                  <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-brand-slate">
                    Preparing results…
                  </div>
                ) : (
                  <>
                    <OverallStatus
                      status={data.overall_status}
                      productName={data.product_match.matched_product}
                      filename={data.filename}
                      matchScore={data.product_match.match_score}
                    />
                    <div className="grid gap-5 xl:grid-cols-[1fr_minmax(260px,340px)] xl:gap-6">
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
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}