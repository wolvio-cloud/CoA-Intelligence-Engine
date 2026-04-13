"use client";

import { useEffect, useMemo, useState } from "react";
import type { PipelineStage } from "@/lib/types";

const PIPELINE_STAGES: Exclude<PipelineStage, "idle">[] = [
  "intake",
  "extract",
  "validate",
  "store",
  "complete",
];

const STAGE_LABELS: Record<Exclude<PipelineStage, "idle">, string> = {
  intake: "Intake & checksum",
  extract: "Vision + structured extract",
  validate: "Spec compare & matching",
  store: "Persist evidence package",
  complete: "Ready for QP review",
};

/** Time each pipeline step stays visible before advancing (expo-friendly pacing). */
const MS_PER_STAGE = 3000;

export function useCoaStatus(active: boolean) {
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => {
    if (!active) {
      setStageIndex(0);
      return;
    }
    setStageIndex(0);
    const id = window.setInterval(() => {
      setStageIndex((prev) => {
        if (prev >= PIPELINE_STAGES.length - 1) {
          window.clearInterval(id);
          return prev;
        }
        return prev + 1;
      });
    }, MS_PER_STAGE);
    return () => window.clearInterval(id);
  }, [active]);

  const stage = useMemo((): PipelineStage => {
    if (!active) return "idle";
    return PIPELINE_STAGES[Math.min(stageIndex, PIPELINE_STAGES.length - 1)];
  }, [active, stageIndex]);

  const progress = active
    ? Math.round((Math.min(stageIndex, PIPELINE_STAGES.length - 1) / (PIPELINE_STAGES.length - 1)) * 100)
    : 0;

  const isComplete = active && stage === "complete";

  return {
    stage,
    progress,
    isComplete,
    stages: PIPELINE_STAGES,
    stageLabel: stage === "idle" ? "Idle" : STAGE_LABELS[stage],
  };
}