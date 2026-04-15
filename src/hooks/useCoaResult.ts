"use client";

import { useEffect, useState } from "react";
import { fetchResult } from "@/lib/api";
import type { CoaJobResult } from "@/lib/types";

export function useCoaResult(jobId: string | null, shouldLoad: boolean) {
  const [data, setData] = useState<CoaJobResult | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!shouldLoad || !jobId) {
      setData(null);
      return;
    }
    const requestId = jobId;
    let cancelled = false;
    setLoading(true);
    setData(null);

    fetchResult(requestId)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((error) => {
        console.error("Failed to load CoA result:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [jobId, shouldLoad]);

  return { data, loading };
}
