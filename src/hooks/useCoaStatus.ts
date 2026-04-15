"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchStatus } from "@/lib/api";
import type { PipelineStage } from "@/lib/types";

const STAGE_LABELS: Record<Exclude<PipelineStage, "idle">, string> = {
  intake: "Intake & checksum",
  extract: "Vision + structured extract",
  validate: "Spec compare & matching",
  store: "Persist evidence package",
  complete: "Ready for QP review",
};

function mapStatusToStage(status: string, progress: number): PipelineStage {
  if (status === "pending") return "intake";
  if (status === "processing") {
    if (progress >= 90) return "store";
    if (progress >= 65) return "validate";
    if (progress >= 35) return "extract";
    return "intake";
  }
  if (status === "completed" || status === "failed") return "complete";
  return "idle";
}

export function useCoaStatus(jobId: string | null, active: boolean) {
  const [stage, setStage] = useState<PipelineStage>("idle");
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!active || !jobId) {
      setStage("idle");
      setProgress(0);
      setIsComplete(false);
      return;
    }

    let cancelled = false;
    const requestId = jobId;

    async function update() {
      try {
        const data = await fetchStatus(requestId);
        if (cancelled) return;
        setProgress(data.progress);
        setStage(mapStatusToStage(data.status, data.progress));
        setIsComplete(data.status === "completed" || data.status === "failed");
      } catch (error) {
        console.error("Failed to refresh CoA status:", error);
      }
    }

    update();
    const intervalId = window.setInterval(update, 2000);
    return () => {
      cancelled = true;
      window.clearInterval(intervalId);
    };
  }, [active, jobId]);

  const stages = useMemo<Exclude<PipelineStage, "idle">[]>(() => ["intake", "extract", "validate", "store", "complete"], []);

  return {
    stage,
    progress,
    isComplete,
    stages,
    stageLabel: stage === "idle" ? "Idle" : STAGE_LABELS[stage],
  };
}
