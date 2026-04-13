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

export function ProgressBar({
  progress,
  stage,
  label,
  stages,
  fileName,
}: {
  progress: number;
  stage: PipelineStage;
  label: string;
  stages: PipelineStage[];
  fileName?: string | null;
}) {
  const activeIdx = stages.indexOf(stage as (typeof stages)[number]);
  const isFinished = stage === "complete";
  const currentCopy =
    stage !== "idle" ? STEP_COPY[stage] ?? { title: label, detail: "", short: label } : null;
  const displayLabel = currentCopy?.title ?? "";

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
    <div className="relative flex max-h-[min(640px,78dvh)] flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-[0_4px_40px_rgba(26,35,50,0.08)]">
      <div
        className="h-1 w-full shrink-0"
        style={{
          background: `linear-gradient(90deg, transparent, ${brandColors.blue}, transparent)`,
          opacity: 0.65,
        }}
      />

      <div className="flex min-h-0 flex-1 flex-col p-5 sm:p-6 lg:p-8">
        <div className="shrink-0 border-b border-slate-100 pb-5 sm:pb-6">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-blue">Processing</p>
          <h2 className="mt-1.5 text-xl font-semibold tracking-tight text-navy sm:text-2xl">
            {displayLabel}
          </h2>
          {currentCopy?.detail ? (
            <p className="mt-2 line-clamp-2 text-sm leading-snug text-brand-slate sm:text-[15px]">
              {currentCopy.detail}
            </p>
          ) : null}
          {fileName ? (
            <p
              className="mt-3 truncate rounded-md border border-slate-100 bg-brand-light px-3 py-1.5 text-xs text-navy sm:text-sm"
              title={fileName}
            >
              {fileName}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-end justify-between gap-3">
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-semibold tabular-nums tracking-tight text-navy sm:text-5xl">
                {progress}
              </span>
              <span className="pb-1 text-lg font-medium text-brand-slate">%</span>
            </div>
            <span className="pb-1 text-xs font-medium text-brand-slate sm:text-sm">
              Step {Math.min(activeIdx + 1, stages.length)} of {stages.length}
            </span>
          </div>

          <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-brand-light sm:h-3">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width:` ${progress}%`,
                backgroundColor: brandColors.blue,
              }}
            />
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col justify-center pt-4 sm:pt-5">
          <p className="mb-4 text-center text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-slate sm:text-xs">
            Pipeline
          </p>
          <div className="flex w-full items-center justify-center px-1 sm:px-3">
            {stages.flatMap((s, i) => {
              const done = i < activeIdx;
              const current = i === activeIdx;
              const copy = STEP_COPY[s] ?? { short: s };

              const node = (
                <div
                  key={s}
                  className="flex w-[18%] max-w-[4.5rem] min-w-[3.25rem] shrink-0 flex-col items-center sm:max-w-[5.5rem]"
                >
                  <div
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-colors sm:h-10 sm:w-10 sm:text-xs ${
                      done
                        ? "border-navy bg-navy text-white"
                        : current
                          ? "border-brand-blue bg-white text-brand-blue shadow-[0_0_0_3px_rgba(37,99,235,0.12)]"
                          : "border-slate-200 bg-brand-light text-slate-400"
                    }`}
                    style={current ? { borderColor: brandColors.blue, color: brandColors.blue } : undefined}
                  >
                    {done ? (
                      <CheckIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    ) : current ? (
                      <span
                        className="h-2.5 w-2.5 animate-pulse rounded-full sm:h-3 sm:w-3"
                        style={{ backgroundColor: brandColors.blue }}
                      />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`mt-2 w-full truncate text-center text-[9px] font-semibold uppercase tracking-wide sm:text-[10px] ${
                      current ? "text-navy" : done ? "text-brand-slate" : "text-slate-400"
                    }`}
                  >
                    {copy.short}
                  </span>
                </div>
              );

              if (i >= stages.length - 1) return [node];
              const line = (
                <div
                  key={`${s}-seg`}
                  className={`mb-6 h-1 min-w-[4px] flex-1 rounded-full sm:mb-7 ${
                    i < activeIdx ? "bg-navy/45" : "bg-slate-200"
                  }`}
                  aria-hidden
                />
              );
              return [node, line];
            })}
          </div>
        </div>
      </div>
    </div>
  );
}