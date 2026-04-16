"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchResult } from "@/lib/api";
import type { CoaJobResult } from "@/lib/types";

export function useCoaResult(jobId: string | null, shouldLoad: boolean) {
  const q = useQuery({
    queryKey: ["coa-result", jobId],
    queryFn: () => fetchResult(jobId!),
    enabled: Boolean(shouldLoad && jobId),
    staleTime: 60_000,
  });

  return {
    data: (q.data ?? null) as CoaJobResult | null,
    loading: q.isLoading,
    error: q.error instanceof Error ? q.error.message : null,
  };
}
