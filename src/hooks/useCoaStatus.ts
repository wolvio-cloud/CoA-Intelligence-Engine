"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStatus } from "@/lib/api";
import type { PipelineStage } from "@/lib/types";

const STAGE_LABELS: Record<Exclude<PipelineStage, "idle">, string> = {
  intake: "Intake & checksum",
  extract: "Vision + structured extract",
  validate: "Spec compare & matching",
  store: "Persist evidence package",
  complete: "Ready for QP review",
};

export function useCoaStatus(jobId: string | null, active: boolean) {
  const q = useQuery({
    queryKey: ["coa-status", jobId],
    queryFn: () => fetchStatus(jobId!),
    enabled: Boolean(active && jobId),
    refetchInterval: active && jobId ? 550 : false,
  });

  const data = q.data;
  const waitingFirstStatus = Boolean(jobId && active && !data && !q.isError);
  const stage = data?.stage ?? (waitingFirstStatus ? "intake" : ("idle" as PipelineStage));
  const progress = data?.progress ?? (waitingFirstStatus ? 10 : 0);
  const isComplete = data ? data.status === "completed" || data.status === "failed" : false;
  const apiStatus = data?.status ?? null;
  const errorMessage = data?.error_message ?? null;
  const hasFailed = apiStatus === "failed";

  const stages = useMemo<Exclude<PipelineStage, "idle">[]>(
    () => ["intake", "extract", "validate", "store", "complete"],
    [],
  );

  return {
    stage,
    progress,
    isComplete,
    stages,
    stageLabel: stage === "idle" ? "Idle" : STAGE_LABELS[stage],
    apiStatus,
    errorMessage,
    hasFailed,
    pipelineStage: data?.pipeline_stage ?? null,
    isLoading: q.isLoading,
    fetchError: q.error instanceof Error ? q.error.message : null,
  };
}
