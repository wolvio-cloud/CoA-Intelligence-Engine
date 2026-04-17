"use client";

import type { PipelineStage } from "@/lib/types";
import { brandColors } from "@/config/brand";

const STEP_COPY: Record<
  string,
  {
    title: string;
    detail: string;
    short: string;
  }
> = {
  queue: {
    title: "Queue",
    detail: "File is being received and lined up for the pipeline.",
    short: "Queue",
  },
  intake: {
    title: "Intake & checksum",
    detail: "File received, format check, and secure handoff to the pipeline.",
    short: "Intake",
  },
  extract: {
    title: "Structured extraction",
    detail: "Layout detection and field-level read of CoA tables and narratives.",
    short: "Extract",
  },
  validate: {
    title: "Specification validation",
    detail: "Compare observed values to release limits and product identity rules.",
    short: "Validate",
  },
  store: {
    title: "Evidence package",
    detail: "Persist structured results and audit metadata for review.",
    short: "Store",
  },
  complete: {
    title: "Ready for review",
    detail: "Summary and parameter workspace are available.",
    short: "Done",
  },
};

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2.5 6L5 8.5L9.5 3.5"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type SegmentState = "done" | "active" | "pending";

function PipelineStepRail({
  stages,
  activeIndex,
  forceFlowOnFirstSegment,
}: {
  stages: PipelineStage[];
  activeIndex: number;
  /** During browser upload, show motion on the first connector (before API stages advance). */
  forceFlowOnFirstSegment?: boolean;
}) {
  const idx = Math.max(0, Math.min(activeIndex, stages.length - 1));

  return (
    <div className="flex min-h-0 flex-1 flex-col justify-center pt-2 sm:pt-3">
      <p className="mb-5 text-center text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400 sm:text-xs">
        Pipeline stages
      </p>
      <div className="flex w-full items-center justify-center px-1 sm:px-4">
        {stages.flatMap((s, i) => {
          const done = i < idx;
          const current = i === idx;
          const copy = STEP_COPY[s] ?? { short: s };

          const segDone = idx > i;
          const segActive = idx === i;
          let segState: SegmentState = "pending";
          if (segDone) segState = "done";
          else if (segActive) segState = "active";

          const node = (
            <div
              key={s}
              className="flex min-w-0 flex-1 max-w-[6rem] shrink-0 flex-col items-center sm:max-w-[7rem]"
            >
              <div
                className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:h-11 sm:w-11 sm:text-xs ${
                  done
                    ? "scale-100 border-navy bg-navy text-white shadow-sm"
                    : current
                      ? "scale-[1.07] border-brand-blue bg-white text-brand-blue shadow-md animate-coa-ring-pulse"
                      : "scale-100 border-slate-200/90 bg-slate-50 text-slate-400"
                }`}
                style={current ? { borderColor: brandColors.blue, color: brandColors.blue } : undefined}
              >
                {done ? (
                  <CheckIcon className="h-4 w-4 sm:h-[1.05rem] sm:w-[1.05rem] transition-transform duration-300" />
                ) : current ? (
                  <span
                    className="h-2.5 w-2.5 animate-coa-orbit-dot rounded-full sm:h-3 sm:w-3"
                    style={{ backgroundColor: brandColors.blue }}
                  />
                ) : (
                  <span className="tabular-nums">{i + 1}</span>
                )}
              </div>
              <span
                className={`mt-2.5 w-full truncate text-center text-[9px] font-semibold uppercase tracking-[0.06em] transition-colors duration-500 sm:text-[10px] ${
                  current ? "text-navy" : done ? "text-slate-600" : "text-slate-400"
                }`}
              >
                {copy.short}
              </span>
            </div>
          );

          if (i >= stages.length - 1) return [node];

          const showSheen =
            segState === "active" || (forceFlowOnFirstSegment && i === 0 && idx === 0);

          const line = (
            <div
              key={`${s}-seg`}
              className="relative mb-7 h-[3px] min-w-[6px] flex-1 overflow-hidden rounded-full sm:mb-8"
              aria-hidden
            >
              <div
                className={`absolute inset-0 rounded-full transition-colors duration-700 ease-out ${
                  segState === "done" ? "bg-navy/55" : "bg-slate-200/95"
                }`}
              />
              {showSheen ? (
                <div
                  className="pointer-events-none absolute inset-y-0 left-0 w-[45%] animate-coa-line-sheen rounded-full opacity-90 sm:w-[40%]"
                  style={{
                    background: `linear-gradient(90deg, transparent, ${brandColors.blue}cc, transparent)`,
                  }}
                />
              ) : null}
            </div>
          );

          return [node, line];
        })}
      </div>
    </div>
  );
}

export function ProgressBar({
  progress,
  stage,
  label,
  stages,
  fileName,
  awaitingSubmission = false,
  hasJobId = false,
  liveScheduleHint,
  /** Drives the bottom step rail by index (0 = Intake). When set, overrides index-from-`stage`. */
  visualStepIndex,
  /** When true, "complete" still uses the stepper layout instead of the full-screen completion card. */
  suppressCompletionSplash = false,
  /** Only the pipeline step rail (no % bar, queued, or step counter). */
  stepperOnly = false,
}: {
  progress: number;
  stage: PipelineStage;
  label: string;
  stages: PipelineStage[];
  fileName?: string | null;
  awaitingSubmission?: boolean;
  hasJobId?: boolean;
  /** When set, replaces per-stage detail copy during live processing (e.g. time-based stepper). */
  liveScheduleHint?: string;
  visualStepIndex?: number | null;
  suppressCompletionSplash?: boolean;
  stepperOnly?: boolean;
}) {
  const effectiveStage: PipelineStage =
    !awaitingSubmission && stage === "idle" && hasJobId ? "intake" : stage;
  const activeIdx = stages.indexOf(effectiveStage as (typeof stages)[number]);
  const railIndexFromStage = activeIdx < 0 ? 0 : Math.min(activeIdx, stages.length - 1);
  const uploadMode = awaitingSubmission;
  /** Prefer explicit visual index (time-based stepper) even while the browser upload is in flight. */
  const railActiveIndex =
    visualStepIndex != null && Number.isFinite(visualStepIndex)
      ? Math.max(0, Math.min(Math.floor(visualStepIndex), stages.length - 1))
      : uploadMode
        ? 0
        : railIndexFromStage;

  if (stepperOnly) {
    return (
      <div className="relative flex min-h-[min(280px,50dvh)] flex-col justify-center overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 px-4 py-8 shadow-[0_4px_40px_rgba(26,35,50,0.08)] sm:px-8 sm:py-10">
        {fileName ? (
          <p
            className="mx-auto mb-6 max-w-full truncate px-2 text-center text-xs font-medium text-slate-600 sm:text-sm"
            title={fileName}
          >
            {fileName}
          </p>
        ) : null}
        <PipelineStepRail
          stages={stages}
          activeIndex={railActiveIndex}
          forceFlowOnFirstSegment={uploadMode}
        />
      </div>
    );
  }

  const isFinished =
    effectiveStage === "complete" && !awaitingSubmission && !suppressCompletionSplash;
  const currentCopy =
    effectiveStage !== "idle"
      ? STEP_COPY[effectiveStage] ?? { title: label, detail: "", short: label }
      : null;
  const displayLabel = currentCopy?.title ?? "";

  const stageMotionKey = awaitingSubmission ? "upload" : effectiveStage;

  if (isFinished) {
    return (
      <div className="relative flex min-h-[min(520px,70dvh)] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_40px_rgba(26,35,50,0.08)]">
        <div
          className="h-1 w-full shrink-0"
          style={{
            background: `linear-gradient(90deg, transparent, ${brandColors.blue}, transparent)`,
            opacity: 0.65,
          }}
        />
        <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
          <div
            className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-4 text-white shadow-lg"
            style={{ backgroundColor: brandColors.navy, borderColor: `${brandColors.blue}33` }}
          >
            <CheckIcon className="h-9 w-9" />
          </div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-green-700">Completed</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-navy sm:text-3xl">
            Processing complete
          </h2>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-brand-slate sm:text-base">
            All pipeline stages finished successfully. Opening your validation summary…
          </p>
          {fileName ? (
            <p
              className="mt-6 max-w-lg truncate rounded-lg border border-slate-100 bg-brand-light px-4 py-2 text-xs text-navy sm:text-sm"
              title={fileName ?? undefined}
            >
              {fileName}
            </p>
          ) : null}
          <div className="mt-10 h-3 w-full max-w-md overflow-hidden rounded-full bg-brand-light">
            <div
              className="h-full w-full rounded-full transition-all duration-700"
              style={{ backgroundColor: brandColors.blue }}
            />
          </div>
          <p className="mt-3 text-xs font-medium tabular-nums text-brand-slate">100%</p>
          <p className="mt-8 animate-pulse text-sm font-medium text-brand-slate">Loading results…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex max-h-[min(640px,78dvh)] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-white to-slate-50/80 shadow-[0_4px_40px_rgba(26,35,50,0.08)]">
      <div
        className="h-1 w-full shrink-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${brandColors.blue}, transparent)`,
          opacity: 0.65,
        }}
      />

      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6 lg:p-8">
        <div className="shrink-0 border-b border-slate-100/90 pb-5 sm:pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">
            {uploadMode ? "Secure upload" : "Live pipeline"}
          </p>
          <div key={stageMotionKey} className="animate-coa-stage-enter">
            <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-navy sm:text-2xl">
              {uploadMode ? "Sending your file to the server" : displayLabel}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-snug text-brand-slate sm:text-[15px]">
              {uploadMode
                ? "Your browser is uploading the document; the API stores it in Supabase. When the upload completes, the pipeline stepper starts on a fixed schedule."
                : liveScheduleHint ?? currentCopy?.detail ?? ""}
            </p>
          </div>
          {fileName ? (
            <p
              className="mt-3 truncate rounded-lg border border-slate-100 bg-white px-3 py-1.5 text-xs text-navy shadow-sm sm:text-sm"
              title={fileName}
            >
              {fileName}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tabular-nums tracking-tight text-navy transition-all duration-700 ease-out sm:text-5xl">
                {uploadMode ? "—" : progress}
              </span>
              {!uploadMode ? (
                <span className="pb-1 text-lg font-medium text-brand-slate">%</span>
              ) : (
                <span className="pb-1 text-sm font-medium text-slate-400">queued</span>
              )}
            </div>
            <span className="pb-1 text-xs font-medium text-brand-slate sm:text-sm">
              Step {Math.min(railActiveIndex + 1, stages.length)} of {stages.length}
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-200/80 sm:h-3">
            {uploadMode ? (
              <div className="relative h-full w-full overflow-hidden rounded-full bg-slate-100">
                <div className="absolute left-0 top-0 h-full w-[38%] rounded-full bg-brand-blue animate-coa-upload-bar" />
              </div>
            ) : (
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  width: `${progress}%`,
                  background: `linear-gradient(90deg, ${brandColors.navy}, ${brandColors.blue})`,
                }}
              />
            )}
          </div>
          {uploadMode ? (
            <p className="mt-2 text-xs text-slate-500">Large PDFs or slow networks may extend this step.</p>
          ) : null}
        </div>

        <PipelineStepRail
          stages={stages}
          activeIndex={railActiveIndex}
          forceFlowOnFirstSegment={uploadMode}
        />
      </div>
    </div>
  );
}
