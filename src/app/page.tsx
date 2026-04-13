"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

type Phase = "upload" | "processing" | "results" | "recent";

export default function HomePage() {
  const [phase, setPhase] = useState<Phase>("upload");
  const [sidebarJobId, setSidebarJobId] = useState<string | null>(null);
  const [selectedParam, setSelectedParam] = useState<CoaParameter | null>(null);
  const [sidebarMode, setSidebarMode] = useState<"new" | "recent">("new");

  const router = useRouter();
  const searchParams = useSearchParams();
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
    const view = searchParams.get("view");
    if (view === "recent") {
      setSidebarMode("recent");
      setPhase("recent");
    } else if (view === "new") {
      setSidebarMode("new");
      setPhase("upload");
    }
  }, [searchParams]);

  useEffect(() => {
    if (!data?.parameters?.length) return;
    setSelectedParam((prev) => {
      if (prev && data.parameters.some((p) => p.id === prev.id)) return prev;
      return data.parameters[0];
    });
  }, [data]);

  const setMenuView = (view: "new" | "recent") => {
    const pathname = window.location.pathname;
    router.push(`${pathname}?view=${view}`);
  };

  const handleFile = async (file: File) => {
    setSidebarJobId(null);
    setSelectedParam(null);
    const id = await coaUpload.upload(file);
    if (id) setPhase("processing");
  };

  const handleSidebarSelect = (s: SubmissionSummary) => {
    coaUpload.reset();
    setSidebarMode("recent");
    setSidebarJobId(s.id);
    setSelectedParam(null);
    setPhase("results");
  };

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
            <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-slate-200">
              Dashboard
            </span>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-4 py-7 sm:px-5 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[200px_minmax(0,1fr)] xl:gap-8">
          <aside className="relative flex min-h-0 flex-col overflow-hidden rounded-[20px] border border-slate-200/80 bg-white/95 p-5 shadow-card transition-all duration-300 lg:sticky lg:top-24">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-blue text-white shadow-sm">
                <span className="text-sm font-black">CoA</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Workspace</p>
                <p className="truncate text-sm font-semibold text-navy">CoA Assistant</p>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => {
                  setSidebarMode("new");
                  setPhase("upload");
                  setSidebarJobId(null);
                  setSelectedParam(null);
                  setMenuView("new");
                }}
                className={`flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-sm font-semibold transition ${
                  sidebarMode === "new"
                    ? "border-brand-blue bg-brand-blue text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New CoA
              </button>
              <button
                type="button"
                onClick={() => {
                  setSidebarMode("recent");
                  setPhase("recent");
                  setSidebarJobId(null);
                  setSelectedParam(null);
                  setMenuView("recent");
                }}
                className={`flex w-full items-center gap-3 rounded-[20px] border px-4 py-3 text-sm font-semibold transition ${
                  sidebarMode === "recent"
                    ? "border-brand-blue bg-brand-blue text-white shadow-sm"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-white"
                }`}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5 flex-none" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12h18M3 6h18M7 18h10" />
                </svg>
                Recent CoA
              </button>
            </div>

          </aside>

          <section className={`min-w-0 ${phase === "upload" || phase === "processing" ? "flex min-h-0 flex-1 flex-col" : "space-y-6"}`}>
            {phase === "processing" ? (
              <div className="flex min-h-0 flex-1 flex-col lg:min-h-[calc(100dvh-5.5rem)]">
                <ProgressBar
                  progress={status.progress}
                  stage={status.stage}
                  label={status.stageLabel}
                  stages={status.stages}
                  fileName={coaUpload.fileName}
                />
              </div>
            ) : phase === "results" ? (
              <div className="space-y-6">
                {loading || !data ? (
                  <div className="flex min-h-[180px] items-center justify-center rounded-lg border border-dashed border-slate-200 bg-white text-sm text-brand-slate">
                    Preparing results…
                  </div>
                ) : (
                  <>
                    <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
                      <div className="space-y-4">
                        {sidebarMode === "recent" ? (
                          <button
                            type="button"
                            onClick={() => setPhase("recent")}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-white"
                          >
                            <span aria-hidden="true">←</span>
                            Back to recent list
                          </button>
                        ) : null}
                        <OverallStatus
                          status={data.overall_status}
                          productName={data.product_match.matched_product}
                          filename={data.filename}
                          matchScore={data.product_match.match_score}
                        />
                      </div>
                      <div className="xl:ml-auto">
                        <ExportButtons jobId={data.id} />
                      </div>
                    </div>
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
            ) : sidebarMode === "recent" ? (
              <div className="space-y-5">
                <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-card">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Recent CoA</p>
                      <h2 className="mt-3 text-xl font-semibold text-navy">Latest assessments</h2>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                      Updated
                    </span>
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-500">
                    Continue from any recent Certificate of Analysis result, or open one for a detailed review.
                  </p>
                </div>
                <RecentSubmissions
                  activeId={activeJobId}
                  onSelect={handleSidebarSelect}
                  className="min-h-[420px]"
                />
              </div>
            ) : (
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
          </section>
        </div>
      </main>
    </div>
  );
}